import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({
  timestamps: {
    createdAt: true,
  },
})
export class Notification {
  @Prop()
  senderName: string;

  @Prop()
  senderId: Types.ObjectId;

  @Prop()
  receiverId: Types.ObjectId;

  @Prop()
  chatId: Types.ObjectId;

  @Prop()
  isRead: boolean;

  @Prop()
  createdAt: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

NotificationSchema.index({ receiverId: 1 });
