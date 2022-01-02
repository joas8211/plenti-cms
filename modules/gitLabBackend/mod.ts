import { GitLabConfiguration } from "./config.ts";
import { onAuth } from "../../mod.ts";
import { tryStart } from "./starter.ts";

export function configure({ server, appId }: GitLabConfiguration) {
  onAuth(async () => {
    const { GitLabAuthentication } = await import("./auth.ts");
    const auth = new GitLabAuthentication(server, appId);
    return auth.authenticate();
  });

  tryStart();
}
