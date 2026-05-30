'use server';

import connectToDatabase from '@/lib/db';
import TeamMember from '@/models/TeamMember';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

export async function createTeamMember(data: {
  name: string;
  role: string;
  desc?: string;
  bio?: string;
  image: string;
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  order: number;
}) {
  const session = await auth();
  if (!session || !['super_admin', 'admin'].includes((session.user as any).role)) {
    throw new Error('Unauthorized');
  }

  await connectToDatabase();

  const member = new TeamMember({
    name: data.name,
    role: data.role,
    desc: data.desc || '',
    bio: data.bio || '',
    image: data.image,
    facebook: data.facebook || '',
    twitter: data.twitter || '',
    linkedin: data.linkedin || '',
    order: data.order ?? 0,
    updatedBy: session?.user?.name || 'System',
  });

  await member.save();
  revalidatePath('/team');
  return { success: true, member: JSON.parse(JSON.stringify(member)) };
}

export async function updateTeamMember(
  id: string,
  data: {
    name?: string;
    role?: string;
    desc?: string;
    bio?: string;
    image?: string;
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    order?: number;
  }
) {
  const session = await auth();
  if (!session || !['super_admin', 'admin'].includes((session.user as any).role)) {
    throw new Error('Unauthorized');
  }

  await connectToDatabase();

  const member = await TeamMember.findById(id);
  if (!member) throw new Error('Team member not found');

  if ('name' in data && data.name !== undefined) member.name = data.name;
  if ('role' in data && data.role !== undefined) member.role = data.role;
  if ('image' in data && data.image !== undefined) member.image = data.image;
  if ('order' in data && data.order !== undefined) member.order = data.order;
  if ('desc' in data && data.desc !== undefined) member.desc = data.desc;
  if ('bio' in data && data.bio !== undefined) member.bio = data.bio;
  if ('facebook' in data && data.facebook !== undefined) member.facebook = data.facebook;
  if ('twitter' in data && data.twitter !== undefined) member.twitter = data.twitter;
  if ('linkedin' in data && data.linkedin !== undefined) member.linkedin = data.linkedin;
  member.updatedBy = session?.user?.name || 'System';

  await member.save();
  revalidatePath('/team');
  return { success: true, member: JSON.parse(JSON.stringify(member)) };
}

export async function deleteTeamMember(id: string) {
  const session = await auth();
  if (!session || !['super_admin', 'admin'].includes((session.user as any).role)) {
    throw new Error('Unauthorized');
  }

  await connectToDatabase();

  const res = await TeamMember.findByIdAndDelete(id);
  if (!res) throw new Error('Team member not found');

  revalidatePath('/team');
  return { success: true };
}

export async function getTeamMembers() {
  await connectToDatabase();
  const members = await TeamMember.find().sort({ order: 1, createdAt: -1 });
  return JSON.parse(JSON.stringify(members));
}
