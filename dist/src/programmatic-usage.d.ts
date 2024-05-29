export type Schema2TypeboxOptions = {
    /**
     * The given JSON schema as utf-8 encoded string.
     */
    input: string;
    /**
     * Whitespace-free id for the schema
     */
    id?: string;
};
/**
 * Use this function for programmatic usage of schema2typebox. The options are
 * typed and commented.
 *
 * @returns The generated code as string
 *
 * @throws Error
 **/
export declare const schema2typebox: ({ input, id, }: Schema2TypeboxOptions) => Promise<string>;
/**
 * Declaring this as an object with a function in order to make it better
 * testable with mocks with the current/new nodejs test runner.
 * Allows for tracking the call count.
 */
export declare const addCommentThatCodeIsGenerated: {
    run: (code: string) => string;
};
