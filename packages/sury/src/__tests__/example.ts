import {initTRPC} from '@trpc/server';
import * as S from 'sury';

import {wrap} from '..';

const schema = S.schema({name: S.string});

const t = initTRPC.create();
const appRouter = t.router({
  hello: t.procedure
    .input(wrap(schema))
    .query(({input}) => `Hello, ${input.name}!`),
  //         ^? {name: string}
});
