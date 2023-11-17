import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { DiaryRepository } from './diary.repository';
import { DiaryPostDto } from './dto/diary.post.dto';
import { Response } from 'express';
import mongoose from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { AnswerPostDto } from './dto/answer.post.dto';
import { Answer } from './diary.schema';

@Injectable()
export class DiaryService {
  constructor(
    private readonly diaryRepository: DiaryRepository,
    private readonly configService: ConfigService,
  ) {}

  private setDiaryCookies(res: Response, value: string) {
    /**
     *  diaryAddress cookieOption ( for production client )
     *  {
     *        domain: 'gomgomdiary.site',
     *        expires: new Date(253402300000000),
     *        secure : true,
     *  };
     *
     *  diaryUser cookieOption ( for production server )
     *  {
     *        httpOnly: true,
     *        signed: true,
     *        domain: 'gomgomdiary.site',
     *        expires: new Date(253402300000000),
     *        secure : true,
     *  };
     *
     *  diaryAddress cookieOption ( for development client )
     *  {
     *        expires: new Date(253402300000000),
     *  };
     *
     *  diaryUser cookieOption ( for development server )
     *  {
     *        httpOnly: true,
     *        expires: new Date(253402300000000),
     *  };
     */

    if (this.configService.get('NODE_ENV') === 'production') {
      res.cookie('diaryUser', value, {
        httpOnly: true,
        signed: true,
        domain: 'gomgomdiary.site',
        expires: new Date(253402300000000),
        secure: true,
      });
      res.cookie('diaryAddress', value, {
        domain: 'gomgomdiary.site',
        expires: new Date(253402300000000),
        secure: true,
      });
      return;
    }

    res.cookie('diaryUser', value, {
      httpOnly: true,
      expires: new Date(253402300000000),
    });
    res.cookie('diaryAddress', value, {
      expires: new Date(253402300000000),
    });
  }

  async getQuestion(diaryId: string) {
    const questionsWithId = await this.diaryRepository.findQuestion(diaryId);
    const question = questionsWithId.question;
    return { ...questionsWithId.toJSON(), questionLength: question.length };
  }

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
      return res.status(HttpStatus.NO_CONTENT).end();
    }
    // if Answerer o (Questioner x)
    // create Diary
    const isAnswerer = await this.diaryRepository.existAsAnswerer(clientId);
    if (isAnswerer) {
      await this.diaryRepository.createWithId(clientId, body);
      return res.status(HttpStatus.NO_CONTENT).end();
    }
    // if Newbie (Questioner x, Answerer x)
    // create Diary && set cookie
    const diary = await this.diaryRepository.create(body);

    this.setDiaryCookies(res, diary._id.toString());

    res.end();
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
      throw new UnauthorizedException('You are not allowed to see this');
    }
    const answerListWithId = await this.diaryRepository.findAnswerByAnswerId(
      diaryId,
      answerId,
    );

    const question = await this.diaryRepository.findField(diaryId, {
      question: 1,
      questioner: 1,
    });
    const answer = answerListWithId.answerList[0];
    const response = {
      question: { ...question.toJSON() },
      answer: { ...answer.toJSON() },
    };

    return response;
  }

  async getAnswerers({ diaryId, clientId }) {
    const isDiaryOwner = diaryId === clientId;

    const diary = await this.diaryRepository.findDiaryWithoutAnswers(diaryId);
    // check clientId is in diary answer
    // const isAnswererAboutDiaryId =
    // await this.diaryRepository.existAsDiaryAnswerer(diaryId, clientId);

    const answererWithPermission = diary.answerList.map((answer) => {
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
      questioner: diary.questioner,
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
    answer: AnswerPostDto;
    res: Response;
  }) {
    if (diaryId === clientId) {
      throw new BadRequestException('Cannot post answer yourself');
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

      // set cookie
      this.setDiaryCookies(res, id.toString());
    } else {
      id = new mongoose.Types.ObjectId(clientId);
    }

    const diary = await this.diaryRepository.findById(diaryId);

    if (diary.question.length !== answer.answers.length) {
      throw new BadRequestException('answer length !== question length');
    }

    diary.answerList.push({ ...answer, _id: id } as Answer);

    await this.diaryRepository.save([diary]);
  }

  async getChallenge(diaryId: string) {
    return await this.diaryRepository.findField(diaryId, {
      challenge: 1,
      questioner: 1,
    });
  }
}
