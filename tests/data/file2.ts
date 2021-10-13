import { Leaf } from "../../leafCompiler.ts";

Leaf.compile({ 
    modulePath: "./tests/data/file.ts", 
    contentFolders: ["./tests"] 
});