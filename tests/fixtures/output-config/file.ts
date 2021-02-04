import { Leaf } from "../../../leafCompiler.ts";

console.log(new TextDecoder().decode(Leaf.readFileSync("./tests/fixtures/output-config/dummyFile.txt")));