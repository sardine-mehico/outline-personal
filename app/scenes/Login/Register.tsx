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
import useStores from "~/hooks/useStores";
import Desktop from "~/utils/Desktop";
import { detectLanguage } from "~/utils/language";
import { homePath } from "~/utils/routeHelpers";
import { BackButton } from "./components/BackButton";
import { Background } from "./components/Background";
import { Centered } from "./components/Centered";

/**
 * Self-service registration page. Creates a new workspace and an admin account
 * authenticated with an email and password. Submits natively so the browser
 * follows the redirect issued on success.
 *
 * @returns the registration page.
 */
function Register() {
  const { t } = useTranslation();
  const history = useHistory();
  const { auth } = useStores();
  const clientType = Desktop.isElectron() ? Client.Desktop : Client.Web;

  // Once the session is established (e.g. immediately after a successful
  // registration) forward to the app instead of rendering the form again. The
  // native-form sign-in redirect can briefly land back here before the client
  // auth state settles, which would otherwise strand the user on this page.
  if (auth.authenticated) {
    return <Redirect to={homePath()} />;
  }

  return (
    <Background>
      <BackButton onBack={() => history.push("/")} />
      <ChangeLanguage locale={detectLanguage()} />
      <Centered
        as={Form}
        action="/auth/password.register"
        method="POST"
        gap={12}
      >
        <input type="hidden" name="client" value={clientType} />
        <StyledHeading centered>{t("Create an account")}</StyledHeading>
        <Content>
          {t(
            "Create a new workspace and admin account using an email and password. You can change these later."
          )}
        </Content>
        <Inputs column gap={12}>
          <Input
            name="teamName"
            type="text"
            label={t("Workspace name")}
            placeholder="Acme, Inc"
            maxLength={UserValidation.maxNameLength}
            required
            autoFocus
            flex
          />
          <Input
            name="name"
            type="text"
            label={t("Your name")}
            maxLength={UserValidation.maxNameLength}
            required
            flex
          />
          <Input
            name="email"
            type="email"
            label={t("Email")}
            maxLength={UserValidation.maxEmailLength}
            required
            flex
          />
          <Input
            name="password"
            type="password"
            label={t("Password")}
            autoComplete="new-password"
            minLength={UserValidation.minPasswordLength}
            maxLength={UserValidation.maxPasswordLength}
            required
            flex
          />
        </Inputs>
        <ButtonLarge type="submit" fullwidth>
          {t("Continue")} →
        </ButtonLarge>
      </Centered>
    </Background>
  );
}

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

export default observer(Register);
