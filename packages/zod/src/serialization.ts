import type {AdapterResolver} from './resolver';
import type {SerializationAdapter} from '@typeschema/core';
import type {ZodType as ZodTypeV3} from 'zod/v3';
import type {$ZodType as ZodTypeV4} from 'zod/v4/core';

import {memoize} from '@typeschema/core';
import {toJSONSchema as toJSONSchemaV4} from 'zod/v4/core';

const importSerializationModule = memoize(async () => {
  const {zodToJsonSchema} = await import('zod-to-json-schema');
  return {zodToJsonSchema};
});

export const serializationAdapter: SerializationAdapter<
  AdapterResolver
> = async schema => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((schema as any)._zod) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return toJSONSchemaV4(schema as ZodTypeV4) as any;
  } else {
    const {zodToJsonSchema} = await importSerializationModule();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return zodToJsonSchema(schema as ZodTypeV3) as any;
  }
};
