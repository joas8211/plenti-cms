import { auth } from "./src/events.ts";

export function start() {
  import("./src/app.ts");
}

/**
 * Attach a handler for authentication. The handler should return true if
 * authentication was successful or false if not.
 */
export const onAuth = auth.subscribe;
