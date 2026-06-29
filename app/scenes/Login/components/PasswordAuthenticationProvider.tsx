import * as React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { s } from "@shared/styles";
import { Client } from "@shared/types";
import { UserValidation } from "@shared/validations";
import ButtonLarge from "~/components/ButtonLarge";
import Flex from "~/components/Flex";
import InputLarge from "~/components/InputLarge";
import { Form } from "~/components/primitives/Form";
import Desktop from "~/utils/Desktop";

type Props = React.ComponentProps<typeof ButtonLarge>;

/**
 * Renders the email and password sign-in form. The form submits natively so the
 * browser follows the redirect issued on success and applies the session cookie.
 *
 * @param props button props forwarded to the submit button.
 * @returns the password sign-in form.
 */
export function PasswordAuthenticationProvider(props: Props) {
  const { t } = useTranslation();
  const clientType = Desktop.isElectron() ? Client.Desktop : Client.Web;

  return (
    <Wrapper column gap={8}>
      <StyledForm method="POST" action="/auth/password">
        <input type="hidden" name="client" value={clientType} />
        <InputLarge
          type="email"
          name="email"
          placeholder="me@domain.com"
          autoComplete="username"
          required
        />
        <InputLarge
          type="password"
          name="password"
          placeholder={t("Password")}
          autoComplete="current-password"
          minLength={UserValidation.minPasswordLength}
          required
        />
        <ButtonLarge type="submit" fullwidth {...props}>
          {t("Sign In")} →
        </ButtonLarge>
      </StyledForm>
      <Links>
        <StyledLink to="/register">{t("Create an account")}</StyledLink>
        <StyledLink to="/auth/password-reset">
          {t("Forgot password?")}
        </StyledLink>
      </Links>
    </Wrapper>
  );
}

const Wrapper = styled(Flex)`
  width: 100%;
`;

const StyledForm = styled(Form)`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Links = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  font-size: 14px;
`;

const StyledLink = styled(Link)`
  color: ${s("textTertiary")};

  &:hover {
    color: ${s("text")};
  }
`;
