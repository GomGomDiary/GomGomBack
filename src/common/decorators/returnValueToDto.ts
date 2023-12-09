import { plainToInstance } from 'class-transformer';

export const ReturnValueToDto =
  (dto) =>
  (target: any, key: string, descriptor: TypedPropertyDescriptor<any>) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const result = await originalMethod.apply(this, args);
      return plainToInstance(dto, result, { excludeExtraneousValues: true });
    };

    return descriptor;
  };
