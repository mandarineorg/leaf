import { Leaf } from "../../leafCompiler.ts";

console.log(new TextDecoder().decode(Leaf.readFileSync("./tests/data/dummyFile.txt")));