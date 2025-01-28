export interface IResetPasswordMail {
  email: string;
  token: string;
  firstName: string;
}

export interface IResetPasswordSuccessMail {
  email: string;
  firstName: string;
}

export interface IVerificationMail {
  email: string;
  token: string;
  firstName: string;
}
