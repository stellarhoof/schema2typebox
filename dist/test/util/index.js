import { expect } from "@jest/globals";
import path from "node:path";
import * as prettier from "prettier";
const formatWithPrettier = async (input) => {
    return prettier.format(input, { parser: "typescript" });
};
/**
 * Formats given input with prettier and returns the result. This is used for
 * testing to be able to compare generated types with expected types without
 * having to take care of formatting.
 *
 * @throws Error
 **/
export const expectEqualIgnoreFormatting = async (input1, input2) => {
    expect(await formatWithPrettier(input1)).toBe(await formatWithPrettier(input2));
};
export const buildOsIndependentPath = (foldersOrFiles) => {
    return foldersOrFiles.join(path.sep);
};
