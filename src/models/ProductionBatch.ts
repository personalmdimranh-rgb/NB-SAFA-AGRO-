import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IRawMaterialUsed {
  materialName: string;
  quantity: number;
  cost: number;
}

export interface IProductionBatch extends Document {
  batchNumber: string;
  rawMaterialsUsed: IRawMaterialUsed[];
  totalProducedQty: number;
  productionCostPerUnit: number;
  productionDate: Date;
  warehouseLocation?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductionBatchSchema: Schema<IProductionBatch> = new Schema(
  {
    batchNumber: { type: String, required: true, unique: true },
    rawMaterialsUsed: [
      {
        materialName: String,
        quantity: Number,
        cost: Number
      }
    ],
    totalProducedQty: { type: Number, required: true },
    productionCostPerUnit: { type: Number, required: true },
    productionDate: { type: Date, required: true, default: Date.now },
    warehouseLocation: String
  },
  { timestamps: true }
);

const ProductionBatch: Model<IProductionBatch> = 
  mongoose.models.ProductionBatch || 
  mongoose.model<IProductionBatch>('ProductionBatch', ProductionBatchSchema);

export default ProductionBatch;
