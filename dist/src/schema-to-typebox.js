import $Refparser from "@apidevtools/json-schema-ref-parser";
import { isBoolean } from "fp-ts/lib/boolean.js";
import { isNumber } from "fp-ts/lib/number.js";
import { isString } from "fp-ts/lib/string.js";
import { isAllOfSchema, isAnyOfSchema, isArraySchema, isConstSchema, isEnumSchema, isNotSchema, isNullType, isObjectSchema, isOneOfSchema, isSchemaWithMultipleTypes, } from "./schema-matchers.js";
/** Generates TypeBox code from a given JSON schema */
export const schema2typebox = async (jsonSchema, id) => {
    const schemaObj = JSON.parse(jsonSchema);
    const dereferencedSchema = (await $Refparser.dereference(schemaObj));
    // Ensuring that generated typebox code will contain an '$id' field.
    // see: https://github.com/xddq/schema2typebox/issues/32
    if (id &&
        typeof dereferencedSchema !== "boolean" &&
        dereferencedSchema.$id === undefined) {
        dereferencedSchema.$id = id;
    }
    return collect(dereferencedSchema);
};
/**
 * Takes the root schema and recursively collects the corresponding types
 * for it. Returns the matching typebox code representing the schema.
 *
 * @throws Error if an unexpected schema (one with no matching parser) was given
 */
export const collect = (schema) => {
    // TODO: boolean schema support..?
    if (isBoolean(schema)) {
        return JSON.stringify(schema);
    }
    else if (isAnyOfSchema(schema)) {
        return parseAnyOf(schema);
    }
    else if (isObjectSchema(schema)) {
        return parseObject(schema);
    }
    else if (isEnumSchema(schema)) {
        return parseEnum(schema);
    }
    else if (isAllOfSchema(schema)) {
        return parseAllOf(schema);
    }
    else if (isOneOfSchema(schema)) {
        return parseOneOf(schema);
    }
    else if (isNotSchema(schema)) {
        return parseNot(schema);
    }
    else if (isArraySchema(schema)) {
        return parseArray(schema);
    }
    else if (isSchemaWithMultipleTypes(schema)) {
        return parseWithMultipleTypes(schema);
    }
    else if (isConstSchema(schema)) {
        return parseConst(schema);
    }
    else if (schema.type !== undefined && !Array.isArray(schema.type)) {
        return parseTypeName(schema.type, schema);
    }
    throw new Error(`Unsupported schema. Did not match any type of the parsers. Schema was: ${JSON.stringify(schema)}`);
};
/**
 * Creates custom typebox code to support the JSON schema keyword 'oneOf'. Based
 * on the suggestion here: https://github.com/xddq/schema2typebox/issues/16#issuecomment-1603731886
 */
export const createOneOfTypeboxSupportCode = () => {
    return [
        "TypeRegistry.Set('ExtendedOneOf', (schema: any, value) => 1 === schema.oneOf.reduce((acc: number, schema: any) => acc + (Value.Check(schema, value) ? 1 : 0), 0))",
        "const OneOf = <T extends TSchema[]>(oneOf: [...T], options: SchemaOptions = {}) => t.Unsafe<Static<TUnion<T>>>({ ...options, [Kind]: 'ExtendedOneOf', oneOf })",
    ].reduce((acc, curr) => {
        return acc + curr + "\n\n";
    }, "");
};
export const parseObject = (schema) => {
    const schemaOptions = parseSchemaOptions(schema);
    const properties = schema.properties;
    if (properties === undefined) {
        return schemaOptions === undefined
            ? `t.Object({})`
            : `t.Object({}, ${schemaOptions})`;
    }
    const attributes = Object.entries(properties);
    // NOTE: Just always quote the propertyName here to make sure we don't run
    // into issues as they came up before
    // [here](https://github.com/xddq/schema2typebox/issues/45) or
    // [here](https://github.com/xddq/schema2typebox/discussions/35). Since we run
    // prettier as "postprocessor" anyway we will also ensure to still have a sane
    // output without any unnecessarily quotes attributes.
    const code = attributes
        .map(([propertyName, schema]) => {
        return `"${propertyName}": ${collect(schema)}`;
    })
        .join(",\n");
    if (!schema.required || schema.required.length === 0) {
        return schemaOptions === undefined
            ? `t.Object({${code}})`
            : `t.Object({${code}}, ${schemaOptions})`;
    }
    const required = JSON.stringify(schema.required);
    return schemaOptions === undefined
        ? `t.Required(${required}, t.Object({${code}}))`
        : `t.Required(${required}, t.Object({${code}}, ${schemaOptions}))`;
};
export const parseEnum = (schema) => {
    const schemaOptions = parseSchemaOptions(schema);
    const type = schema.type === "string" ? "t.StringEnum" : "t.NumberEnum";
    const values = JSON.stringify(schema.enum);
    return schemaOptions === undefined
        ? `${type}(${values})`
        : `${type}(${values}, ${schemaOptions})`;
};
export const parseConst = (schema) => {
    const schemaOptions = parseSchemaOptions(schema);
    if (Array.isArray(schema.const)) {
        const code = schema.const.reduce((acc, schema) => {
            return acc + `${acc === "" ? "" : ",\n"} ${parseType(schema)}`;
        }, "");
        return schemaOptions === undefined
            ? `t.Union([${code}])`
            : `t.Union([${code}], ${schemaOptions})`;
    }
    // TODO: case where const is object..?
    if (typeof schema.const === "object") {
        return "t.Todo(const with object)";
    }
    if (typeof schema.const === "string") {
        return schemaOptions === undefined
            ? `t.Literal("${schema.const}")`
            : `t.Literal("${schema.const}", ${schemaOptions})`;
    }
    return schemaOptions === undefined
        ? `t.Literal(${schema.const})`
        : `t.Literal(${schema.const}, ${schemaOptions})`;
};
export const parseType = (type) => {
    if (isString(type)) {
        return `t.Literal("${type}")`;
    }
    else if (isNullType(type)) {
        return `t.Null()`;
    }
    else if (isNumber(type) || isBoolean(type)) {
        return `t.Literal(${type})`;
    }
    else if (Array.isArray(type)) {
        return `t.Array([${type.map(parseType)}])`;
    }
    else {
        const code = Object.entries(type).reduce((acc, [key, value]) => {
            return acc + `${acc === "" ? "" : ",\n"}${key}: ${parseType(value)}`;
        }, "");
        return `t.Object({${code}})`;
    }
};
export const parseAnyOf = (schema) => {
    const schemaOptions = parseSchemaOptions(schema);
    if (Array.isArray(schema.type) &&
        schema.type.length === 2 &&
        schema.type.includes("null")) {
        const code = collect(
        // @ts-expect-error: ignore
        schema.anyOf.find((schema) => {
            // @ts-expect-error: ignore
            return schema.type !== "null";
        }));
        return schemaOptions === undefined
            ? `t.Nullable(${code})`
            : `t.Nullable(${code}, ${schemaOptions})`;
    }
    const code = schema.anyOf.reduce((acc, schema) => {
        return acc + `${acc === "" ? "" : ",\n"} ${collect(schema)}`;
    }, "");
    return schemaOptions === undefined
        ? `t.Union([${code}])`
        : `t.Union([${code}], ${schemaOptions})`;
};
export const parseAllOf = (schema) => {
    const schemaOptions = parseSchemaOptions(schema);
    const code = schema.allOf.reduce((acc, schema) => {
        return acc + `${acc === "" ? "" : ",\n"} ${collect(schema)}`;
    }, "");
    return schemaOptions === undefined
        ? `t.Intersect([${code}])`
        : `t.Intersect([${code}], ${schemaOptions})`;
};
export const parseOneOf = (schema) => {
    const schemaOptions = parseSchemaOptions(schema);
    const code = schema.oneOf.reduce((acc, schema) => {
        return acc + `${acc === "" ? "" : ",\n"} ${collect(schema)}`;
    }, "");
    return schemaOptions === undefined
        ? `OneOf([${code}])`
        : `OneOf([${code}], ${schemaOptions})`;
};
export const parseNot = (schema) => {
    const schemaOptions = parseSchemaOptions(schema);
    return schemaOptions === undefined
        ? `t.Not(${collect(schema.not)})`
        : `t.Not(${collect(schema.not)}, ${schemaOptions})`;
};
export const parseArray = (schema) => {
    const schemaOptions = parseSchemaOptions(schema);
    if (Array.isArray(schema.items)) {
        const code = schema.items.reduce((acc, schema) => {
            return acc + `${acc === "" ? "" : ",\n"} ${collect(schema)}`;
        }, "");
        return schemaOptions === undefined
            ? `t.Array(t.Union(${code}))`
            : `t.Array(t.Union(${code}),${schemaOptions})`;
    }
    const itemsType = schema.items ? collect(schema.items) : "t.Unknown()";
    return schemaOptions === undefined
        ? `t.Array(${itemsType})`
        : `t.Array(${itemsType},${schemaOptions})`;
};
export const parseWithMultipleTypes = (schema) => {
    const code = schema.type.reduce((acc, typeName) => {
        return (acc + `${acc === "" ? "" : ",\n"} ${parseTypeName(typeName, schema)}`);
    }, "");
    return `t.Union([${code}])`;
};
export const parseTypeName = (type, schema = {}) => {
    const schemaOptions = parseSchemaOptions(schema);
    if (type === "number" || type === "integer") {
        return schemaOptions === undefined
            ? "t.Number()"
            : `t.Number(${schemaOptions})`;
    }
    else if (type === "string") {
        return schemaOptions === undefined
            ? "t.String()"
            : `t.String(${schemaOptions})`;
    }
    else if (type === "boolean") {
        return schemaOptions === undefined
            ? "t.Boolean()"
            : `t.Boolean(${schemaOptions})`;
    }
    else if (type === "null") {
        return schemaOptions === undefined
            ? "t.Null()"
            : `t.Null(${schemaOptions})`;
    }
    else if (type === "object") {
        return parseObject(schema);
        // We don't want to trust on build time checking here, json can contain anything
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    }
    else if (type === "array") {
        return parseArray(schema);
    }
    else if (type === "objectId") {
        return schemaOptions === undefined
            ? "t.ObjectId()"
            : `t.ObjectId(${schemaOptions})`;
    }
    else if (type === "date") {
        return schemaOptions === undefined
            ? "t.Date()"
            : `t.Date(${schemaOptions})`;
    }
    else if (type === "double") {
        return schemaOptions === undefined
            ? "t.Double()"
            : `t.Double(${schemaOptions})`;
    }
    else if (type === "decimal") {
        return schemaOptions === undefined
            ? "t.Number()"
            : `t.Number(${schemaOptions})`;
    }
    else if (type === "bool") {
        return schemaOptions === undefined
            ? "t.Boolean()"
            : `t.Boolean(${schemaOptions})`;
    }
    throw new Error(`Should never happen..? parseType got type: ${type}`);
};
const parseSchemaOptions = (schema) => {
    const properties = Object.entries(schema).filter(([key, _value]) => {
        return (
        // NOTE: To be fair, not sure if we should filter out the title. If this
        // makes problems one day, think about not filtering it.
        key !== "type" &&
            key !== "items" &&
            key !== "allOf" &&
            key !== "anyOf" &&
            key !== "oneOf" &&
            key !== "not" &&
            key !== "properties" &&
            key !== "required" &&
            key !== "const" &&
            key !== "enum");
    });
    if (properties.length === 0) {
        return undefined;
    }
    const result = properties.reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
    }, {});
    return JSON.stringify(result);
};
