import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  Res,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Response } from "express";
import { I18n, I18nContext } from "nestjs-i18n";
import { AccountActiveGuard } from "../auth/jwt.guard";
import { ContactService } from "./contact.service";
import { CreatePublicContactDto, ContactListQueryDto } from "./dto/contact.dto";

@Controller("contact")
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  /**
   * Public: save a contact form submission (used by quad-equity-web).
   */
  @Post()
  async create(
    @Body() body: CreatePublicContactDto,
    @Res() res: Response,
    @I18n() i18n: I18nContext,
  ) {
    const saved = await this.contactService.create(body);
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      message: i18n.t("messages.DATA_RECEIVED"),
      data: { id: saved._id.toString() },
    });
  }

  /**
   * Admin: list submissions (paginated).
   */
  @Get()
  @UseGuards(AuthGuard("jwt"), AccountActiveGuard)
  async list(
    @Query() query: ContactListQueryDto,
    @Res() res: Response,
    @I18n() i18n: I18nContext,
  ) {
    const { results, total, page, limit } = await this.contactService.findAll(
      query,
    );
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      message: i18n.t("messages.DATA_RECEIVED"),
      data: {
        results,
        pagination: {
          total,
          page,
          currentPage: page,
          limit,
        },
      },
    });
  }
}
