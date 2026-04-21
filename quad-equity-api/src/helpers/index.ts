import { existsSync } from "fs";
import { join } from "path";
import moment from "moment-timezone";
export class Helper {
  static generateAlphanumericId(length: number = 5): string {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters[randomIndex];
    }
    return result;
  }

  static generateFourDigitPass = (): string => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  static generateUsername = (prefix = "user"): string => {
    const randomNumber = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}${randomNumber}`;
  };

  static getImagePath(
    folder: string,
    filename: string,
    defaultImage = "no-image.png",
  ): string {
    const baseUrl = process.env.APP_URL;
    const imagePath = join(__dirname, "..", "..", "public", folder, filename);

    if (filename && existsSync(imagePath)) {
      return `${baseUrl}/${folder}/${filename}`;
    } else {
      return `${baseUrl}/img/${defaultImage}`;
    }
  }

  static isEmail(input: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(input);
  }

  static isMobile(input: string): boolean {
    const mobileRegex = /^[0-9]{10,15}$/;
    return mobileRegex.test(input);
  }

  static isValidPassword(password: string): boolean {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return passwordRegex.test(password);
  }

  static formatDate(date: Date | string): string {
    const today = moment().startOf("day");
    const yesterday = moment().subtract(1, "days").startOf("day");
    const inputDate = moment(date);

    if (inputDate.isSame(today, "day")) {
      return "Today";
    }

    if (inputDate.isSame(yesterday, "day")) {
      return "Yesterday";
    }

    return inputDate.format("MMM D, YYYY");
  }

  static getCurrentTime(): string {
    return moment().format("hh:mmA");
  }

  static getDateCurrentTime(): string {
    return moment().format("YYYY-MM-DD hh:mmA");
  }

  static escapeRegex(text: string): string {
    return text.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&").trim();
  }

  static getBaseUrl(): string {
    return process.env.APP_URL || "";
  }

  /**
   * Returns true if the current date is more than overDueDays past the due date.
   * Uses 18 as default when overDueDays is 0 or not set.
   */
  static isOverDue(dueDate: unknown, overDueDays: number = 18): boolean {
    if (!dueDate || (typeof dueDate !== "string" && !(dueDate instanceof Date)))
      return false;
    const due = typeof dueDate === "string" ? new Date(dueDate) : dueDate;
    const now = new Date();
    const msPerDay = 24 * 60 * 60 * 1000;
    const daysPastDue = Math.floor((now.getTime() - due.getTime()) / msPerDay);
    const threshold = overDueDays > 0 ? overDueDays : 18;
    return daysPastDue > threshold;
  }
}
