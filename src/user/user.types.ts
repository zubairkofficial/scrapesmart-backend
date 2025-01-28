export interface ICreateUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface IUpdateUser {
  email?: string;
  firstName?: string;
  lastName?: string;
  isEmailVerified?: boolean;
}
