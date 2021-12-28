import { rollup } from "https://deno.land/x/drollup@2.58.0%2B0.20.0/mod.ts";

const projectDirectory = Deno.args[0];
try {
  await Deno.remove(`${projectDirectory}/dist`, { recursive: true });
} catch (error) {
  if (!(error instanceof Deno.errors.NotFound)) {
    throw error;
  }
}
const bundle = await rollup({
  input: {
    "plenti-cms": `${projectDirectory}/config/modules.ts`,
  },
});
await bundle.write({
  format: "esm",
  dir: `${projectDirectory}/dist`,
});
