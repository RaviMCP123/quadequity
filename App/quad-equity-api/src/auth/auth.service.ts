import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import moment from "moment";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { User } from "../users/user.schema";
import { UsersService } from "../users/users.service";

interface JwtPayload {
  id: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel("User") private userModel: Model<User>,
    private usersService: UsersService,
  ) {}

  async generateTokens(userId: string) {
    const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: "5d",
    });
    const refreshToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: "5d",
    });

    return { accessToken, refreshToken };
  }

  async getPayloadFromToken(token: string): Promise<JwtPayload> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
      return decoded;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }

  async login(
    username: string,
    password: string,
    ipAddress: string,
  ): Promise<User> {
    const user = await this.userModel.findOne({
      email: username,
      role_id: { $in: [1, 2] },
    });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new HttpException(
        "Invalid login details.",
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const { accessToken, refreshToken } = await this.generateTokens(
      user._id.toString(),
    );

    await this.userModel.updateOne(
      { _id: user._id },
      {
        accessToken: accessToken,
        refreshToken: refreshToken,
        last_login_at: moment().format("MM ddd, YYYY HH:mm a"),
        ip: ipAddress,
      },
    );
    return await this.usersService.findOne(user._id.toString());
  }

  async refreshToken(token: string) {
    try {
      const payload = await this.getPayloadFromToken(token);
      const { id } = payload;
      const { accessToken, refreshToken } = await this.generateTokens(id);
      await this.userModel.updateOne(
        { _id: id },
        {
          accessToken: accessToken,
          refreshToken: refreshToken,
          last_login_at: moment().format("MM ddd, YYYY HH:mm a"),
        },
      );
      return { accessToken, refreshToken };
    } catch (error) {
      console.error("Token is invalid:", error.message);
      throw new HttpException("Unauthorized", HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }

  private async findAdminByEmail(email: string): Promise<User> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.userModel.findOne({
      email: normalizedEmail,
      role_id: { $in: [1, 2] },
      is_delete: false,
    });
    if (!user) {
      throw new HttpException(
        "No admin account found for this email address.",
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    return user;
  }

  private generateOtp(): string {
    return "123456";
  }

  private async sendOtpEmail(email: string, firstName: string, otp: string) {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.SMTP_FROM || user;

    if (!host || !from) {
      throw new HttpException(
        "SMTP configuration is missing. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and SMTP_FROM.",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: user && pass ? { user, pass } : undefined,
    });

    await transporter.sendMail({
      from,
      to: email,
      subject: "Your Quad Equity CMS OTP",
      text: `Hello ${firstName || "there"}, your OTP is ${otp}. It expires in 5 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
          <h2 style="margin-bottom: 12px;">Quad Equity CMS</h2>
          <p>Hello ${firstName || "there"},</p>
          <p>Use the following OTP to reset your password:</p>
          <div style="font-size: 28px; font-weight: 700; letter-spacing: 6px; margin: 16px 0;">
            ${otp}
          </div>
          <p>This OTP expires in 5 minutes.</p>
        </div>
      `,
    });
  }

  async sendForgotPasswordOtp(username: string) {
    const user = await this.findAdminByEmail(username);
    const otp = this.generateOtp();
    const resetOtpHash = await bcrypt.hash(otp, 10);
    const resetOtpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await this.userModel.updateOne(
      { _id: user._id },
      {
        resetOtpHash,
        resetOtpExpiresAt,
        resetOtpVerifiedAt: null,
      },
    );
    // SMTP is intentionally disabled for now; use the fixed OTP above in local/dev flows.
  }

  async verifyResetOtp(username: string, otp: string) {
    const user = await this.findAdminByEmail(username);

    if (!user.resetOtpHash || !user.resetOtpExpiresAt) {
      throw new HttpException(
        "OTP has not been requested yet.",
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    if (new Date(user.resetOtpExpiresAt).getTime() < Date.now()) {
      throw new HttpException("OTP has expired.", HttpStatus.UNPROCESSABLE_ENTITY);
    }

    const isValid = await bcrypt.compare(otp, user.resetOtpHash);
    if (!isValid) {
      throw new HttpException("Invalid OTP.", HttpStatus.UNPROCESSABLE_ENTITY);
    }

    await this.userModel.updateOne(
      { _id: user._id },
      { resetOtpVerifiedAt: new Date() },
    );
  }

  async resetPassword(username: string, password: string) {
    const user = await this.findAdminByEmail(username);

    if (!user.resetOtpHash || !user.resetOtpExpiresAt || !user.resetOtpVerifiedAt) {
      throw new HttpException(
        "OTP verification is required before resetting password.",
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    if (new Date(user.resetOtpExpiresAt).getTime() < Date.now()) {
      throw new HttpException("OTP has expired.", HttpStatus.UNPROCESSABLE_ENTITY);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await this.userModel.updateOne(
      { _id: user._id },
      {
        password: hashedPassword,
        accessToken: "",
        refreshToken: "",
        resetOtpHash: "",
        resetOtpExpiresAt: null,
        resetOtpVerifiedAt: null,
      },
    );
  }
}
