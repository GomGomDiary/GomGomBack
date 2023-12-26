import { Types } from 'mongoose';

export type QueryType = { diaryId: Types.ObjectId };
export type NextKeyType = { _id: Types.ObjectId };
export type PaginateQueryType =
  | {
      diaryId: Types.ObjectId;
      _id: {
        $gt: Types.ObjectId;
      };
    }
  | QueryType;

export function generatePaginationQuery(
  query: QueryType,
  sort?: null,
  nextKey?: NextKeyType,
) {
  const sortField = sort == null ? null : sort[0];

  function getNextKey(items: any[]) {
    if (items.length === 0) {
      return null;
    }

    const item = items[items.length - 1];

    if (sortField == null) {
      return { _id: item._id };
    }
    return { _id: item._id, [sortField]: item[sortField] };
  }

  if (nextKey == null) {
    return { paginatedQuery: query, getNextKey };
  }
  // if (sort == null) {
  // }
  const paginatedQuery = {
    ...query,
    _id: { $gt: nextKey._id },
  };
  return { paginatedQuery, nextKey };
}
// const sortOperator = sort[1] === 1 ? '$gt' : '$lt';
//
// const paginationQuery = [
//   { [sortField]: { [sortOperator]: nextKey[sortField] } },
//   {
//     $and: [
//       { [sortField]: nextKey[sortField] },
//       { _id: { [sortOperator]: nextKey._id } },
//     ],
//   },
// ];
//
// if (paginatedQuery.$or == null) {
//   paginatedQuery.$or = paginationQuery;
// } else {
//   paginatedQuery = { $and: [query, { $or: paginationQuery }] };
// }
//
// return { paginatedQuery, getNextKey };
