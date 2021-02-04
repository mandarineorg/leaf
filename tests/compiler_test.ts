import { Test, Orange } from "https://deno.land/x/orange@v0.5.0/mod.ts";
import { assertEquals } from "https://deno.land/std@0.74.0/testing/asserts.ts";

export class Tests {

    private static executeProcess: Deno.Process;
    private static compileProcess: Deno.Process;
    private static binaryName: string;
    private static playgroundFolder: string;

    constructor() {
        Orange.setOptions(this, {
            testSuiteName: "Leaf Compiler",
            ignore: false,
            generateReport: true,
            hooks: {
                beforeAll() {
                    Tests.playgroundFolder = Deno.makeTempDirSync({ prefix: "leaf_", suffix: "_tests" });
                },
                beforeEach() {
                    Tests.binaryName = Deno.build.os === "windows" ? "./file.exe" : "./file";
                },
                afterEach() {
                    Tests.compileProcess.close();
                    Tests.executeProcess.close();
                    Deno.removeSync(`${Tests.playgroundFolder}/${Tests.binaryName}`);
                },
                afterAll() {
                    Deno.removeSync(Tests.playgroundFolder);
                }
            }
        })
    }

    @Test({ name: "Compile Simple Hello World Binary" })
    async helloWorldBinary() {
        Tests.compileProcess = Deno.run({
            cmd: ["deno", "run", "--allow-all", "--unstable", "./tests/fixtures/hello-world/file2.ts"]
        });

        await Tests.compileProcess.status();

        Deno.copyFileSync(Tests.binaryName, `${Tests.playgroundFolder}/${Tests.binaryName}`);
        Deno.removeSync(Tests.binaryName);

        Tests.executeProcess = Deno.run({
            cmd: [`${Tests.playgroundFolder}/${Tests.binaryName}`],
            stdout: "piped"
        });

        await Tests.executeProcess.status();

        const executeResult = new TextDecoder().decode(await Tests.executeProcess.output());

        assertEquals(executeResult, "Hello World!\n");
    }
}