import { Hook, PluginManager } from "@server/utils/PluginManager";
import config from "../plugin.json";
import api from "./api/password";
import router from "./auth/password";
import PasswordResetEmail from "./email/templates/PasswordResetEmail";
import env from "./env";

const enabled = env.PASSWORD_AUTH_ENABLED;

if (enabled) {
  PluginManager.add([
    {
      ...config,
      type: Hook.AuthProvider,
      value: { router, id: config.id },
    },
    {
      ...config,
      type: Hook.API,
      value: api,
    },
    {
      type: Hook.EmailTemplate,
      value: PasswordResetEmail,
    },
  ]);
}
