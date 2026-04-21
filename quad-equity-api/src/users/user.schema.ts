import { Schema, Document } from "mongoose";
import { Helper } from "../helpers/";

export interface User extends Document {
  role_id: number;
  firstName: string;
  lastName: string;
  email: string;
  userId: string;
  mobile_number: string;
  password: string;
  referral_code: string;
  from_referral_code: string;
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
  is_verify: boolean;
  account_status: string;
  device_name: string;
  device_type: string;
  device_token: string;
  createdAt: Date;
  updatedAt: Date;
  permission: string[];
}

function ucFirst(v: string) {
  if (v) {
    return v[0].toUpperCase() + v.substring(1);
  } else {
    return "";
  }
}

const UserSchema = new Schema<User>(
  {
    role_id: { type: Number, required: false },
    firstName: { type: String, get: ucFirst, required: true },
    lastName: { type: String, get: ucFirst, required: false, default: "" },
    userId: { type: String, required: false, default: "" },
    email: { type: String, required: true },
    mobile_number: { type: String, required: true },
    password: { type: String, required: false, minlength: 6 },
    from_referral_code: { type: String, required: false, default: "" },
    referral_code: { type: String, required: false, default: "" },
    accessToken: { type: String, required: false, default: "" },
    refreshToken: { type: String, required: false, default: "" },
    status: { type: Boolean, required: false, default: false },
    image: { type: String, required: false, default: "" },
    notification: { type: Boolean, default: true },
    last_login_at: { type: String, required: false },
    ip: { type: String, required: false },
    is_delete: { type: Boolean, required: false, default: false },
    is_verify: { type: Boolean, required: false, default: false },
    account_status: { type: String, required: false, default: "" },
    device_name: { type: String, required: false, default: "" },
    device_type: { type: String, required: false, default: "" },
    device_token: { type: String, required: false, default: "" },
    permission: { type: [String], required: false, default: [] },
  },
  { timestamps: true },
);

UserSchema.virtual("image_thumb_url").get(function () {
  return this.image
    ? `${Helper.getBaseUrl()}/user/thumb/${this.image}`
    : `${process.env.APP_URL}/img/image.png`;
});
UserSchema.set("toJSON", { virtuals: true });
UserSchema.set("toObject", { virtuals: true });

export default UserSchema;
