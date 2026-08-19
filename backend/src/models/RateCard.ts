import mongoose, { Schema, Document } from 'mongoose';

export interface IRateCard extends Document {
  sourceZoneId: mongoose.Types.ObjectId;
  destZoneId: mongoose.Types.ObjectId;
  orderType: 'B2B' | 'B2C';
  baseRate: number;
  ratePerKg: number;
  codSurcharge: number;
}

const RateCardSchema: Schema = new Schema(
  {
    sourceZoneId: { type: Schema.Types.ObjectId, ref: 'Zone', required: true },
    destZoneId: { type: Schema.Types.ObjectId, ref: 'Zone', required: true },
    orderType: { type: String, enum: ['B2B', 'B2C'], required: true },
    baseRate: { type: Number, required: true },
    ratePerKg: { type: Number, required: true },
    codSurcharge: { type: Number, default: 0.0 },
  },
  { timestamps: true }
);

// Prevent duplicate entries for same source, dest, and orderType
RateCardSchema.index({ sourceZoneId: 1, destZoneId: 1, orderType: 1 }, { unique: true });

export default mongoose.model<IRateCard>('RateCard', RateCardSchema);
