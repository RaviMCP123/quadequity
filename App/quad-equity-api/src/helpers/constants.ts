import moment from "moment";
import * as dotenv from "dotenv";
dotenv.config();

export const NOTIFICATION_TEMPLATE_LOGIN = {
  title: "Security login",
  message: (deviceName: string) =>
    `Your account was logged in on ${deviceName} at ${moment().format("hh:mmA")}`,
  imageUrl: `${process.env.APP_URL}/img/notification.png`,
  isEmail: true,
};

export const NOTIFICATION_TEMPLATE_ACCOUNT_PASSWORD = {
  title: "Account password",
  message: `Your account password was changed successfully`,
  imageUrl: `${process.env.APP_URL}/img/notification.png`,
  isEmail: true,
};

export const NOTIFICATION_TEMPLATE_ACCOUNT_PASSCORD = {
  title: "Account passcord",
  message: `Your account passcord was changed successfully`,
  imageUrl: `${process.env.APP_URL}/img/notification.png`,
  isEmail: true,
};
