export interface AuthInterface {
  username?: string;
  password?: string;
  otp?: string;
  remember_me?: boolean;
}

export interface UserInterface {
  isLoggedIn: boolean;
  requestBody: AuthInterface;
}
