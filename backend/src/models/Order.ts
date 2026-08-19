import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderHistory {
  status: 'CREATED' | 'ASSIGNED' | 'PICKED_UP' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'FAILED';
  actorId: mongoose.Types.ObjectId;
  remarks?: string;
  timestamp: Date;
}

export interface IOrder extends Document {
  customerId: mongoose.Types.ObjectId;
  agentId?: mongoose.Types.ObjectId;
  
  pickupAddress: string;
  pickupLocation: {
    lat: number;
    lng: number;
  };
  dropAddress: string;
  dropLocation: {
    lat: number;
    lng: number;
  };
  
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  actualWeight: number;
  volumetricWt: number;
  billableWeight: number;
  
  orderType: 'B2B' | 'B2C';
  paymentType: 'PREPAID' | 'COD';
  totalCharge: number;
  
  status: 'CREATED' | 'ASSIGNED' | 'PICKED_UP' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'FAILED';
  scheduledDate?: Date;
  
  history: IOrderHistory[];
  createdAt: Date;
  updatedAt: Date;
}

const OrderHistorySchema = new Schema({
  status: { 
    type: String, 
    enum: ['CREATED', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED'], 
    required: true 
  },
  actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  remarks: { type: String },
  timestamp: { type: Date, default: Date.now }
});

const OrderSchema: Schema = new Schema(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    agentId: { type: Schema.Types.ObjectId, ref: 'User' },
    
    pickupAddress: { type: String, required: true },
    pickupLocation: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    dropAddress: { type: String, required: true },
    dropLocation: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    
    dimensions: {
      length: { type: Number, required: true },
      width: { type: Number, required: true },
      height: { type: Number, required: true }
    },
    actualWeight: { type: Number, required: true },
    volumetricWt: { type: Number, required: true },
    billableWeight: { type: Number, required: true },
    
    orderType: { type: String, enum: ['B2B', 'B2C'], required: true },
    paymentType: { type: String, enum: ['PREPAID', 'COD'], required: true },
    totalCharge: { type: Number, required: true },
    
    status: { 
      type: String, 
      enum: ['CREATED', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED'], 
      default: 'CREATED' 
    },
    scheduledDate: { type: Date },
    
    history: [OrderHistorySchema]
  },
  { timestamps: true }
);

export default mongoose.model<IOrder>('Order', OrderSchema);
