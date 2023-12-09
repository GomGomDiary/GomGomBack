import { ExposeOptions, Transform } from 'class-transformer';

// TODO key delete
export const TransformObjectIdToString =
  (key: string, options?: ExposeOptions) => (target, propertyKey) => {
    Transform((value) => {
      /**
       * when next is empty
       */
      if (!value.value) return;
      return value.obj[propertyKey].toString();
    }, options)(target, propertyKey);
  };
