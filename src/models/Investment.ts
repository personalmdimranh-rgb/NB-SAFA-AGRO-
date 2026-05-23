import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IInvestment extends Document {
  directorId: mongoose.Types.ObjectId;
  investmentAmount: number;
  date: Date;
  equitySharePercentage: number;
  paymentMethod?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InvestmentSchema: Schema<IInvestment> = new Schema(
  {
    directorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    investmentAmount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    equitySharePercentage: { type: Number, required: true },
    paymentMethod: String,
    notes: String
  },
  { timestamps: true }
);

const Investment: Model<IInvestment> = 
  mongoose.models.Investment || 
  mongoose.model<IInvestment>('Investment', InvestmentSchema);

export default Investment;
