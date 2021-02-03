import { Leaf } from "../../../leafCompiler.ts";

console.log(new TextDecoder().decode(Leaf.readFileSync("./tests/fixtures/hello-world/dummyFile.txt")));