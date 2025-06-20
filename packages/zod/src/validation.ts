import type {AdapterResolver} from './resolver';
import type {ValidationAdapter} from '@typeschema/core';
import type {ZodType as ZodTypeV3} from 'zod/v3';
import type {$ZodType as ZodTypeV4} from 'zod/v4/core';

import {safeParseAsync as safeParseAsyncV4} from 'zod/v4/core';

export const validationAdapter: ValidationAdapter<
  AdapterResolver
> = async schema => {
  return async data => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isZodV4 = (schema as any)._zod;

    const result = isZodV4
      ? await safeParseAsyncV4(schema as ZodTypeV4, data)
      : await (schema as ZodTypeV3).safeParseAsync(data);

    if (result.success) {
      return {data: result.data, success: true};
    }

    const issues = result.error.issues.map(({message, path}) => ({
      message,
      path,
    }));
    return {issues, success: false};
  };
};
