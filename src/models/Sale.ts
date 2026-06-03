import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ISaleItem {
  productName: string;
  productType?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ISale extends Document {
  invoiceNumber: string;
  buyerType: 'dealer' | 'farmer';
  buyerId: mongoose.Types.ObjectId;
  items: ISaleItem[];
  subtotal: number;
  discount: number;
  commissionApplied: number;
  grandTotal: number;
  paidAmount: number;
  dueAmount: number;
  paymentStatus: 'paid' | 'partially-paid' | 'unpaid';
  paymentMethod: 'cash' | 'bank-transfer' | 'bkash' | 'nagad' | 'cod' | 'due';
  estimatedPaymentDate?: Date;
  paymentNumber?: string;
  transactionNumber?: string;
  bankName?: string;
  distributionDistrict: string;
  status?: 'pending' | 'approved' | 'ready to deliver' | 'release to deliver' | 'delivery complete' | 'cancel';
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SaleSchema: Schema<ISale> = new Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    buyerType: { type: String, enum: ['dealer', 'farmer'], required: true },
    buyerId: { type: Schema.Types.ObjectId, required: true },
    items: [
      {
        productName: { type: String, required: true },
        productType: { type: String },
        quantity: { type: Number, required: true },
        unitPrice: { type: Number, required: true },
        totalPrice: { type: Number, required: true }
      }
    ],
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    commissionApplied: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    dueAmount: { type: Number, default: 0 },
    paymentStatus: { type: String, enum: ['paid', 'partially-paid', 'unpaid'], required: true },
    paymentMethod: { type: String, enum: ['cash', 'bank-transfer', 'bkash', 'nagad', 'cod', 'due'], required: true },
    estimatedPaymentDate: { type: Date },
    paymentNumber: { type: String },
    transactionNumber: { type: String },
    bankName: { type: String },
    distributionDistrict: { type: String, required: true },
    status: { 
      type: String, 
      enum: ['pending', 'approved', 'ready to deliver', 'release to deliver', 'delivery complete', 'cancel'], 
      default: 'pending' 
    },
    date: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const Sale: Model<ISale> = mongoose.models.Sale || mongoose.model<ISale>('Sale', SaleSchema);

export default Sale;
