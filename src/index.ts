import { Config } from "./config";
export const config = Config.init();

import { Endbot } from "./endbot";

export const instance = new Endbot();

instance.login(config.token);
