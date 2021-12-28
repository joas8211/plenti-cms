import { init } from "../../mod.ts";

interface ModuleConfiguration {
  /**
   * Trigger word that should be detected from URL after hash sign (#) and will
   * cause initialization of the CMS application.
   */
  trigger: string;
}

export function configure({ trigger }: ModuleConfiguration) {
  if (location.hash == `#${trigger}`) {
    // The fragment must be inserted after the page has loaded so we remove it
    // at startup
    history.replaceState(null, "", location.href.split("#")[0]);
  }
  addEventListener("hashchange", () => {
    if (location.hash != `#${trigger}`) return;
    init();
  });
}
