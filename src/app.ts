import { auth } from "./events.ts";

const authSuccessful = (await auth.trigger()).some(Boolean);
console.log(authSuccessful);
