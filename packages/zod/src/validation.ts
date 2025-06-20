import type {AdapterResolver} from './resolver';
import type {ValidationAdapter} from '@typeschema/core';
import type {ZodError as ZodErrorV3, ZodType as ZodTypeV3} from 'zod/v3';
import type {$ZodType as ZodTypeV4} from 'zod/v4/core';

import {safeParseAsync as safeParseAsyncV4} from 'zod/v4/core';

export const validationAdapter: ValidationAdapter<
  AdapterResolver
> = async schema => {
  return async data => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((schema as any)._zod) {
      const result = await safeParseAsyncV4(schema as ZodTypeV4, data);
      if (result.success) {
        return {data: result.data, success: true};
      }
      return {
        issues: result.error.issues.map(({message, path}) => ({message, path})),
        success: false,
      };
    } else {
      const result = await (schema as ZodTypeV3).safeParseAsync(data);
      if (result.success) {
        return {data: result.data, success: true};
      }
      return {
        issues: (result.error as ZodErrorV3).issues.map(({message, path}) => ({
          message,
          path,
        })),
        success: false,
      };
    }
  };
};
