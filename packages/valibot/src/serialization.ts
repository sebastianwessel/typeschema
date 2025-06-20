import type {AdapterResolver} from './resolver';
import type {SerializationAdapter} from '@typeschema/core';

import {memoize} from '@typeschema/core';
import {BaseIssue, BaseSchema} from 'valibot';

const importSerializationModule = memoize(async () => {
  const {toJsonSchema} = await import('@valibot/to-json-schema');
  return {toJsonSchema};
});

export const serializationAdapter: SerializationAdapter<
  AdapterResolver
> = async schema => {
  const {toJsonSchema} = await importSerializationModule();
  return toJsonSchema(
    schema as BaseSchema<unknown, unknown, BaseIssue<unknown>>,
    {errorMode: 'ignore'},
  );
};
