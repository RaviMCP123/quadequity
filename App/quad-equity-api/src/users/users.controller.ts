import {
  Controller,
  Get,
  Res,
  Post,
  HttpStatus,
  Req,
  UseGuards,
  Body,
  UseInterceptors,
  UploadedFile,
  Delete,
  Put,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { FileInterceptor } from "@nestjs/platform-express";
import * as path from "path";
import { Response, Express } from "express";
import { I18n, I18nContext } from "nestjs-i18n";
import * as jwt from "jsonwebtoken";
import { UsersService } from "./users.service";
import { AccountActiveGuard } from "../auth/jwt.guard";
import { CryptoGuard } from "../auth/crypto.guard";
import {
  UpdateProfileDto,
  UpdatePasswordDto,
  UpdateNotificationDto,
} from "./dto/user.dto";
import { FileHelper } from "../helpers/file.helper";
import { RequestWithUser } from "../interface/common";

@Controller("users")
@UseGuards(AuthGuard("jwt"), AccountActiveGuard, CryptoGuard)
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  /**
   * Generates a new pair of JWT access and refresh tokens for a user.
   *
   * @param userId - The ID of the user for whom tokens are generated
   * @returns Object containing the accessToken (short-lived) and refreshToken (long-lived)
   */
  async generateTokens(userId: string) {
    const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: "5d",
    });
    const refreshToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: "5d",
    });

    return { accessToken, refreshToken };
  }

  /**
   * Retrieves the current user details.
   *
   * @param request - Express Request object
   * @param res - Express Response object
   */

  @Get("detail")
  async getUsersDetail(
    @Req() request: RequestWithUser,
    @Res() res: Response,
    @I18n() i18n: I18nContext,
  ) {
    const userId = request.user.id;
    const roleId = request.user.role_id;
    let userDetail = {};
    if (roleId === 3) {
      userDetail = await this.userService.findProfile(userId.toString());
    } else {
      userDetail = await this.userService.findOne(userId);
    }
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      message: i18n.t("messages.DATA_RECEIVED"),
      data: userDetail,
    });
  }

  /**
   * Updates the current user profile.
   *
   * @param request - Express Request object
   * @param res - Express Response object
   */
  @Post("update-profile")
  async updateProfile(
    @Req() request: RequestWithUser,
    @Body() body: UpdateProfileDto,
    @Res() res: Response,
    @I18n() i18n: I18nContext,
  ) {
    const userId = request.user.id;
    const oldValue = await this.userService.findOne(userId);
    await this.userService.updateProfile(body, userId);
    const roleId = request.user.role_id;
    let userDetail = {};
    if (roleId === 3) {
      userDetail = await this.userService.findProfile(userId.toString());
    } else {
      userDetail = await this.userService.findOne(userId);
    }
    await this.userService.createAudit({
      table_id: userId.toString(),
      table_name: "users",
      oldValue: oldValue,
      newValue: userDetail,
      action: "UPDATE",
      userId: userId.toString(),
      ipAddress: request.ip,
    });

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      message: i18n.t("messages.PROFILE_UPDATED"),
      data: userDetail,
    });
  }

  /**
   * Updates the current user profile image.
   *
   * @param request - Express Request object
   * @param res - Express Response object
   */
  @Post("update-profile-image")
  @UseInterceptors(FileInterceptor("image"))
  async updateProfileImage(
    @Req() request: RequestWithUser,
    @Res() res: Response,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const userId = request.user.id;
    let image = "";
    if (file) {
      const userImages = await this.userService.findOne(userId);
      const publicPath = path.resolve(process.cwd(), "public/user");
      const thumbPath = path.join(publicPath, "thumb");
      const newFileName = FileHelper.generateUniqueFileName(file.originalname);
      if (userImages.image) {
        const oldFilePath = path.join(publicPath, userImages.image);
        FileHelper.unlinkFile(oldFilePath);

        const oldThumbPath = path.join(thumbPath, userImages.image);
        FileHelper.unlinkFile(oldThumbPath);
      }
      // Create the public and thumb directories if they don't exist
      FileHelper.createDirectoryIfNotExists(publicPath);
      FileHelper.createDirectoryIfNotExists(thumbPath);
      FileHelper.saveFile(file.buffer, newFileName, publicPath);
      await FileHelper.resizeAndSaveImage(
        file.buffer,
        newFileName,
        thumbPath,
        250,
        250,
      );
      image = newFileName;
    }
    await this.userService.updateProfileImage(image, userId);
    const roleId = request.user.role_id;
    let userDetail = {};
    if (roleId === 3) {
      userDetail = await this.userService.findProfile(userId.toString());
    } else {
      userDetail = await this.userService.findOne(userId);
    }
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      message: "Profile Image updated successfully.",
      data: userDetail,
    });
  }

  /**
   * Updates the current user password.
   *
   * @param request - Express Request object
   * @param res - Express Response object
   */
  @Post("update-password")
  async updatePassword(
    @Req() request: RequestWithUser,
    @Body() body: UpdatePasswordDto,
    @Res() res: Response,
  ) {
    const userId = request.user.id;
    const oldValue = await this.userService.findOne(userId);
    await this.userService.updatePassword(body, userId);
    const userDetail = await this.userService.findOne(userId);
    await this.userService.createAudit({
      table_id: userDetail._id.toString(),
      table_name: "users",
      oldValue: oldValue,
      newValue: userDetail,
      action: "UPDATE_PASSWORD",
      userId: userDetail._id.toString(),
      ipAddress: request.ip,
    });
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      message: "Password updated successfully.",
      data: {},
    });
  }

  /**
   * Deletes the current user account.
   *
   * @param request - Express Request object
   * @param res - Express Response object
   */
  @Delete("account-delete")
  async deleteAccount(
    @Req() request: RequestWithUser,
    @Res() res: Response,
    @I18n() i18n: I18nContext,
  ) {
    const userId = request.user.id;
    await this.userService.deleteAccount(userId);
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      message: i18n.t("messages.ACCOUNT_DELETE"),
      data: {},
    });
  }

  /**
   * Updates notification preferences for the current user.
   *
   * @param request - Express Request object
   * @param res - Express Response object
   */
  @Put("update-notification")
  async updateNotification(
    @Req() request: RequestWithUser,
    @Body() body: UpdateNotificationDto,
    @Res() res: Response,
    @I18n() i18n: I18nContext,
  ) {
    const userId = request.user.id;
    const oldValue = await this.userService.findOne(userId);
    await this.userService.updateNotification(body, userId);
    const userDetail = await this.userService.findProfile(userId.toString());
    await this.userService.createAudit({
      table_id: userDetail._id.toString(),
      table_name: "users",
      oldValue: oldValue,
      newValue: userDetail,
      action: "UPDATE_PASSWORD",
      userId: userDetail._id.toString(),
      ipAddress: request.ip,
    });
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      message: body.notification
        ? i18n.t("messages.NOTIFICATION_ENABLE")
        : i18n.t("messages.NOTIFICATION_DISABLE"),
      data: userDetail,
    });
  }
}
