import { MemMethods } from "./methods.ts";

export const MANDARINE_GET_FILE_IN_MEM = (globalThis: MemMethods, path: string | URL, isExecutable: boolean): Uint8Array => {
    let filePath = globalThis["getFilePath"](path);

    if(!filePath) throw new Error("Invalid Path");

    const fileInMemory = globalThis["MANDARINE_FILE_SYSTEM"][filePath] 
        || (globalThis["MANDARINE_FILE_SYSTEM"][`./${filePath}`] 
        || globalThis["MANDARINE_FILE_SYSTEM"][filePath.replace("./", "")]);

    if(!fileInMemory) {
        throw new Error(`[Leaf] File not found (${filePath}).`);
    } else {
        return new Uint8Array(fileInMemory);
    }
}

export const getFileInMem = ["getFileInMem", MANDARINE_GET_FILE_IN_MEM.toString()];