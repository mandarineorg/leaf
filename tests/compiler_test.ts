import * as StdAsserts from "https://deno.land/std@0.74.0/testing/asserts.ts";

Deno.test({
    name: "Compile Small Binary",
    async fn() {
        const compilingProcess = await Deno.run({
            cmd: ["deno", "run", "--allow-all", "--unstable", "./tests/data/file2.ts"]
        });
        await compilingProcess.status();

        let binary = "";
        if(Deno.build.os === "windows") {
            binary = "./file.exe";
        } else {
            binary = "./file"
        }

        const executeProcess = Deno.run({
            cmd: [binary],
            stdout: "piped"
        });
        await executeProcess.status();
        const executeResult = new TextDecoder().decode(await executeProcess.output());
        StdAsserts.assertEquals(executeResult, "Hello World!\n");
        
        compilingProcess.close();
        executeProcess.close();
    }
})