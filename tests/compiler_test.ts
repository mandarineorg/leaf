import { assertEquals } from 'https://deno.land/std@0.197.0/assert/mod.ts';

Deno.test({
    name: "Compile Small Binary",
    async fn() {
        const compilingProcess = new Deno.Command(Deno.execPath(), 
            {args: ["run", "--allow-all", "--unstable", "./tests/data/file2.ts"]}
         );

        const compileResp = await compilingProcess.output();
        assertEquals(compileResp.code, 0);

        let binary = "";
        if(Deno.build.os === "windows") {
            binary = "file.exe";
        } else {
            binary = "./file"
        }

        const playground = "playground";
        const createPlayground = () => Deno.mkdirSync(playground);
        try {
            createPlayground();
        } catch {
            Deno.removeSync(playground, {recursive: true});
            createPlayground();
        }

        const playgroundBinary = `./playground/${binary}`;
        Deno.copyFileSync(binary, playgroundBinary);


        const executeProcess = new Deno.Command(playgroundBinary);

        const {code, stdout} = await executeProcess.output();
        assertEquals(code, 0);
        
        const executeResult = new TextDecoder().decode(stdout);
        assertEquals(executeResult, "Hello World!\n");
        
        console.log('clean up');
        Deno.removeSync(binary);
        Deno.removeSync(playground, {recursive: true});
        
    }
})