import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectToDatabase from './lib/db';
import User from './models/User';
import bcrypt from 'bcryptjs';

import authConfig from './auth.config';

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    ...authConfig.providers,
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please provide both email and password.');
        }

        await connectToDatabase();
        const user = await User.findOne({ email: credentials.email }).select('+password');

        if (!user || !user.password) {
          throw new Error('No user found with this email on this store.');
        }

        const isPasswordValid = await bcrypt.compare(credentials.password as string, user.password);

        if (!isPasswordValid) {
          throw new Error('Invalid credentials.');
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          phone: user.phone,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger, session }) {
      // 1. First, apply base logic from authConfig
      if (user) {
        token.id = user.id;
        token.role = (user as any).role ?? 'user';
        token.image = user.image || token.picture;
      }

      // 2. Add DB-specific logic
      const email = token.email || user?.email;
      if (user && email) {
        try {
          await connectToDatabase();
          const dbUser = await User.findOne({ email });
          if (dbUser) {
            // Auto update super_admin role in DB if it's not set
            if (dbUser.email === 'imranshuvo101@gmail.com' && dbUser.role !== 'super_admin') {
              dbUser.role = 'super_admin';
              await dbUser.save();
            }
            token.id = dbUser._id.toString();
            token.role = dbUser.role ?? 'user';
            token.status = dbUser.status ?? 'active';
            token.phone = dbUser.phone;
            token.image = dbUser.image || user.image || token.picture;
          }
        } catch (error) {
          console.error("JWT DB Enhancement Error:", error);
        }
      }

      if (trigger === 'update') {
        if (session?.name !== undefined) token.name = session.name;
        if (session?.image !== undefined) token.image = session.image;
      }
      
      if (token.email === 'imranshuvo101@gmail.com') {
        token.role = 'super_admin';
      }
      
      return token;
    },
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        if (!user.email) return false;
        
        try {
          await connectToDatabase();
          const isSuperAdmin = user.email === 'imranshuvo101@gmail.com';
          let dbUser = await User.findOne({ email: user.email });
          
          if (!dbUser) {
            dbUser = new User({
              name: user.name || 'Unknown',
              email: user.email,
              image: user.image || '',
              googleId: account.providerAccountId,
              role: isSuperAdmin ? 'super_admin' : 'user',
              status: 'active',
              phone: 'N/A'
            });
            await dbUser.save();
            
            // Set phone to a unique value to avoid duplicate key index conflict in Farmer profile
            dbUser.phone = `G-${dbUser._id.toString().slice(-8)}`;
            await dbUser.save();
          } else {
            dbUser.name = user.name || dbUser.name;
            dbUser.image = user.image || dbUser.image;
            dbUser.googleId = account.providerAccountId;
            if (isSuperAdmin) {
              dbUser.role = 'super_admin';
            }
            await dbUser.save();
          }

          if (dbUser) {
            user.id = dbUser._id.toString();
            if (dbUser.email === 'imranshuvo101@gmail.com') {
              (user as any).role = 'super_admin';
            }
            
            // Auto create Farmer profile for the user
            if (dbUser.role === 'farmer') {
              const Farmer = (await import('./models/Farmer')).default;
              const existingFarmer = await Farmer.findOne({ phone: dbUser.phone });
              if (!existingFarmer) {
                await Farmer.create({
                  name: dbUser.name,
                  phone: dbUser.phone,
                  address: {
                    village: '',
                    division: '',
                    thana: '',
                    district: ''
                  },
                  cattleCount: 0,
                  purchaseCount: 0,
                  totalPurchasedQty: 0,
                  creditLimit: 0,
                  currentDues: 0
                });
              }
            }
          }
          return true;
        } catch (error) {
          console.error('Error in Google signIn:', error);
          return true;
        }
      }
      return true;
    },
  },
});
