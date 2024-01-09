import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({
  timestamps: {
    createdAt: true,
    updatedAt: true,
  },
})
export class ChatRoom {
  @Prop()
  questionerId: Types.ObjectId;

  @Prop()
  answererId: Types.ObjectId;
}

export const ChatRoomSchema = SchemaFactory.createForClass(ChatRoom);

ChatRoomSchema.index({ roomId: 1 });
