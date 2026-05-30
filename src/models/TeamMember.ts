import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ITeamMember extends Document {
  name: string;
  role: string;
  desc?: string;
  bio?: string;
  image: string;
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  order: number;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TeamMemberSchema: Schema<ITeamMember> = new Schema(
  {
    name: { type: String, required: true },
    role: { type: String, required: true },
    desc: { type: String },
    bio: { type: String },
    image: { type: String, required: true },
    facebook: { type: String, default: '' },
    twitter: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    order: { type: Number, default: 0 },
    updatedBy: { type: String, default: 'System' },
  },
  { timestamps: true }
);

const TeamMember: Model<ITeamMember> =
  mongoose.models.TeamMember ||
  mongoose.model<ITeamMember>('TeamMember', TeamMemberSchema);

export default TeamMember;
