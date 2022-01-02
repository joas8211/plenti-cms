import { createEvent } from "./event.ts";

export const init = createEvent<null, [], boolean>(null);
export const auth = createEvent<null, [], boolean>(null);
