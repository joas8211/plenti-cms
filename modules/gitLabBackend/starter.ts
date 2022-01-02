import { start } from "../../mod.ts";

/**
 * If code and state GET parameters are found, initialize the CMS.
 */
export function tryStart() {
  const parameters = location.search.slice(1).split("&").map((p) =>
    p.split("=")[0]
  );
  if (parameters.indexOf("code") != -1 && parameters.indexOf("state") != -1) {
    start();
  }
}
