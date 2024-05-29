/**
 * Type guards for determining the type of schema we are currently working on.
 * E.g. an anyOf schema object, oneOf, enum, const, etc..
 */
import { JSONSchema7, JSONSchema7Definition, JSONSchema7Type, JSONSchema7TypeName } from "json-schema";
export type ObjectSchema = JSONSchema7 & {
    type: "object";
};
export declare const isObjectSchema: (schema: JSONSchema7) => schema is ObjectSchema;
export type EnumSchema = JSONSchema7 & {
    enum: JSONSchema7Type[];
};
export declare const isEnumSchema: (schema: JSONSchema7) => schema is EnumSchema;
export type AnyOfSchema = JSONSchema7 & {
    anyOf: JSONSchema7Definition[];
};
export declare const isAnyOfSchema: (schema: JSONSchema7) => schema is AnyOfSchema;
export type AllOfSchema = JSONSchema7 & {
    allOf: JSONSchema7Definition[];
};
export declare const isAllOfSchema: (schema: JSONSchema7) => schema is AllOfSchema;
export type OneOfSchema = JSONSchema7 & {
    oneOf: JSONSchema7Definition[];
};
export declare const isOneOfSchema: (schema: JSONSchema7) => schema is OneOfSchema;
export type NotSchema = JSONSchema7 & {
    not: JSONSchema7Definition;
};
export declare const isNotSchema: (schema: JSONSchema7) => schema is NotSchema;
export type ArraySchema = JSONSchema7 & {
    type: "array";
    items?: JSONSchema7Definition | JSONSchema7Definition[];
};
export declare const isArraySchema: (schema: JSONSchema7) => schema is ArraySchema;
export type ConstSchema = JSONSchema7 & {
    const: JSONSchema7Type;
};
export declare const isConstSchema: (schema: JSONSchema7) => schema is ConstSchema;
export type MultipleTypesSchema = JSONSchema7 & {
    type: JSONSchema7TypeName[];
};
export declare const isSchemaWithMultipleTypes: (schema: JSONSchema7) => schema is MultipleTypesSchema;
export declare const isStringType: (type: JSONSchema7Type) => type is string;
export declare const isNullType: (type: JSONSchema7Type) => type is null;
