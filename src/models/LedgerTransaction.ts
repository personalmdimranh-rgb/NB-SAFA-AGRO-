import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ILedgerTransaction extends Document {
  date: Date;
  type: 'income' | 'expense' | 'transfer';
  source: 'cash' | 'bank';
  bankDetails?: {
    bankName?: string;
    accountNo?: string;
  };
  category: string;
  amount: number;
  description?: string;
  voucherImage?: string;
  recordedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const LedgerTransactionSchema: Schema<ILedgerTransaction> = new Schema(
  {
    date: { type: Date, required: true, default: Date.now },
    type: { type: String, enum: ['income', 'expense', 'transfer'], required: true },
    source: { type: String, enum: ['cash', 'bank'], required: true },
    bankDetails: {
      bankName: String,
      accountNo: String
    },
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    description: String,
    voucherImage: String,
    recordedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

const LedgerTransaction: Model<ILedgerTransaction> = 
  mongoose.models.LedgerTransaction || 
  mongoose.model<ILedgerTransaction>('LedgerTransaction', LedgerTransactionSchema);

export default LedgerTransaction;
