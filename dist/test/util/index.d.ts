/**
 * Formats given input with prettier and returns the result. This is used for
 * testing to be able to compare generated types with expected types without
 * having to take care of formatting.
 *
 * @throws Error
 **/
export declare const expectEqualIgnoreFormatting: (input1: string, input2: string) => Promise<void>;
export declare const buildOsIndependentPath: (foldersOrFiles: string[]) => string;
