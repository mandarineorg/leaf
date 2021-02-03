import { Test, Orange } from "https://deno.land/x/orange@v0.5.0/mod.ts";
import { assertEquals } from "https://deno.land/std@0.74.0/testing/asserts.ts";

export class Tests {

    private static executeProcess: Deno.Process;
    private static compileProcess: Deno.Process;
    private static binaryName: string;

    constructor() {
        Orange.setOptions(this, {
            testSuiteName: "Leaf Compiler",
            ignore: false,
            generateReport: true,
            hooks: {
                beforeEach() {
                    Deno.mkdirSync("playground");
                    Tests.binaryName = Deno.build.os === "windows" ? "./file.exe" : "./file";
                },
                afterEach() {
                    Tests.compileProcess.close();
                    Tests.executeProcess.close();
                    Deno.removeSync(`./playground/${Tests.binaryName}`);
                    Deno.removeSync("playground");
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

        Deno.copyFileSync(Tests.binaryName, `./playground/${Tests.binaryName}`);
        Deno.removeSync(Tests.binaryName);

        Tests.executeProcess = Deno.run({
            cmd: [`./playground/${Tests.binaryName}`],
            stdout: "piped"
        });

        await Tests.executeProcess.status();

        const executeResult = new TextDecoder().decode(await Tests.executeProcess.output());

        assertEquals(executeResult, "Hello World!\n");
    }
}