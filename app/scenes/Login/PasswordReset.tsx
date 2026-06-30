import { observer } from "mobx-react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { useHistory, Redirect } from "react-router-dom";
import styled from "styled-components";
import { s } from "@shared/styles";
import { Client } from "@shared/types";
import { UserValidation } from "@shared/validations";
import ButtonLarge from "~/components/ButtonLarge";
import ChangeLanguage from "~/components/ChangeLanguage";
import Flex from "~/components/Flex";
import Heading from "~/components/Heading";
import Input from "~/components/Input";
import Text from "~/components/Text";
import { Form } from "~/components/primitives/Form";
import useQuery from "~/hooks/useQuery";
import useStores from "~/hooks/useStores";
import { client } from "~/utils/ApiClient";
import Desktop from "~/utils/Desktop";
import { detectLanguage } from "~/utils/language";
import { homePath } from "~/utils/routeHelpers";
import { BackButton } from "./components/BackButton";
import { Background } from "./components/Background";
import { Centered } from "./components/Centered";

/**
 * Password reset page. With a `token` query parameter it shows the form to
 * choose a new password (submitted natively to follow the redirect on success);
 * otherwise it shows the form to request a reset link by email.
 *
 * @returns the password reset page.
 */
function PasswordReset() {
  const { t } = useTranslation();
  const history = useHistory();
  const { auth } = useStores();
  const query = useQuery();
  const token = query.get("token");
  const clientType = Desktop.isElectron() ? Client.Desktop : Client.Web;

  const [email, setEmail] = React.useState("");
  const [isSubmitting, setSubmitting] = React.useState(false);
  const [isSent, setSent] = React.useState(false);

  const handleRequest = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await client.post(
        "/password.reset",
        { email, client: clientType },
        { baseUrl: "/auth" }
      );
    } catch (_err) {
      // Ignore errors so the response does not reveal whether the account
      // exists; the confirmation is shown regardless.
    } finally {
      setSubmitting(false);
      setSent(true);
    }
  };

  // Forward to the app once the session is established (e.g. immediately after a
  // successful password reset) so the user isn't stranded on this page while the
  // client auth state settles after the native-form sign-in redirect.
  if (auth.authenticated) {
    return <Redirect to={homePath()} />;
  }

  if (token) {
    return (
      <Background>
        <BackButton onBack={() => history.push("/")} />
        <ChangeLanguage locale={detectLanguage()} />
        <Centered
          as={Form}
          action="/auth/password.reset.callback"
          method="POST"
          gap={12}
        >
          <input type="hidden" name="token" value={token} />
          <input type="hidden" name="client" value={clientType} />
          <StyledHeading centered>{t("Choose a new password")}</StyledHeading>
          <Inputs column gap={12}>
            <Input
              name="password"
              type="password"
              label={t("New password")}
              autoComplete="new-password"
              minLength={UserValidation.minPasswordLength}
              maxLength={UserValidation.maxPasswordLength}
              required
              autoFocus
              flex
            />
          </Inputs>
          <ButtonLarge type="submit" fullwidth>
            {t("Reset Password")} →
          </ButtonLarge>
        </Centered>
      </Background>
    );
  }

  return (
    <Background>
      <BackButton onBack={() => history.push("/")} />
      <ChangeLanguage locale={detectLanguage()} />
      <Centered gap={12}>
        <StyledHeading centered>{t("Reset password")}</StyledHeading>
        {isSent ? (
          <Content>
            {t(
              "If an account exists for that email, we've sent a link to reset the password."
            )}
          </Content>
        ) : (
          <StyledForm onSubmit={handleRequest}>
            <Content>
              {t(
                "Enter your email and we'll send you a link to reset your password."
              )}
            </Content>
            <Inputs column gap={12}>
              <Input
                name="email"
                type="email"
                label={t("Email")}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                maxLength={UserValidation.maxEmailLength}
                required
                autoFocus
                flex
              />
            </Inputs>
            <ButtonLarge type="submit" fullwidth disabled={isSubmitting}>
              {t("Send reset link")} →
            </ButtonLarge>
          </StyledForm>
        )}
      </Centered>
    </Background>
  );
}

const StyledForm = styled.form`
  width: 100%;
`;

const Inputs = styled(Flex)`
  width: 100%;
  text-align: left;
`;

const StyledHeading = styled(Heading)`
  margin: 0;
`;

const Content = styled(Text)`
  color: ${s("textSecondary")};
  text-align: center;
  margin-top: -8px;
`;

export default observer(PasswordReset);
