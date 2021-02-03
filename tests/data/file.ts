import { MandarineFileSystem } from "../../leafCompiler.ts";

console.log(new TextDecoder().decode(MandarineFileSystem.readFileSync('./tests/data/dummyFile.txt')));
MandarineFileSystem.compile({ modulePath: "./tests/data/file.ts" });