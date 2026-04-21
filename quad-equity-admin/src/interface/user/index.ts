export interface User {
  id?: string;
  _id?: string;
  role_id: number;
  permission?: string[];
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  mobile_number: string;
  password: string;
  accessToken: string;
  refreshToken: string;
  status: boolean;
  image: string;
  image_url: string;
  image_thumb_url: string;
  notification: boolean;
  last_login_at: string;
  ip: string;
  is_delete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserInterface {
  params: FormValues;
}

export interface UserPassword {
  params: PasswordFormValues;
}
export interface UserState {
  user: User | null;
}

export interface ApiResponse {
  data: User;
  message: string;
  status: boolean;
}

export interface UpdateProfileImagePayload {
  formData: FormData;
  id?: string;
}

export interface KycPayload {
  status: string;
  reason: string;
  id: string;
}

export interface FormValues {
  firstName: string;
  lastName: string;
  email: string;
  mobile_number: string;
  id: string;
}

export interface PasswordFormValues {
  id?: string;
  password: string;
  confirmPassword: string;
  currentPassword?: string;
}
