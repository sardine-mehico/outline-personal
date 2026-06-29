import type { Client } from "@shared/types";
import env from "@server/env";
import logger from "@server/logging/Logger";
import type { EmailProps } from "@server/emails/templates/BaseEmail";
import BaseEmail, {
  EmailMessageCategory,
} from "@server/emails/templates/BaseEmail";
import Body from "@server/emails/templates/components/Body";
import Button from "@server/emails/templates/components/Button";
import EmailTemplate from "@server/emails/templates/components/EmailLayout";
import EmptySpace from "@server/emails/templates/components/EmptySpace";
import Footer from "@server/emails/templates/components/Footer";
import Header from "@server/emails/templates/components/Header";
import Heading from "@server/emails/templates/components/Heading";

type Props = EmailProps & {
  token: string;
  teamUrl: string;
  client: Client;
};

/**
 * Email sent to a user when they request a link to reset or set their password.
 */
export default class PasswordResetEmail extends BaseEmail<Props, void> {
  protected get category() {
    return EmailMessageCategory.Authentication;
  }

  protected subject() {
    return this.t("Reset your {{ appName }} password", {
      appName: env.APP_NAME,
    });
  }

  protected preview(): string {
    return this.t("Use the link to choose a new password.");
  }

  protected renderAsText({ token, teamUrl, client }: Props): string {
    return `
${this.t("Use the link below to choose a new password")}:

${this.resetLink(teamUrl, token, client)}

${this.t("If you did not request this you can safely ignore this email.")}
`;
  }

  protected render({ token, teamUrl, client }: Props) {
    const resetLink = this.resetLink(teamUrl, token, client);

    if (env.isDevelopment) {
      logger.debug("email", `Password reset link: ${resetLink}`);
    }

    return (
      <EmailTemplate
        previewText={this.preview()}
        goToAction={{ url: resetLink, name: this.t("Reset Password") }}
      >
        <Header />

        <Body>
          <Heading>{this.t("Reset your password")}</Heading>
          <p>
            {this.t(
              "Click the button below to choose a new password for {{ appName }}.",
              { appName: env.APP_NAME }
            )}
          </p>
          <EmptySpace height={10} />
          <p>
            <Button href={resetLink}>{this.t("Reset Password")}</Button>
          </p>
          <EmptySpace height={20} />
          <p>
            {this.t(
              "If you did not request a password reset you can safely ignore this email."
            )}
          </p>
        </Body>

        <Footer />
      </EmailTemplate>
    );
  }

  private resetLink(teamUrl: string, token: string, client: Client): string {
    return `${teamUrl}/auth/password-reset?token=${token}&client=${client}`;
  }
}
