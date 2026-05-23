import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IResolution extends Document {
  title: string;
  content: string;
  date: Date;
  fileUrl?: string;
  recordedBy: mongoose.Types.ObjectId;
  meetingDate?: Date;
  agenda?: string;
  attendees?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ResolutionSchema: Schema<IResolution> = new Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    date: { type: Date, required: true, default: Date.now },
    fileUrl: String,
    recordedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    meetingDate: { type: Date },
    agenda: { type: String },
    attendees: { type: String },
  },
  { timestamps: true }
);

const Resolution: Model<IResolution> = 
  mongoose.models.Resolution || 
  mongoose.model<IResolution>('Resolution', ResolutionSchema);

export default Resolution;
