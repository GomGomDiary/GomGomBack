import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { DiaryRepository } from './diary.repository';
import { DiaryPostDto } from './dto/diary.post.dto';
import { Response } from 'express';
import mongoose from 'mongoose';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DiaryService {
  constructor(
    private readonly diaryRepository: DiaryRepository,
    private readonly configService: ConfigService,
  ) {}
  async postQuestion({
    body,
    clientId,
    res,
  }: {
    body: DiaryPostDto;
    clientId: string;
    res: Response;
  }) {
    const isDiaryOwner = await this.diaryRepository.checkOwnership(clientId);
    // if Questioner
    // update Diary
    // soft delete
    if (isDiaryOwner) {
      await this.diaryRepository.updateOne(clientId, body);
      return;
    }
    // if Answerer o (Questioner x)
    // create Diary
    const isAnswerer = await this.diaryRepository.existAsAnswerer(clientId);
    if (isAnswerer) {
      await this.diaryRepository.createWithId(clientId, body);
      return;
    }
    // if Newbie (Questioner x, Answerer x)
    // create Diary && set cookie
    const diary = await this.diaryRepository.create(body);
    res
      .cookie('diaryUser', diary._id, this.configService.get('COOKIE_OPTION'))
      .sendStatus(201);
  }

  async getAnswer({
    diaryId,
    answerId,
    clientId,
  }: {
    diaryId: string;
    answerId: string;
    clientId: string;
  }) {
    // clientId !== diaryId && clientId !== answerId
    if (clientId !== diaryId && clientId !== answerId) {
      throw new BadRequestException('Invalid Access');
    }
    const answer = await this.diaryRepository.findAnswerByAnswerId(
      diaryId,
      answerId,
    );

    return answer;
  }

  async getAnswerers({ diaryId, clientId }) {
    const isDiaryOwner = diaryId === clientId;

    const answerers = await this.diaryRepository.findAnswerers(diaryId);

    // check clientId is in diary answer
    // const isAnswererAboutDiaryId =
    // await this.diaryRepository.existAsDiaryAnswerer(diaryId, clientId);

    const answererWithPermission = answerers.answerList.map((answer) => {
      let isPermission = false;
      if (isDiaryOwner) {
        // if DiaryOwner, give permission all answer
        isPermission = true;
      } else if (answer._id.equals(clientId)) {
        // if answer._id === clientId
        // give permission this answer
        isPermission = true;
      }
      return {
        ...answer.toJSON(),
        isPermission,
      };
    });

    const response = {
      _id: diaryId,
      answererList: answererWithPermission,
    };

    return response;
  }

  async postAnswer({
    diaryId,
    clientId,
    answer,
    res,
  }: {
    diaryId: string;
    clientId: string;
    answer: any;
    res: Response;
  }) {
    if (diaryId === clientId) {
      throw new BadRequestException('Invalid Access');
    }

    const isDuplication = await this.diaryRepository.checkDuplication(
      diaryId,
      clientId,
    );
    if (isDuplication) {
      throw new HttpException('Already Answered', 409);
    }

    let id: mongoose.Types.ObjectId;
    // if Newbie
    if (!clientId) {
      id = new mongoose.Types.ObjectId();
      res.cookie(
        'diaryUser',
        id.toString(),
        this.configService.get('COOKIE_OPTION'),
      );
      // set cookie
    } else {
      id = new mongoose.Types.ObjectId(clientId);
    }

    const diary = await this.diaryRepository.findById(diaryId);
    diary.answerList.push({ ...answer, _id: id });

    await this.diaryRepository.save([diary]);
  }
}
