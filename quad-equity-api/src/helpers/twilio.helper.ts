import * as dotenv from "dotenv";
dotenv.config();

export async function sendSms(to: string, body: string) {
  if (
    !process.env.SMS_API_USERNAME ||
    !process.env.SMS_API_TOKEN ||
    !process.env.SMS_API_SENDER_ID ||
    !process.env.SMS_API_URL
  ) {
    throw new Error("Missing SMS API config in environment variables.");
  }
  const mobile = to.replace(/^\+/, "");
  const params = new URLSearchParams({
    username: process.env.SMS_API_USERNAME,
    msg_token: process.env.SMS_API_TOKEN,
    sender_id: process.env.SMS_API_SENDER_ID,
    message: body,
    mobile: mobile,
  });
  const url = `${process.env.SMS_API_URL}?${params.toString()}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`SMS API Error: ${response.statusText}`);
  }

  const result = await response.text();
  return result;
}
