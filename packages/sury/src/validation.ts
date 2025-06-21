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
        data: result.value,
        success: true,
      };
    }
    return {
      issues: result.issues.map(({message, path}) => ({message, path})),
      success: false,
    };
  };
};
