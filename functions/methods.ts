import { getFileInMem } from "./getFileInMem.ts";
import { getFilePathString } from "./getFilePath.ts";

export interface MemMethods {
    getFilePath: (path: string | URL) => string;
    ["MANDARINE_FILE_SYSTEM"]: {
        [prop: string]: Uint8Array
    }
}

export const MEM_METHODS = {
    getFilePathString,
    getFileInMem
}