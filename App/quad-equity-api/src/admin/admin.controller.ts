import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { FileInterceptor } from "@nestjs/platform-express";
import * as path from "path";
import { Response, Express } from "express";
import { I18n, I18nContext } from "nestjs-i18n";
import { AccountActiveGuard } from "../auth/jwt.guard";
import { CryptoGuard } from "../auth/crypto.guard";
import { FileHelper } from "../helpers/file.helper";
import { RequestWithUser } from "../interface/common";
import { UsersService } from "../users/users.service";
import { AdminUpdatePasswordDto, AdminUpdateProfileDto } from "./dto/admin.dto";

@Controller("admin")
@UseGuards(AuthGuard("jwt"), AccountActiveGuard, CryptoGuard)
export class AdminController {
  constructor(private readonly userService: UsersService) {}

  private canEditTarget(requestUserId: string, requestRoleId: number, targetId: string) {
    if (requestRoleId === 1) return true;
    if (requestRoleId === 2 && requestUserId === targetId) return true;
    return false;
  }

  @Get("details/:id")
  async getAdminDetail(
    @Req() request: RequestWithUser,
    @Param("id") id: string,
    @Res() res: Response,
    @I18n() i18n: I18nContext,
  ) {
    if (!this.canEditTarget(request.user.id, Number(request.user.role_id), id)) {
      throw new ForbiddenException("You are not allowed to view this admin.");
    }

    const data = await this.userService.findAdminDetail(id);
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      message: i18n.t("messages.DATA_RECEIVED"),
      data,
    });
  }

  @Put("update")
  async updateAdmin(
    @Req() request: RequestWithUser,
    @Body() body: AdminUpdateProfileDto,
    @Res() res: Response,
    @I18n() i18n: I18nContext,
  ) {
    if (!this.canEditTarget(request.user.id, Number(request.user.role_id), body.id)) {
      throw new ForbiddenException("You are not allowed to edit this admin.");
    }

    const oldValue = await this.userService.findAdminDetail(body.id);
    await this.userService.updateAdminProfileById(body, body.id);
    const userDetail = await this.userService.findAdminDetail(body.id);
    await this.userService.createAudit({
      table_id: body.id,
      table_name: "users",
      oldValue,
      newValue: userDetail,
      action: "UPDATE",
      userId: request.user.id.toString(),
      ipAddress: request.ip,
    });

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      message: i18n.t("messages.PROFILE_UPDATED"),
      data: userDetail,
    });
  }

  @Post("update-password")
  async updateAdminPassword(
    @Req() request: RequestWithUser,
    @Body() body: AdminUpdatePasswordDto,
    @Res() res: Response,
  ) {
    if (!this.canEditTarget(request.user.id, Number(request.user.role_id), body.id)) {
      throw new ForbiddenException("You are not allowed to edit this admin password.");
    }

    const oldValue = await this.userService.findAdminDetail(body.id);
    await this.userService.updatePasswordByAdmin(body.password, body.id);
    const userDetail = await this.userService.findAdminDetail(body.id);
    await this.userService.createAudit({
      table_id: body.id,
      table_name: "users",
      oldValue,
      newValue: userDetail,
      action: "UPDATE_PASSWORD",
      userId: request.user.id.toString(),
      ipAddress: request.ip,
    });

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      message: "Password updated successfully.",
      data: {},
    });
  }

  @Post("profile-image")
  @UseInterceptors(FileInterceptor("image"))
  async updateAdminProfileImage(
    @Req() request: RequestWithUser,
    @Res() res: Response,
    @UploadedFile() file: Express.Multer.File,
    @I18n() i18n: I18nContext,
    @Body("id") id?: string,
  ) {
    const targetId = id || request.user.id;
    if (!this.canEditTarget(request.user.id, Number(request.user.role_id), targetId)) {
      throw new ForbiddenException("You are not allowed to edit this admin image.");
    }

    let image = "";
    if (file) {
      const userImages = await this.userService.findOne(targetId);
      const publicPath = path.resolve(process.cwd(), "public/user");
      const thumbPath = path.join(publicPath, "thumb");
      const newFileName = FileHelper.generateUniqueFileName(file.originalname);
      if (userImages?.image) {
        const oldFilePath = path.join(publicPath, userImages.image);
        FileHelper.unlinkFile(oldFilePath);

        const oldThumbPath = path.join(thumbPath, userImages.image);
        FileHelper.unlinkFile(oldThumbPath);
      }
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

    await this.userService.updateProfileImage(image, targetId);
    const userDetail = await this.userService.findAdminDetail(targetId);
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      message: i18n.t("messages.PROFILE_UPDATED"),
      data: userDetail,
    });
  }
}
