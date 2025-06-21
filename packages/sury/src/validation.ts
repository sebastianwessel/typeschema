import type {AdapterResolver} from './resolver';
import type {ValidationAdapter} from '@typeschema/core';

export const validationAdapter: ValidationAdapter<
  AdapterResolver
> = async schema => {
  const validate = schema['~standard'].validate;
  return async data => {
    const result = await validate(data);
    if ('value' in result) {
      return {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: result.value as any,
        success: true,
      };
    }
    return {
      issues: result.issues.map(({message, path}) => ({
        message,
        path: path?.map(segment =>
          typeof segment === 'object' ? segment.key : segment,
        ),
      })),
      success: false,
    };
  };
};
