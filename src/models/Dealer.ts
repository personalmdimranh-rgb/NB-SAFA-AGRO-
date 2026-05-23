import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IDealer extends Document {
  userId: mongoose.Types.ObjectId;
  shopName: string;
  address: {
    village?: string;
    union?: string;
    thana?: string;
    district?: string;
  };
  tradeLicense?: string;
  nidNumber?: string;
  commissionRate: number;
  commissionWallet: number;
  totalSalesCount: number;
  creditLimit: number;
  currentDues: number;
  createdAt: Date;
  updatedAt: Date;
}

const DealerSchema: Schema<IDealer> = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    shopName: { type: String, required: true },
    address: {
      village: String,
      union: String,
      thana: String,
      district: String
    },
    tradeLicense: String,
    nidNumber: String,
    commissionRate: { type: Number, default: 0 },
    commissionWallet: { type: Number, default: 0 },
    totalSalesCount: { type: Number, default: 0 },
    creditLimit: { type: Number, default: 0 },
    currentDues: { type: Number, default: 0 }
  },
  { timestamps: true }
);

const Dealer: Model<IDealer> = mongoose.models.Dealer || mongoose.model<IDealer>('Dealer', DealerSchema);

export default Dealer;
