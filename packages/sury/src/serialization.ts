import type {AdapterResolver} from './resolver';
import type {SerializationAdapter} from '@typeschema/core';

import * as S from 'sury';

export const serializationAdapter: SerializationAdapter<
  AdapterResolver
> = async schema => S.toJSONSchema(schema);
