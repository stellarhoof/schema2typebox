import { cosmiconfig } from "cosmiconfig";
import * as prettier from "prettier";
import { schema2typebox as Schema2Typebox } from "./schema-to-typebox.js";
/**
 * Use this function for programmatic usage of schema2typebox. The options are
 * typed and commented.
 *
 * @returns The generated code as string
 *
 * @throws Error
 **/
export const schema2typebox = async ({ input, id, }) => {
    const generatedTypeboxCode = await Schema2Typebox(input, id);
    // post-processing
    // 1. format code
    const explorer = cosmiconfig("prettier");
    const searchResult = await explorer.search();
    const prettierConfig = 
    // eslint-disable-next-line
    searchResult === null ? {} : searchResult.config;
    const formattedResult = prettier.format(generatedTypeboxCode, {
        parser: "typescript",
        ...prettierConfig,
    });
    return formattedResult;
};
/**
 * Declaring this as an object with a function in order to make it better
 * testable with mocks with the current/new nodejs test runner.
 * Allows for tracking the call count.
 */
export const addCommentThatCodeIsGenerated = {
    run: (code) => {
        return `/**
 * ATTENTION. This code was AUTO GENERATED by schema2typebox.
 * While I don't know your use case, there is a high chance that direct changes
 * to this file get lost. Consider making changes to the underlying JSON schema
 * you use to generate this file instead. The default file is called
 * "schema.json", perhaps have a look there! :]
 */

${code}`;
    },
};
