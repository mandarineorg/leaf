import { Leaf } from "../../../leafCompiler.ts";

Leaf.compile({ modulePath: "./tests/fixtures/output-config/file.ts", contentFolders: ["./tests/fixtures/output-config"], output: "helloWorldApp" });