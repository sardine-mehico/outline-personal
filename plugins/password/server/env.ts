import { IsBoolean, IsOptional } from "class-validator";
import { Environment } from "@server/env";
import { Public } from "@server/utils/decorators/Public";
import environment from "@server/utils/environment";

class PasswordPluginEnvironment extends Environment {
  /**
   * Enable email and password authentication. Password reset and email
   * verification additionally require SMTP to be configured.
   */
  @Public
  @IsOptional()
  @IsBoolean()
  public PASSWORD_AUTH_ENABLED = this.toBoolean(
    environment.PASSWORD_AUTH_ENABLED ?? "false"
  );
}

export default new PasswordPluginEnvironment();
