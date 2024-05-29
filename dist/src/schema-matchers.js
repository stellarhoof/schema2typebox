export const isObjectSchema = (schema) => {
    return schema["type"] !== undefined && schema["type"] === "object";
};
export const isEnumSchema = (schema) => {
    return schema["enum"] !== undefined;
};
export const isAnyOfSchema = (schema) => {
    return schema["anyOf"] !== undefined;
};
export const isAllOfSchema = (schema) => {
    return schema["allOf"] !== undefined;
};
export const isOneOfSchema = (schema) => {
    return schema["oneOf"] !== undefined;
};
export const isNotSchema = (schema) => {
    return schema["not"] !== undefined;
};
export const isArraySchema = (schema) => {
    return schema.type === "array";
};
export const isConstSchema = (schema) => {
    return schema.const !== undefined;
};
export const isSchemaWithMultipleTypes = (schema) => {
    return Array.isArray(schema.type);
};
export const isStringType = (type) => {
    return typeof type === "string";
};
export const isNullType = (type) => {
    return type === null;
};
