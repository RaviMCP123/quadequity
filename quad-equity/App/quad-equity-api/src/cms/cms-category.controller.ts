import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Res,
  HttpStatus,
  UseGuards,
  Req,
} from "@nestjs/common";
import { Response } from "express";
import { I18n, I18nContext } from "nestjs-i18n";
import { AuthGuard } from "@nestjs/passport";
import { CmsCategoryService } from "./cms-category.service";
import {
  CreateCmsCategoryDto,
  UpdateCmsCategoryDto,
  UpdateCmsCategoryStatusDto,
  FindAllCmsCategoryQueryDto,
} from "./dto/cms-category.dto";
import { AccountActiveGuard } from "../auth/jwt.guard";
import { RequestWithUser } from "../interface/common";
import { AuditLogService } from "../audit-log/audit-log.service";

@Controller("cms/category")
export class CmsCategoryController {
  constructor(
    private readonly cmsCategoryService: CmsCategoryService,
    private readonly auditLogService: AuditLogService,
  ) {}

  /**
   * Retrieves a paginated list of CMS categories.
   */
  @Get()
  @UseGuards(AuthGuard("jwt"), AccountActiveGuard)
  async findAll(
    @Query() queryParams: FindAllCmsCategoryQueryDto,
    @Res() res: Response,
    @I18n() i18n: I18nContext,
  ) {
    const data = await this.cmsCategoryService.findAll(queryParams);
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      message: "CMS Categories retrieved successfully",
      data: {
        results: data.results,
        pagination: {
          total: data.total,
          page: data.page,
          currentPage: data.page,
          limit: data.limit,
          totalPages: data.totalPages,
        },
      },
    });
  }

  /**
   * Retrieves a simple list of all CMS categories (no pagination).
   */
  @Get("list")
  // @UseGuards(AuthGuard("jwt"), AccountActiveGuard)
  async findList(
    @Res() res: Response,
    @I18n() i18n: I18nContext,
    @Query("status") status?: string,
    @Query("placement") placement?: string, // Can be comma-separated: "header,footer"
  ) {
    const filters: any = {};
    if (status !== undefined) {
      filters.status = status === "true";
    }
    if (placement) {
      filters.placement = placement;
    }

    const categories = await this.cmsCategoryService.findList(filters);
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      message: "CMS Categories retrieved successfully",
      data: categories,
    });
  }

  /**
   * Gets the sort order counts for each placement type.
   * Returns the total number of items in each placement.
   */
  @Get("placement/sort-orders")
  @UseGuards(AuthGuard("jwt"), AccountActiveGuard)
  async getPlacementSortOrders(
    @Res() res: Response,
    @I18n() i18n: I18nContext,
  ) {
    const counts = await this.cmsCategoryService.getPlacementSortOrderCounts();
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      message: "Placement sort order counts retrieved successfully",
      data: counts,
    });
  }

  /**
   * Retrieves a single CMS category by ID.
   */
  @Get(":id")
  @UseGuards(AuthGuard("jwt"), AccountActiveGuard)
  async findOne(
    @Param("id") id: string,
    @Res() res: Response,
    @I18n() i18n: I18nContext,
  ) {
    const category = await this.cmsCategoryService.findOne(id);
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      message: "CMS Category retrieved successfully",
      data: category,
    });
  }

  /**
   * Creates a new CMS category.
   */
  @Post()
  @UseGuards(AuthGuard("jwt"), AccountActiveGuard)
  async create(
    @Body() createDto: CreateCmsCategoryDto,
    @Res() res: Response,
    @Req() req: RequestWithUser,
    @I18n() i18n: I18nContext,
  ) {
    const createdCategory = await this.cmsCategoryService.create(createDto);
    await this.auditLogService.createAudit({
      table_id: createdCategory._id.toString(),
      table_name: "cms_categories",
      oldValue: null,
      newValue: createdCategory,
      action: "CREATE",
      userId: req.user.id,
      ipAddress: req.ip,
    });
    return res.status(HttpStatus.CREATED).json({
      statusCode: HttpStatus.CREATED,
      message: "CMS Category created successfully",
      data: createdCategory,
    });
  }

  /**
   * Updates an existing CMS category.
   */
  @Put(":id")
  @UseGuards(AuthGuard("jwt"), AccountActiveGuard)
  async update(
    @Param("id") id: string,
    @Body() body: any,
    @Res() res: Response,
    @Req() req: RequestWithUser,
    @I18n() i18n: I18nContext,
  ) {
    // Strip MongoDB-specific fields that shouldn't be in the DTO
    const { _id, __v, createdAt, updatedAt, id: bodyId, ...cleanBody } = body;
    
    // Use id from URL parameter, but fallback to body if URL param is undefined
    const categoryId = id && id !== 'undefined' ? id : (bodyId || _id);
    
    if (!categoryId) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Category ID is required.",
        data: {},
      });
    }

    // Validate the cleaned body as UpdateCmsCategoryDto
    const updateDto: UpdateCmsCategoryDto = cleanBody;
    
    const existingCategory = await this.cmsCategoryService.findOne(categoryId);
    const updatedCategory = await this.cmsCategoryService.update(
      categoryId,
      updateDto,
    );
    await this.auditLogService.createAudit({
      table_id: updatedCategory._id.toString(),
      table_name: "cms_categories",
      oldValue: existingCategory,
      newValue: updatedCategory,
      action: "UPDATED",
      userId: req.user.id,
      ipAddress: req.ip,
    });
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      message: "CMS Category updated successfully",
      data: updatedCategory,
    });
  }

  /**
   * Updates the status of a CMS category.
   */
  @Patch(":id/status")
  @UseGuards(AuthGuard("jwt"), AccountActiveGuard)
  async updateStatus(
    @Param("id") id: string,
    @Body() statusDto: UpdateCmsCategoryStatusDto,
    @Res() res: Response,
    @Req() req: RequestWithUser,
    @I18n() i18n: I18nContext,
  ) {
    const existingCategory = await this.cmsCategoryService.findOne(id);
    const updatedCategory = await this.cmsCategoryService.update(id, {
      status: statusDto.status,
    });
    await this.auditLogService.createAudit({
      table_id: updatedCategory._id.toString(),
      table_name: "cms_categories",
      oldValue: existingCategory,
      newValue: updatedCategory,
      action: "UPDATED",
      userId: req.user.id,
      ipAddress: req.ip,
    });
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      message: "CMS Category status updated successfully",
      data: updatedCategory,
    });
  }

  /**
   * Deletes a CMS category.
   */
  @Delete(":id")
  @UseGuards(AuthGuard("jwt"), AccountActiveGuard)
  async delete(
    @Param("id") id: string,
    @Res() res: Response,
    @Req() req: RequestWithUser,
    @I18n() i18n: I18nContext,
  ) {
    const existingCategory = await this.cmsCategoryService.findOne(id);
    await this.cmsCategoryService.delete(id);
    await this.auditLogService.createAudit({
      table_id: existingCategory._id.toString(),
      table_name: "cms_categories",
      oldValue: existingCategory,
      newValue: null,
      action: "DELETE",
      userId: req.user.id,
      ipAddress: req.ip,
    });
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      message: "CMS Category deleted successfully",
    });
  }
}
