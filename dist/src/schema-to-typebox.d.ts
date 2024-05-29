import { JSONSchema7, JSONSchema7Definition, JSONSchema7Type, JSONSchema7TypeName } from "json-schema";
import { AllOfSchema, AnyOfSchema, ArraySchema, ConstSchema, EnumSchema, MultipleTypesSchema, NotSchema, ObjectSchema, OneOfSchema } from "./schema-matchers.js";
type Code = string;
/** Generates TypeBox code from a given JSON schema */
export declare const schema2typebox: (jsonSchema: string, id?: string) => Promise<string>;
/**
 * Takes the root schema and recursively collects the corresponding types
 * for it. Returns the matching typebox code representing the schema.
 *
 * @throws Error if an unexpected schema (one with no matching parser) was given
 */
export declare const collect: (schema: JSONSchema7Definition) => Code;
/**
 * Creates custom typebox code to support the JSON schema keyword 'oneOf'. Based
 * on the suggestion here: https://github.com/xddq/schema2typebox/issues/16#issuecomment-1603731886
 */
export declare const createOneOfTypeboxSupportCode: () => Code;
export declare const parseObject: (schema: ObjectSchema) => string;
export declare const parseEnum: (schema: EnumSchema) => string;
export declare const parseConst: (schema: ConstSchema) => Code;
export declare const parseType: (type: JSONSchema7Type) => Code;
export declare const parseAnyOf: (schema: AnyOfSchema) => Code;
export declare const parseAllOf: (schema: AllOfSchema) => Code;
export declare const parseOneOf: (schema: OneOfSchema) => Code;
export declare const parseNot: (schema: NotSchema) => Code;
export declare const parseArray: (schema: ArraySchema) => Code;
export declare const parseWithMultipleTypes: (schema: MultipleTypesSchema) => Code;
export declare const parseTypeName: (type: JSONSchema7TypeName, schema?: JSONSchema7) => Code;
export {};
