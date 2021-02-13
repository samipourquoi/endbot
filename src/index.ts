import { Endbot } from "./endbot";

export const instance = new Endbot();

instance.login(instance.config.token);
