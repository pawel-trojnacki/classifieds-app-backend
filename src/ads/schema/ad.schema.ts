import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema()
export class Ad extends Document {
  @Prop()
  title: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  creator: MongooseSchema.Types.ObjectId;

  @Prop()
  createdAt: Date;

  @Prop()
  category: string;

  @Prop()
  price: number;

  @Prop()
  state: string;

  @Prop()
  description: string;

  @Prop()
  images: string[];

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }] })
  favouriteBy: MongooseSchema.Types.ObjectId[];
}

export const AdSchema = SchemaFactory.createForClass(Ad);
