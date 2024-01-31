import { Types } from 'mongoose';
export type ComparisonOperator =
  | {
      $gt: Types.ObjectId;
    }
  | {
      $lt: Types.ObjectId;
    };
export type Query = { [key: string]: Types.ObjectId };
export type NextKeyType = { _id: Types.ObjectId };
export type PaginateQueryType =
  | {
      [key: string]: Types.ObjectId | ComparisonOperator;
      _id: ComparisonOperator;
    }
  | Query;

export function generatePaginationQuery(
  query: Query,
  sort?: null | 1,
  nextKey?: NextKeyType,
) {
  // const sortField = sort == null ? null : sort[0];
  // function getNextKey(items: any[]) {
  //   if (items.length === 0) {
  //     return null;
  //   }
  //
  //   const item = items[items.length - 1];
  //
  //   if (sortField == null) {
  //     return { _id: item._id };
  //   }
  //   return { _id: item._id, [sortField]: item[sortField] };
  // }
  //
  if (nextKey == null) {
    return { paginatedQuery: query };
  }
  if (sort == null) {
    const paginatedQuery = {
      ...query,
      _id: { $gt: nextKey._id },
    };
    return { paginatedQuery, nextKey };
  } else {
    const paginatedQuery = {
      ...query,
      _id: { $lt: nextKey._id },
    };
    return { paginatedQuery, nextKey };
  }

  // const sortOperator = sort[1] === 1 ? '$gt' : '$lt';
  // const paginationQuery = [
  //   { [sortField]: { [sortOperator]: nextKey[sortField] } },
  //   {
  //     $and: [
  //       { [sortField]: nextKey[sortField] },
  //       { _id: { [sortOperator]: nextKey._id } },
  //     ],
  //   },
  // ];
}
//
//
// if (paginatedQuery.$or == null) {
//   paginatedQuery.$or = paginationQuery;
// } else {
//   paginatedQuery = { $and: [query, { $or: paginationQuery }] };
// }
//
// return { paginatedQuery, getNextKey };
