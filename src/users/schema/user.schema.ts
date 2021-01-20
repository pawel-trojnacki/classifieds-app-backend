import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
// import { Ad } from 'src/ads/schema/ad.schema';

@Schema()
export class User extends Document {
  @Prop()
  username: string;

  @Prop()
  email: string;

  @Prop()
  phone: string;

  @Prop()
  password: string;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Ad' }] })
  ads: MongooseSchema.Types.ObjectId[];

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Ad' }] })
  favourites: MongooseSchema.Types.ObjectId[];

  @Prop()
  currentToken: string | null;

  @Prop()
  isOnline: boolean;

  @Prop()
  lastSeen: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
