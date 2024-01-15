import { plainToInstance } from 'class-transformer';
import { AnswerDto, DiaryDto } from './diary.dto';
import { validate } from 'class-validator';
import { Types } from 'mongoose';

type ExcludedType = 'createdAt' | 'updatedAt' | '_id';
type KeyOfDiaryDto = keyof DiaryDto;
type KeyOfAnswerDto = keyof AnswerDto;
type AnswerDtoType = Pick<AnswerDto, KeyOfAnswerDto>;
type DiaryDtoType = Partial<DiaryDto>;

describe('DiaryDto', () => {
  it('should be defined', () => {
    expect(new DiaryDto()).toBeDefined();
  });

  describe('Question validation', () => {
    it('questioner가 11글자 이상일 경우 에러가 나야한다.', async () => {
      const answerList: AnswerDtoType = {
        _id: new Types.ObjectId(),
        answerer: 'answerer',
        answers: ['answer1', 'answer2', 'answer3'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const invalidQuestionDiary: DiaryDtoType = {
        _id: new Types.ObjectId(),
        question: ['question1', 'question2', 'question3'],
        questioner: '012345678901',
        challenge: '내 생일',
        answerList: [answerList],
        countersign: 'yoyoo',
      };

      const result = await validate(
        plainToInstance(DiaryDto, invalidQuestionDiary),
      );
      expect(result.length).toBe(1);
      expect(result[0].constraints).toStrictEqual({
        isLength: 'questioner must be shorter than or equal to 10 characters',
      });
    });

    it('question 배열의 길이가 2 이하일 경우 에러가 나야한다.', async () => {
      const answerList: AnswerDtoType = {
        _id: new Types.ObjectId(),
        answerer: 'answerer',
        answers: ['answer1', 'answer2', 'answer3'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const invalidQuestionDiary: DiaryDtoType = {
        _id: new Types.ObjectId(),
        question: ['question1', 'question2'],
        questioner: '0123456789',
        challenge: '내 생일',
        answerList: [answerList],
        countersign: 'yoyoo',
      };

      const result = await validate(
        plainToInstance(DiaryDto, invalidQuestionDiary),
      );
      expect(result.length).toBe(1);
      expect(result[0].constraints).toStrictEqual({
        arrayMinSize: 'question must contain at least 3 elements',
      });
    });

    it('question 배열의 길이가 11 이상일 경우 에러가 나야 한다.', async () => {
      const answerList: AnswerDtoType = {
        _id: new Types.ObjectId(),
        answerer: 'answerer',
        answers: ['answer1', 'answer2', 'answer3'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const invalidQuestionDiary: DiaryDtoType = {
        _id: new Types.ObjectId(),
        question: [
          'question1',
          'question2',
          'question3',
          'question4',
          'question5',
          'question6',
          'question7',
          'question8',
          'question9',
          'question10',
          'question11',
        ],
        questioner: '0123456789',
        challenge: '내 생일',
        answerList: [answerList],
        countersign: 'yoyoo',
      };

      const result = await validate(
        plainToInstance(DiaryDto, invalidQuestionDiary),
      );
      expect(result.length).toBe(1);
      expect(result[0].constraints).toStrictEqual({
        arrayMaxSize: 'question must contain no more than 10 elements',
      });
    });

    it('question 배열의 아이템이 100글자를 초과할 경우 에러가 나야한다', async () => {
      const answerList: AnswerDtoType = {
        _id: new Types.ObjectId(),
        answerer: 'answerer',
        answers: ['answer1', 'answer2', 'answer3'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const invalidQuestionDiary: DiaryDtoType = {
        _id: new Types.ObjectId(),
        question: [
          '01234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890',
          'question2',
          'question3',
        ],
        questioner: 'yoyoo',
        challenge: '내 생일',
        answerList: [answerList],
        countersign: 'yoyoo',
      };

      const result = await validate(
        plainToInstance(DiaryDto, invalidQuestionDiary),
      );
      expect(result.length).toBe(1);
      expect(result[0].constraints).toStrictEqual({
        isLength:
          'each value in question must be longer than or equal to 1 and shorter than or equal to 100 characters',
      });
    });
  });

  describe('Answer Validation', () => {
    it('answer가 11글자 이상일 경우 에러가 나야한다.', async () => {
      const invaludAnswer: AnswerDtoType = {
        _id: new Types.ObjectId(),
        answerer: '01234567890',
        answers: ['answer1', 'answer2', 'answer3'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const result = await validate(plainToInstance(AnswerDto, invaludAnswer));
      expect(result.length).toBe(1);
      expect(result[0].constraints).toStrictEqual({
        isLength: 'answerer must be shorter than or equal to 10 characters',
      });
    });

    it('answer 배열의 길이가 2 이하일 경우 에러가 나야한다.', async () => {
      const invalidAnswer: AnswerDtoType = {
        _id: new Types.ObjectId(),
        answerer: 'answerer',
        answers: ['answer1', 'answer2'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await validate(plainToInstance(AnswerDto, invalidAnswer));
      expect(result.length).toBe(1);
      expect(result[0].constraints).toStrictEqual({
        arrayMinSize: 'answers must contain at least 3 elements',
      });
    });

    it('answer 배열의 길이가 11 이상일 경우 에러가 나야 한다.', async () => {
      const invalidAnswer: AnswerDtoType = {
        _id: new Types.ObjectId(),
        answerer: 'answerer',
        answers: [
          'answer1',
          'answer2',
          'answer3',
          'answer4',
          'answer5',
          'answer6',
          'answer7',
          'answer8',
          'answer9',
          'answer10',
          'answer11',
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const result = await validate(plainToInstance(AnswerDto, invalidAnswer));
      expect(result.length).toBe(1);
      expect(result[0].constraints).toStrictEqual({
        arrayMaxSize: 'answers must contain no more than 10 elements',
      });
    });

    it('question 배열의 아이템이 100글자를 초과할 경우 에러가 나야한다', async () => {
      const invalidAnswer: AnswerDtoType = {
        _id: new Types.ObjectId(),
        answerer: 'answerer',
        answers: [
          '01234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890',

          'answer2',
          'answer3',
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const result = await validate(plainToInstance(AnswerDto, invalidAnswer));
      expect(result.length).toBe(1);
      expect(result[0].constraints).toStrictEqual({
        isLength:
          'each value in answers must be longer than or equal to 1 and shorter than or equal to 100 characters',
      });
    });
  });
});
