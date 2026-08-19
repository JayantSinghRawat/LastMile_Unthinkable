import mongoose, { Schema, Document } from 'mongoose';

export interface IZone extends Document {
  name: string;
  areas: string[];
}

const ZoneSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    areas: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model<IZone>('Zone', ZoneSchema);
