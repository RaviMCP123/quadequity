import {
  Controller,
  Post,
  Body,
  Res,
  HttpStatus,
  Req,
  UseGuards,
} from "@nestjs/common";
import { I18n, I18nContext } from "nestjs-i18n";
import { Response, Request } from "express";
import { AuthService } from "./auth.service";
import { CryptoGuard } from "../auth/crypto.guard";
import { LoginDto } from "./dto/login.dto";
import {
  ForgotPasswordDto,
  ResetPasswordDto,
} from "./dto/forgot-password.dto";
import { AuditLogService } from "../audit-log/audit-log.service";

@Controller("auth")
@UseGuards(CryptoGuard)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly auditLogService: AuditLogService,
  ) {}

  @Post("login")
  async login(
    @Req() request: Request,
    @Body() body: LoginDto,
    @Res() res: Response,
  ) {
    const ipAddress = request.ip;
    const userDetail = await this.authService.login(
      body.username,
      body.password,
      ipAddress,
    );
    await this.auditLogService.createAudit({
      table_id: userDetail._id.toString(),
      table_name: "users",
      oldValue: null,
      newValue: userDetail,
      action: "LOGIN",
      userId: userDetail._id.toString(),
      ipAddress: request.ip,
    });
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      message: "Login successful.",
      data: userDetail,
    });
  }

  @Post("refresh")
  async refresh(
    @Body() body: { refreshToken: string },
    @Res() res: Response,
    @I18n() i18n: I18nContext,
  ) {
    const tokens = await this.authService.refreshToken(body.refreshToken);
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      message: i18n.t("messages.NEW_ACCESS_TOKEN"),
      data: tokens,
    });
  }

  @Post("forgot-password")
  async forgotPassword(
    @Body() body: ForgotPasswordDto,
    @Res() res: Response,
  ) {
    await this.authService.sendForgotPasswordOtp(body.username);
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      message: "OTP sent successfully.",
      data: {},
    });
  }

  @Post("reset-password")
  async resetPassword(
    @Body() body: ResetPasswordDto,
    @Res() res: Response,
  ) {
    await this.authService.resetPassword(body.username, body.password);
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      message: "Password updated successfully.",
      data: {},
    });
  }
}
