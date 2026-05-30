import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IFarmer extends Document {
  name: string;
  phone: string;
  address: {
    village?: string;
    division?: string;
    thana?: string;
    district?: string;
  };
  cattleCount: number;
  purchaseCount: number;
  totalPurchasedQty: number;
  creditLimit: number;
  currentDues: number;
  createdAt: Date;
  updatedAt: Date;
}

const FarmerSchema: Schema<IFarmer> = new Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    address: {
      village: String,
      division: String,
      thana: String,
      district: String
    },
    cattleCount: { type: Number, default: 0 },
    purchaseCount: { type: Number, default: 0 },
    totalPurchasedQty: { type: Number, default: 0 },
    creditLimit: { type: Number, default: 0 },
    currentDues: { type: Number, default: 0 }
  },
  { timestamps: true }
);

const Farmer: Model<IFarmer> = 
  mongoose.models.Farmer || 
  mongoose.model<IFarmer>('Farmer', FarmerSchema);

export default Farmer;
