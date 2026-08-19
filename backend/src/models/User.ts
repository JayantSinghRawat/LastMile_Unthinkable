import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  name: string;
  role: 'ADMIN' | 'AGENT' | 'CUSTOMER';
  agentStatus?: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
  currentLocation?: {
    lat: number;
    lng: number;
  };
  activeZoneId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['ADMIN', 'AGENT', 'CUSTOMER'], default: 'CUSTOMER' },
    agentStatus: { type: String, enum: ['AVAILABLE', 'BUSY', 'OFFLINE'], default: 'OFFLINE' },
    currentLocation: {
      lat: { type: Number },
      lng: { type: Number },
    },
    activeZoneId: { type: Schema.Types.ObjectId, ref: 'Zone' },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);
