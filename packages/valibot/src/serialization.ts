import type {AdapterResolver} from './resolver';
import type {SerializationAdapter} from '@typeschema/core';

import {memoize} from '@typeschema/core';

const importSerializationModule = memoize(async () => {
  const {toJsonSchema} = await import('@valibot/to-json-schema');
  return {toJsonSchema};
});

export const serializationAdapter: SerializationAdapter<
  AdapterResolver
> = async schema => {
  const {toJsonSchema} = await importSerializationModule();
  return toJsonSchema(schema, {errorMode: 'ignore'});
};
