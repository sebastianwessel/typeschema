import type {Infer, InferIn} from '..';

import {initTRPC} from '@trpc/server';
import {expectTypeOf} from 'expect-type';
import {describe, expect, test} from 'vitest';
import * as z3 from 'zod/v3';
import * as z4 from 'zod/v4';

import {assert, toJSONSchema, validate, wrap} from '..';

describe('Zod v3', () => {
  const schema = z3.object({
    age: z3.number(),
    createdAt: z3.string().transform(value => new Date(value)),
    email: z3.string().email(),
    id: z3.string(),
    name: z3.string(),
    updatedAt: z3.string().transform(value => new Date(value)),
  });

  const data = {
    age: 123,
    createdAt: '2021-01-01T00:00:00.000Z',
    email: 'john.doe@test.com',
    id: 'c4a760a8-dbcf-4e14-9f39-645a8e933d74',
    name: 'John Doe',
    updatedAt: '2021-01-01T00:00:00.000Z',
  };
  const outputData = {
    age: 123,
    createdAt: new Date('2021-01-01T00:00:00.000Z'),
    email: 'john.doe@test.com',
    id: 'c4a760a8-dbcf-4e14-9f39-645a8e933d74',
    name: 'John Doe',
    updatedAt: new Date('2021-01-01T00:00:00.000Z'),
  };
  const badData = {
    age: '123', // Type error
    createdAt: '2021-01-01T00:00:00.000Z',
    email: 'john.doe@test.com',
    id: 'c4a760a8-dbcf-4e14-9f39-645a8e933d74',
    name: 'John Doe',
    updatedAt: '2021-01-01T00:00:00.000Z',
  };

  test('infer', () => {
    expectTypeOf<Infer<typeof schema>>().toEqualTypeOf(outputData);
    expectTypeOf<InferIn<typeof schema>>().toEqualTypeOf(data);
  });

  test('validate', async () => {
    expect(await validate(schema, data)).toStrictEqual({
      data: outputData,
      success: true,
    });
    expect(await validate(schema, badData)).toStrictEqual({
      issues: [{message: 'Expected number, received string', path: ['age']}],
      success: false,
    });
  });

  test('assert', async () => {
    expect(await assert(schema, data)).toStrictEqual(outputData);
    await expect(assert(schema, badData)).rejects.toThrow();
  });

  test('wrap', async () => {
    const tRPC = initTRPC.create();
    const router = tRPC.router({
      hello: tRPC.procedure.input(wrap(schema)).query(({input}) => {
        expectTypeOf<typeof input>().toEqualTypeOf(outputData);
        return input;
      }),
    });
    const createCaller = tRPC.createCallerFactory(router);
    const caller = createCaller({});
    expect(await caller.hello(data)).toStrictEqual(outputData);
  });

  test('toJSONSchema', async () => {
    expect(await toJSONSchema(schema)).toStrictEqual({
      $schema: 'http://json-schema.org/draft-07/schema#',
      additionalProperties: false,
      properties: {
        age: {type: 'number'},
        createdAt: {type: 'string'},
        email: {format: 'email', type: 'string'},
        id: {type: 'string'},
        name: {type: 'string'},
        updatedAt: {type: 'string'},
      },
      required: ['age', 'createdAt', 'email', 'id', 'name', 'updatedAt'],
      type: 'object',
    });
  });
});

describe('Zod v4', () => {
  const schemaV4 = z4.object({
    name: z4.string(),
    age: z4.number().optional(),
    email: z4.email().nullable(),
    tags: z4.array(z4.string()).default([]),
  });

  type SchemaV4Input = InferIn<typeof schemaV4>;
  type SchemaV4Output = Infer<typeof schemaV4>;

  // type SchemaV4Input = z4.input<typeof schemaV4>; // Kept for reference during refactor
  // type SchemaV4Output = z4.output<typeof schemaV4>; // Kept for reference during refactor

  const validInputData: SchemaV4Input = {
    name: 'testV4',
    age: 30,
    email: 'test@example.com',
  };
  const validInputDataOptionalMissing: SchemaV4Input = {
    name: 'testV4Optional',
    email: null,
  };
  const expectedOutputDataOptionalMissing: SchemaV4Output = {
    name: 'testV4Optional',
    email: null,
    tags: [],
  };

  const invalidInputData = {
    name: 'testV4Invalid',
    age: '30', // incorrect type
    email: 'not-an-email',
  };

  test('infer', () => {
    expectTypeOf<Infer<typeof schemaV4>>().toEqualTypeOf<SchemaV4Output>();
    expectTypeOf<InferIn<typeof schemaV4>>().toEqualTypeOf<SchemaV4Input>();
  });

  test('validate - success', async () => {
    const result = await validate(schemaV4, validInputData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        name: 'testV4',
        age: 30,
        email: 'test@example.com',
        tags: [],
      });
    }
  });

  test('validate - success with optional missing', async () => {
    const result = await validate(schemaV4, validInputDataOptionalMissing);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(expectedOutputDataOptionalMissing);
    }
  });

  test('validate - failure with incorrect types', async () => {
    const result = await validate(schemaV4, invalidInputData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.issues).toEqual([
        {
          message: 'Invalid input: expected number, received string',
          path: ['age'],
        },
        {message: 'Invalid email address', path: ['email']},
      ]);
    }
  });

  test('validate - strips extra fields', async () => {
    const result = await validate(schemaV4, {
      ...validInputData,
      extraField: 'should be stripped',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        name: 'testV4',
        age: 30,
        email: 'test@example.com',
        tags: [],
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((result.data as any).extraField).toBeUndefined();
    }
  });

  test('assert - success', async () => {
    const result = await assert(schemaV4, validInputData);
    expect(result).toEqual({
      name: 'testV4',
      age: 30,
      email: 'test@example.com',
      tags: [],
    });
  });

  test('assert - failure', async () => {
    await expect(assert(schemaV4, invalidInputData)).rejects.toThrow();
  });

  test('toJSONSchema - Zod v4 native', async () => {
    const jsonSchemaV4 = await toJSONSchema(schemaV4);
    expect(jsonSchemaV4).toEqual({
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {
        name: {type: 'string'},
        age: {type: 'number'},
        email: {
          anyOf: [
            {
              type: 'string',
              format: 'email',
              pattern:
                "^(?!\\.)(?!.*\\.\\.)([A-Za-z0-9_'+\\-\\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\\-]*\\.)+[A-Za-z]{2,}$",
            },
            {
              type: 'null',
            },
          ],
        },
        tags: {type: 'array', items: {type: 'string'}, default: []},
      },
      required: ['name', 'email', 'tags'], // 'age' is optional, 'tags' has a default
      additionalProperties: false, // Zod v4 default
    });
  });

  // Test with a schema defined using zod/v4/core
  describe('Zod v4/core', () => {
    // It seems zod/v4/core doesn't export object, string etc directly for schema building
    // but rather the base types like $ZodType. The actual schema construction methods
    // are in zod/v4. So, we test that our adapter works with schemas that *could* have
    // been built with core types if such builder utilities were exposed there.
    // The critical part is that our main code imports from `zod/v4/core` for type checks
    // and `safeParseAsyncV4`.
    // This test mostly ensures that a schema recognized by `(schema as any)._zod` (which
    // is the check used in validation.ts and serialization.ts) is handled by the v4 path.
    // `z4.object` creates a schema that has this `_zod` property.
    const coreSchema = z4.object({id: z4.string().uuid()});
    const validCoreData = {id: 'c4a760a8-dbcf-4e14-9f39-645a8e933d74'};
    const invalidCoreData = {id: 'not-a-uuid'};

    test('validate core schema - success', async () => {
      const result = await validate(coreSchema, validCoreData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validCoreData);
      }
    });

    test('validate core schema - failure', async () => {
      const result = await validate(coreSchema, invalidCoreData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.issues).toEqual([
          {message: 'Invalid UUID', path: ['id']},
        ]);
      }
    });

    test('toJSONSchema core schema - Zod v4 native', async () => {
      const jsonSchemaV4Core = await toJSONSchema(coreSchema);
      expect(jsonSchemaV4Core).toEqual({
        $schema: 'https://json-schema.org/draft/2020-12/schema',
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            pattern:
              '^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000)$',
          },
        },
        required: ['id'],
        additionalProperties: false,
      });
    });
  });
});
