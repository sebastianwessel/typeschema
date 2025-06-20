import type {IfDefined, Resolver} from '@typeschema/core';
import type {ZodType as ZodTypeV3} from 'zod/v3';
import type {input as zodInputV3, output as zodOutputV3} from 'zod/v3';
import type {$ZodType as ZodTypeV4} from 'zod/v4/core';
import type {input as zodInputV4, output as zodOutputV4} from 'zod/v4/core';

export interface AdapterResolver extends Resolver {
  base: IfDefined<ZodTypeV3 | ZodTypeV4, 'zod'>;
  input: this['schema'] extends ZodTypeV3
    ? zodInputV3<this['schema']>
    : this['schema'] extends ZodTypeV4
      ? zodInputV4<this['schema']>
      : never;
  output: this['schema'] extends ZodTypeV3
    ? zodOutputV3<this['schema']>
    : this['schema'] extends ZodTypeV4
      ? zodOutputV4<this['schema']>
      : never;
}
