import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({
  timestamps: {
    createdAt: true,
    updatedAt: true,
  },
})
export class Chat {
  @Prop()
  roomId: Types.ObjectId;

  @Prop()
  clientId: Types.ObjectId;

  @Prop()
  nickname: string;

  @Prop()
  chat: string;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);

// ChatSchema.index({ diaryId: 1 });
