import { dirname } from "https://deno.land/std@0.119.0/path/mod.ts";

/**
 * Encode string and write it to file at the path.
 */
function writeFile(path: string, data: string) {
  const encoder = new TextEncoder();
  return Deno.writeFile(path, encoder.encode(data));
}

const projectDirectory = Deno.args[0];
if (!projectDirectory) {
  console.error(
    "First argument missing." +
      "Give project target directory as the first argument.",
  );
  Deno.exit(1);
}

try {
  const { isDirectory } = await Deno.stat(projectDirectory);
  if (isDirectory) {
    for await (const _ of Deno.readDir(projectDirectory)) {
      console.error(
        "Project target directory not empty. Refusing to create project there.",
      );
      Deno.exit(1);
    }
  } else {
    console.error(
      "Project target is not a directory. Cannot create project there.",
    );
    Deno.exit(1);
  }
} catch (error) {
  if (error instanceof Deno.errors.NotFound) {
    await Deno.mkdir(projectDirectory);
  } else {
    console.error(error);
    Deno.exit(1);
  }
}

await Deno.mkdir(`${projectDirectory}/.vscode`);
await writeFile(
  `${projectDirectory}/.vscode/settings.json`,
  '{\n    "deno.enable": true,\n}\n',
);

await Deno.mkdir(`${projectDirectory}/config`);
await Deno.mkdir(`${projectDirectory}/config/modules`);

const repositoryRoot = dirname(import.meta.url);
await writeFile(
  `${projectDirectory}/config/modules/urlFragmentInitTrigger.ts`,
  `import { configure } from "${repositoryRoot}/modules/urlFragmentInitTrigger/mod.ts";\n` +
    "\n" +
    "configure({\n" +
    '  trigger: "cms",\n' +
    "});\n",
);
await writeFile(
  `${projectDirectory}/config/modules/gitlabBackend.ts`,
  `import { configure } from "${repositoryRoot}/modules/gitlabBackend/mod.ts";\n` +
    "\n" +
    "configure({\n" +
    '  server: "gitlab.com",\n' +
    '  appId: "",\n' +
    "});\n",
);
await writeFile(
  `${projectDirectory}/config/modules.ts`,
  "// Init triggers\n" +
    'import "./modules/urlFragmentInitTrigger.ts";\n' +
    "\n" +
    "// Backends\n" +
    '// import "./modules/gitlabBackend.ts";\n',
);

await writeFile(
  `${projectDirectory}/build.sh`,
  "#!/bin/sh\n" +
    "\n" +
    "deno run\\\n" +
    " --unstable\\\n" +
    " --allow-read\\\n" +
    " --allow-write\\\n" +
    ` ${repositoryRoot}/build.ts\\\n` +
    " $(dirname $0)\n",
);
