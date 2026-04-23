import { Body, Controller, HttpStatus, Post, Res, UseGuards } from "@nestjs/common";
import { Response } from "express";
import { I18n, I18nContext } from "nestjs-i18n";
import { CryptoGuard } from "./crypto.guard";
import { AuthService } from "./auth.service";
import { VerifyOtpDto } from "./dto/forgot-password.dto";

@Controller("otp")
@UseGuards(CryptoGuard)
export class OtpController {
  constructor(private readonly authService: AuthService) {}

  @Post("verify")
  async verify(
    @Body() body: VerifyOtpDto,
    @Res() res: Response,
    @I18n() i18n: I18nContext,
  ) {
    await this.authService.verifyResetOtp(body.username, body.otp);
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      message: i18n.t("messages.DATA_RECEIVED") || "OTP verified successfully.",
      data: {},
    });
  }
}
