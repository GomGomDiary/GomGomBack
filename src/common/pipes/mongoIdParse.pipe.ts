import { Injectable, PipeTransform } from '@nestjs/common';
import mongoose from 'mongoose';

@Injectable()
export class ParseMongoIdPipe implements PipeTransform {
  transform(mongoId: string) {
    return new mongoose.Types.ObjectId(mongoId);
  }
}
