import type {IfDefined, Resolver} from '@typeschema/core';
import type {Input, Output, Schema} from 'sury';

export interface AdapterResolver extends Resolver {
  base: IfDefined<Schema<unknown, unknown>, 'sury'>;
  input: this['schema'] extends this['base'] ? Input<this['schema']> : never;
  output: this['schema'] extends this['base'] ? Output<this['schema']> : never;
}
