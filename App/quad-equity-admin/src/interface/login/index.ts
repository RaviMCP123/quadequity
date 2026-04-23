import { User } from "../user";
export interface FormValues {
  username: string;
  password: string;
  otp?: string;
  confirmPassword?: string;
  remember_me: boolean;
}

export interface ApiResponse {
  data: User;
  message: string;
  status: boolean;
}
