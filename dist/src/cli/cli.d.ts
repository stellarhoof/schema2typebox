/// <reference types="node" resolution-mode="require"/>
/// <reference types="node" resolution-mode="require"/>
export declare const runCli: () => Promise<boolean | (NodeJS.WriteStream & {
    fd: 1;
}) | import("fs").WriteStream>;
/**
 * Declaring this as function in order to make it better testable.
 * Using an object to be able to mock it and track its usage.
 */
export declare const getHelpText: {
    run: () => string;
};
