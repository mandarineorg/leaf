import { Leaf } from "../../../leafCompiler.ts";

console.log(window);
await Leaf.import("./tests/fixtures/basic-dynamic-import/hello-world.ts");
const { add } = await Leaf.import("./tests/fixtures/basic-dynamic-import/add.ts");

console.log(`5 + 2 = ${add(5, 2)}`)