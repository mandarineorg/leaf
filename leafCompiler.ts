import { walkSync } from "https://deno.land/std@0.85.0/fs/mod.ts";
import { fileSystemExecutable, fileSystemPropertyName } from "./constants.ts";
import { MEM_METHODS } from "./functions/methods.ts";

type FileStorageNumbers = { [path: string]: Array<number> };
type FileStorageTypedArray = { [path: string]: Uint8Array };

const getFilename = (fullPath: string) => fullPath.replace(/^.*[\\\/]/, '');
const encoder = new TextEncoder();
const decoderUtf8 = new TextDecoder('utf-8');
const isExecutable: boolean = (Deno.mainModule == "file://$deno$/bundle.js");

const fileExists = (path: string | URL): boolean => {
    try {
        Deno.statSync(path);
        return true;
    } catch {
        return false;
    }
}

const getFilePath = (path: string | URL): string => {
    let filePath = undefined;

    if(path instanceof URL) {
        filePath = path.toString();
    } else {
        filePath = path;
    }
    return filePath;
}

const getFileDirectory = (filePath: string) => {
    if (filePath.indexOf("/") == -1) { // windows
      return filePath.substring(0, filePath.lastIndexOf('\\'));
    } 
    else { // unix
      return filePath.substring(0, filePath.lastIndexOf('/'));
    }
}

const guidGenerator = () => {
    let S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

export type CompileOptions = {
    modulePath: string,
    contentFolders: Array<string>
    flags?: Array<string>
    output?: string;
}

export class Leaf {
    private static files: FileStorageTypedArray = {};

    private static storageToJson(): string {
        const storage: FileStorageNumbers = Object.fromEntries(Object.entries(this.files).map(([filePath, content]) => [filePath, [...content]]));
        return JSON.stringify(storage);
    }

    private static registerFileInMemory(path: string | URL): void {
        let filePath = getFilePath(path);

        if(!filePath) throw new Error("Invalid Path");

        if(fileExists(filePath)) {
            const fileContent = Deno.readFileSync(filePath);
            this.files[filePath] = fileContent;
            console.log(`Leaf compiled ${filePath}`);
        } else {
            throw new Error(`File not found (${filePath}).`);
        }
    }

    public static async compile(options: CompileOptions) {
        if(isExecutable) {
            return;
        };

        options.contentFolders.forEach((folder) => {
            for (const entry of Array.from(walkSync(folder)).filter((item) => item.isFile)) {
                this.registerFileInMemory(entry.path);
            }
        });

        const moduleToUse = options.modulePath;
        const [originalFileName] = getFilename(moduleToUse).split(".");
        const mainModuleFolder = getFileDirectory(moduleToUse);
        const tempFilename = `.${guidGenerator()}.js`;
        const tempFilePath = `${mainModuleFolder}/${tempFilename}`;

        Deno.createSync(tempFilePath).close();
        
        const fakeMemMethods = Object.values(MEM_METHODS).map((item) => {
            const name = item[0];
            const fn = item[1];

            return `
            globalThis["${name}"] = ${fn};
            `
        });

        const fakeFileSystemString = `
        globalThis["${fileSystemExecutable}"] = (Deno.mainModule == "file://$deno$/bundle.js");
        \n \n globalThis["${fileSystemPropertyName}"] = ${this.storageToJson()}; \n \n

        const denoApiReadFileSync = Deno.readFileSync;
        const denoApiReadFile = Deno.readFile;
        const denoApiReadTextFileSync = Deno.readTextFileSync;
        const denoApiReadTextFile = Deno.readTextFile;

        ${fakeMemMethods.join("\n")}

        Deno.readFileSync = (path) => {
            if(globalThis["${fileSystemExecutable}"] === true) {
                return globalThis["getFileInMem"](globalThis, path);
            } else {
                return denoApiReadFileSync(path);
            }
        }

        Deno.readFile = async (path) => {
            return Deno.readFileSync(path);
        }

        Deno.readTextFileSync = (path) => {
            return new TextDecoder().decode(Deno.readFileSync(path));
        }

        Deno.readTextFile = async (path) => {
            return Deno.readTextFileSync(path);
        }
        `;

        Deno.writeFileSync(tempFilePath, encoder.encode(fakeFileSystemString), { append: true });

        const bundleCode = (await Deno.emit(moduleToUse, { bundle: "module" })).files["deno:///bundle.js"];
        Deno.writeFileSync(tempFilePath, encoder.encode(bundleCode), { append: true });

        let cmd = ["deno", "compile"];

        if(options && options.flags) {
            if(options.flags.indexOf("--output") >= 0) throw new Error("'--output' flag is not valid in the current context. Use the property 'output' instead.");
            if(options.flags.indexOf("--unstable")) options.flags = options.flags.filter((item) => item.toLowerCase() != "--unstable");
            if(options.flags.indexOf("--allow-read")) options.flags = options.flags.filter((item) => item.toLowerCase() != "--allow-read");
            cmd = [...cmd, ...options.flags];
        }

        const outputFilename = (options?.output) ? options?.output : originalFileName;

        cmd = [...cmd, "--unstable", "--allow-read", "--output", outputFilename, tempFilePath.toString()];

        await Deno.run({
            cmd: cmd
        }).status();

        Deno.remove(tempFilePath);
    }
}