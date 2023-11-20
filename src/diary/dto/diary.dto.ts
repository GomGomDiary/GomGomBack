// import { Exclude } from 'class-transformer';
// import { Answer, Diary } from '../../entity/diary.schema';
//
// export class DiaryDto {
//   @Exclude() private _id: string;
//   @Exclude() _question: string[];
//   @Exclude() private _questioner: string;
//   @Exclude() _challenge: string;
//   @Exclude() private _countersign: string;
//   @Exclude() private _answerList: Answer[];
//
//   constructor(diary: Diary) {
//     this._id = diary._id;
//     this._question = diary.question;
//     this._questioner = diary.questioner;
//     this._challenge = diary.challenge;
//     this._countersign = diary.countersign;
//     this._answerList = diary.answerList;
//   }
//
//   get id() {
//     return this._id;
//   }
//
//   get question() {
//     return this._question;
//   }
//
//   get questioner() {
//     return this._questioner;
//   }
//
//   get challenge() {
//     return this._challenge;
//   }
//
//   get countersign() {
//     return this._countersign;
//   }
//
//   get answerList() {
//     return this._answerList;
//   }
// }
