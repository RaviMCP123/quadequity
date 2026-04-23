import {
  Controller,
  Post,
  Put,
  Patch,
  Body,
  Res,
  Get,
  Param,
  Query,
  HttpStatus,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFiles,
  Delete,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { Response } from "express";
import { I18n, I18nContext } from "nestjs-i18n";
import { AuthGuard } from "@nestjs/passport";
import { AnyFilesInterceptor } from "@nestjs/platform-express";
import * as path from "path";
import { Types } from "mongoose";
import { PageService } from "./page.service";
import { AuditLogService } from "../audit-log/audit-log.service";
import { AccountActiveGuard } from "../auth/jwt.guard";
import { PageDto, FindAllQueryDto } from "./dto/page.dto";
import { RequestWithUser } from "../interface/common";
import { FileHelper } from "../helpers/file.helper";
import { Helper } from "../helpers";

/**
 * File filter to accept only image files
 * Validates MIME type and file extension
 */
function imageFileFilter(
  req: any,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
): void {
  // Allowed image MIME types
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    "image/bmp",
    "image/tiff",
    "image/x-icon",
  ];

  // Allowed file extensions
  const allowedExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".webp",
    ".svg",
    ".bmp",
    ".tiff",
    ".ico",
  ];

  // Check MIME type
  const isValidMimeType = allowedMimeTypes.includes(file.mimetype.toLowerCase());

  // Check file extension
  const fileExtension = path.extname(file.originalname).toLowerCase();
  const isValidExtension = allowedExtensions.includes(fileExtension);

  if (isValidMimeType && isValidExtension) {
    callback(null, true);
  } else {
    callback(
      new Error(
        `Invalid file type. Only image files are allowed. Received: ${file.mimetype}`,
      ),
      false,
    );
  }
}

@Controller("page")
export class PageController {
  constructor(
    private readonly pageService: PageService,
    private readonly auditLogService: AuditLogService,
  ) {}

  /**
   * Creates a new page.
   * Supports both JSON and FormData (for template pages with image uploads).
   *
   * @param body - Page data (PageDto)
   * @param files - Uploaded files (for template pages)
   * @param res - Express Response object
   * @param request - Express Request object
   * @param i18n - I18n context
   */
  @Post()
  @UseGuards(AuthGuard("jwt"), AccountActiveGuard)
  @UseInterceptors(
    AnyFilesInterceptor({
      limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
      fileFilter: imageFileFilter,
    }),
  )
  async addPage(
    @Body() body: PageDto | string | any,
    @UploadedFiles() files: Express.Multer.File[],
    @Res() res: Response,
    @Req() req: RequestWithUser,
    @I18n() i18n: I18nContext,
  ) {
    // Handle FormData: check if body has a 'data' field (FormData) or is already parsed
    let pageData: PageDto;
    
    // If body has a 'data' property (FormData with JSON string in 'data' field)
    if (body && typeof body === 'object' && body.data && typeof body.data === 'string') {
      try {
        pageData = JSON.parse(body.data);
      } catch {
        throw new Error('Invalid JSON in data field');
      }
    }
    // If body is a string (direct JSON string)
    else if (typeof body === "string") {
      try {
        pageData = JSON.parse(body);
      } catch {
        throw new Error('Invalid JSON in request body');
      }
    }
    // If body is already an object (regular JSON request)
    else {
      pageData = body as PageDto;
    }

    // Helper function to extract string value from title/description (handles both string and object formats)
    const getStringValue = (value: any): string => {
      if (!value) return '';
      if (typeof value === 'string') return value;
      if (typeof value === 'object') {
        return value.en || Object.values(value)[0] || '';
      }
      return String(value);
    };

    // Validate required fields
    // For blog pages, title/description might be empty or come from blogSections
    const isBlogPage = pageData.templateKey === 'BLOG_TEMPLATE_V1' || pageData.category === 'blog';
    // For template pages, description is optional
    const isTemplatePage = !!pageData.templateKey;
    
    const titleString = getStringValue(pageData.title);
    const descriptionString = getStringValue(pageData.description);
    
    // Title is always required (unless it's a blog page that can extract from blogSections)
    if (!isBlogPage && (!titleString || titleString.trim() === '')) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Title is required.",
        data: {},
      });
    }
    
    // Description is required only for non-template, non-blog pages
    if (!isBlogPage && !isTemplatePage && (!descriptionString || descriptionString.trim() === '')) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Description is required.",
        data: {},
      });
    }

    // For blog pages, extract title from blogSections if title is empty
    if (isBlogPage && (!titleString || titleString.trim() === '')) {
      if (pageData.blogSections && Array.isArray(pageData.blogSections) && pageData.blogSections.length > 0) {
        const firstSection = pageData.blogSections[0];
        if (firstSection.title) {
          // Extract title from first section
          const extractedTitle = getStringValue(firstSection.title);
          if (extractedTitle && extractedTitle.trim() !== '') {
            pageData.title = extractedTitle;
          }
        }
      }
      // If still no title, use a default
      if (!getStringValue(pageData.title) || getStringValue(pageData.title).trim() === '') {
        pageData.title = 'Blog Post';
      }
    }

    // For blog pages, extract description from blogSections if description is empty
    if (isBlogPage && (!descriptionString || descriptionString.trim() === '')) {
      if (pageData.blogSections && Array.isArray(pageData.blogSections) && pageData.blogSections.length > 0) {
        const firstSection = pageData.blogSections[0];
        if (firstSection.description) {
          // Extract description from first section
          const extractedDescription = getStringValue(firstSection.description);
          if (extractedDescription && extractedDescription.trim() !== '') {
            pageData.description = extractedDescription;
          }
        }
      }
      // If still no description, use a default
      if (!getStringValue(pageData.description) || getStringValue(pageData.description).trim() === '') {
        pageData.description = ' ';
      }
    }

    // Parse nested objects in content that might be JSON strings
    if (pageData.content) {
      pageData.content = this.parseContentObjects(pageData.content);
    }

    // Parse nested objects in pageSections that might be JSON strings
    if (pageData.pageSections && Array.isArray(pageData.pageSections)) {
      pageData.pageSections = pageData.pageSections.map((section: any) => 
        this.parseContentObjects(section)
      );
    }

    // Parse nested objects in blogSections that might be JSON strings
    if (pageData.blogSections && Array.isArray(pageData.blogSections)) {
      pageData.blogSections = pageData.blogSections.map((section: any) => 
        this.parseContentObjects(section)
      );
    }

    // Parse nested objects in banner fields that might be JSON strings
    if (pageData.bannerTitle) {
      if (typeof pageData.bannerTitle === 'string') {
        try {
          (pageData as any).bannerTitle = JSON.parse(pageData.bannerTitle);
        } catch {
          // If not JSON, convert to object format
          (pageData as any).bannerTitle = { en: pageData.bannerTitle };
        }
      }
    }
    if (pageData.bannerDescription) {
      if (typeof pageData.bannerDescription === 'string') {
        try {
          (pageData as any).bannerDescription = JSON.parse(pageData.bannerDescription);
        } catch {
          // If not JSON, convert to object format
          (pageData as any).bannerDescription = { en: pageData.bannerDescription };
        }
      }
    }

    // Parse nested objects in footer template fields that might be JSON strings
    const footerFields = ['copyrightText', 'footerDescription', 'footerLinks', 'quickLinks', 'quickLinksTitle', 'socialLinksTitle'];
    for (const field of footerFields) {
      if (pageData[field]) {
        if (typeof pageData[field] === 'string') {
          try {
            (pageData as any)[field] = JSON.parse(pageData[field]);
          } catch {
            // If not JSON, convert to object format
            (pageData as any)[field] = { en: pageData[field] };
          }
        }
      }
    }

    // Parse nested objects in SEO fields that might be JSON strings
    if (pageData.metaTitle) {
      if (typeof pageData.metaTitle === 'string') {
        try {
          (pageData as any).metaTitle = JSON.parse(pageData.metaTitle);
        } catch {
          // If not JSON, convert to object format
          (pageData as any).metaTitle = { en: pageData.metaTitle };
        }
      }
    }
    if (pageData.metaDescription) {
      if (typeof pageData.metaDescription === 'string') {
        try {
          (pageData as any).metaDescription = JSON.parse(pageData.metaDescription);
        } catch {
          // If not JSON, convert to object format
          (pageData as any).metaDescription = { en: pageData.metaDescription };
        }
      }
    }

    // Validate schemaMarkup if provided
    // Can be either: 1) Plain JSON string, or 2) JSON wrapped in <script> tags
    if (pageData.schemaMarkup && typeof pageData.schemaMarkup === 'string' && pageData.schemaMarkup.trim() !== '') {
      try {
        // Try to parse as-is first (in case it's plain JSON)
        JSON.parse(pageData.schemaMarkup);
      } catch {
        // If that fails, try to extract JSON from script tags
        try {
          // Extract JSON from <script type="application/ld+json">...</script>
          const scriptMatch = pageData.schemaMarkup.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
          if (scriptMatch && scriptMatch[1]) {
            // Validate the extracted JSON
            JSON.parse(scriptMatch[1].trim());
            // If valid, keep the original string with script tags
          } else {
            // No script tags found, but also not valid JSON - log warning
            console.warn('Invalid JSON in schemaMarkup, but keeping original value');
          }
        } catch {
          // If both fail, log warning but keep the original value (don't set to empty)
          console.warn('Could not validate JSON in schemaMarkup, but keeping original value');
        }
      }
    }

    // Ensure robotsIndex and robotsFollow are booleans
    if (pageData.robotsIndex !== undefined) {
      (pageData as any).robotsIndex = pageData.robotsIndex === true || String(pageData.robotsIndex) === 'true';
    }
    if (pageData.robotsFollow !== undefined) {
      (pageData as any).robotsFollow = pageData.robotsFollow === true || String(pageData.robotsFollow) === 'true';
    }

    // Process file uploads for template pages
    if (files && files.length > 0) {
      // Process banner image
      pageData = await this.processBannerImage(pageData, files);
      
      // Process featured image (for blog posts)
      pageData = await this.processFeaturedImage(pageData, files);
      
      if (pageData.content) {
      pageData.content = await this.processContentImages(
        pageData.content,
        files,
      );
      }
      // Also process pageSections images if present
      if (pageData.pageSections && Array.isArray(pageData.pageSections)) {
        pageData.pageSections = await this.processPageSectionsImages(
          pageData.pageSections,
          files,
        );
      }
      // Also process blogSections images if present
      if (pageData.blogSections && Array.isArray(pageData.blogSections)) {
        pageData.blogSections = await this.processBlogSectionsImages(
          pageData.blogSections,
          files,
        );
      }
    }

    const createdPage = await this.pageService.createPage(pageData);
    await this.auditLogService.createAudit({
      table_id: createdPage._id.toString(),
      table_name: "pages",
      oldValue: null,
      newValue: createdPage,
      action: "CREATE",
      userId: req.user.id,
      ipAddress: req.ip,
    });
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      message: i18n.t("messages.PAGE_CREATED"),
      data: {},
    });
  }

  /**
   * Updates an existing page by ID (from URL parameter).
   * Supports both JSON and FormData (for template pages with image uploads).
   *
   * @param id - Page ID from URL parameter
   * @param body - Page data (PageDto)
   * @param files - Uploaded files (for template pages)
   * @param res - Express Response object
   * @param request - Express Request object
   * @param i18n - I18n context
   */
  @Put(":id")
  @UseGuards(AuthGuard("jwt"), AccountActiveGuard)
  @UseInterceptors(
    AnyFilesInterceptor({
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
      fileFilter: imageFileFilter,
    }),
  )
  async updatePageById(
    @Param("id") id: string,
    @Body() body: PageDto | string | any,
    @UploadedFiles() files: Express.Multer.File[],
    @Res() res: Response,
    @Req() req: RequestWithUser,
    @I18n() i18n: I18nContext,
  ) {
    // Handle FormData: check if body has a 'data' field (FormData) or is already parsed
    let pageData: PageDto;
    
    // If body has a 'data' property (FormData with JSON string in 'data' field)
    if (body && typeof body === 'object' && body.data && typeof body.data === 'string') {
      try {
        pageData = JSON.parse(body.data);
      } catch {
        throw new Error('Invalid JSON in data field');
      }
    }
    // If body is a string (direct JSON string)
    else if (typeof body === "string") {
      try {
        pageData = JSON.parse(body);
      } catch {
        throw new Error('Invalid JSON in request body');
      }
    }
    // If body is already an object (regular JSON request)
    else {
      pageData = body as PageDto;
    }

    // Use ID from URL parameter
    const pageId = id;

    // Parse nested objects in content that might be JSON strings
    if (pageData.content) {
      pageData.content = this.parseContentObjects(pageData.content);
    }

    // Parse nested objects in pageSections that might be JSON strings
    if (pageData.pageSections && Array.isArray(pageData.pageSections)) {
      pageData.pageSections = pageData.pageSections.map((section: any) => 
        this.parseContentObjects(section)
      );
    }

    // Parse nested objects in blogSections that might be JSON strings
    if (pageData.blogSections && Array.isArray(pageData.blogSections)) {
      pageData.blogSections = pageData.blogSections.map((section: any) => 
        this.parseContentObjects(section)
      );
    }

    // Parse nested objects in banner fields that might be JSON strings
    if (pageData.bannerTitle) {
      if (typeof pageData.bannerTitle === 'string') {
        try {
          (pageData as any).bannerTitle = JSON.parse(pageData.bannerTitle);
        } catch {
          // If not JSON, convert to object format
          (pageData as any).bannerTitle = { en: pageData.bannerTitle };
        }
      }
    }
    if (pageData.bannerDescription) {
      if (typeof pageData.bannerDescription === 'string') {
        try {
          (pageData as any).bannerDescription = JSON.parse(pageData.bannerDescription);
        } catch {
          // If not JSON, convert to object format
          (pageData as any).bannerDescription = { en: pageData.bannerDescription };
        }
      }
    }

    // Parse nested objects in footer template fields that might be JSON strings
    const footerFields = ['copyrightText', 'footerDescription', 'footerLinks', 'quickLinks', 'quickLinksTitle', 'socialLinksTitle'];
    for (const field of footerFields) {
      if (pageData[field]) {
        if (typeof pageData[field] === 'string') {
          try {
            (pageData as any)[field] = JSON.parse(pageData[field]);
          } catch {
            // If not JSON, convert to object format
            (pageData as any)[field] = { en: pageData[field] };
          }
        }
      }
    }

    // Parse nested objects in SEO fields that might be JSON strings
    if (pageData.metaTitle) {
      if (typeof pageData.metaTitle === 'string') {
        try {
          (pageData as any).metaTitle = JSON.parse(pageData.metaTitle);
        } catch {
          // If not JSON, convert to object format
          (pageData as any).metaTitle = { en: pageData.metaTitle };
        }
      }
    }
    if (pageData.metaDescription) {
      if (typeof pageData.metaDescription === 'string') {
        try {
          (pageData as any).metaDescription = JSON.parse(pageData.metaDescription);
        } catch {
          // If not JSON, convert to object format
          (pageData as any).metaDescription = { en: pageData.metaDescription };
        }
      }
    }

    // Validate schemaMarkup if provided
    // Can be either: 1) Plain JSON string, or 2) JSON wrapped in <script> tags
    if (pageData.schemaMarkup && typeof pageData.schemaMarkup === 'string' && pageData.schemaMarkup.trim() !== '') {
      try {
        // Try to parse as-is first (in case it's plain JSON)
        JSON.parse(pageData.schemaMarkup);
      } catch {
        // If that fails, try to extract JSON from script tags
        try {
          // Extract JSON from <script type="application/ld+json">...</script>
          const scriptMatch = pageData.schemaMarkup.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
          if (scriptMatch && scriptMatch[1]) {
            // Validate the extracted JSON
            JSON.parse(scriptMatch[1].trim());
            // If valid, keep the original string with script tags
          } else {
            // No script tags found, but also not valid JSON - log warning
            console.warn('Invalid JSON in schemaMarkup, but keeping original value');
          }
        } catch {
          // If both fail, log warning but keep the original value (don't set to empty)
          console.warn('Could not validate JSON in schemaMarkup, but keeping original value');
        }
      }
    }

    // Ensure robotsIndex and robotsFollow are booleans
    if (pageData.robotsIndex !== undefined) {
      (pageData as any).robotsIndex = pageData.robotsIndex === true || String(pageData.robotsIndex) === 'true';
    }
    if (pageData.robotsFollow !== undefined) {
      (pageData as any).robotsFollow = pageData.robotsFollow === true || String(pageData.robotsFollow) === 'true';
    }

    // Process file uploads for template pages
    if (files && files.length > 0) {
      // Process banner image
      pageData = await this.processBannerImage(pageData, files);
      
      // Process featured image (for blog posts)
      pageData = await this.processFeaturedImage(pageData, files);
      
      if (pageData.content) {
      pageData.content = await this.processContentImages(
        pageData.content,
        files,
      );
      }
      // Also process pageSections images if present
      if (pageData.pageSections && Array.isArray(pageData.pageSections)) {
        pageData.pageSections = await this.processPageSectionsImages(
          pageData.pageSections,
          files,
        );
      }
      // Also process blogSections images if present
      if (pageData.blogSections && Array.isArray(pageData.blogSections)) {
        pageData.blogSections = await this.processBlogSectionsImages(
          pageData.blogSections,
          files,
        );
      }
    }

    const existingPageData = await this.pageService.findOne({
      _id: pageId,
    });
    const updatedPage = await this.pageService.updatePage(
      pageData,
      pageId,
    );
    await this.auditLogService.createAudit({
      table_id: existingPageData._id.toString(),
      table_name: "pages",
      oldValue: existingPageData,
      newValue: updatedPage,
      action: "UPDATED",
      userId: req.user.id,
      ipAddress: req.ip,
    });
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      message: i18n.t("messages.PAGE_UPDATED"),
      data: {},
    });
  }

  /**
   * Retrieves a paginated list of pages.
   *
   * @param res - Express Response object
   */
  @Get()
  @UseGuards(AuthGuard("jwt"), AccountActiveGuard)
  async findAll(
    @Res() res: Response,
    @Query() queryParams: FindAllQueryDto,
    @I18n() i18n: I18nContext,
  ) {
    const data = await this.pageService.findAll(queryParams, i18n.lang);
    // Convert all Map fields to plain objects for each result
    const convertedResults = data.results.map((result: any) => 
      this.convertMapToObject(result)
    );
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      message: i18n.t("messages.DATA_RECEIVED"),
      data: {
        results: convertedResults,
        pagination: {
          total: data.total,
          page: data.page,
          currentPage: data.page,
          limit: data.limit,
        },
      },
    });
  }

  @Patch(":id/status")
  @UseGuards(AuthGuard("jwt"), AccountActiveGuard)
  async updateStatus(
    @Param("id") id: string,
    @Body() body: { status: boolean },
    @Res() res: Response,
    @Req() req: RequestWithUser,
    @I18n() i18n: I18nContext,
  ) {
    const existingPage = await this.pageService.findOne({ _id: id });
    await this.pageService.updatePageStatus({ status: !!body.status }, id);
    const updatedPage = await this.pageService.findOne({ _id: id });

    await this.auditLogService.createAudit({
      table_id: id,
      table_name: "pages",
      oldValue: existingPage,
      newValue: updatedPage,
      action: "UPDATED",
      userId: req.user.id,
      ipAddress: req.ip,
    });

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      message: i18n.t("messages.DATA_UPDATED") || "Page status updated successfully",
      data: updatedPage,
    });
  }

  /**
   * Recursively parses JSON strings in content object.
   * Handles cases where FormData converts objects to "[object Object]" or JSON strings.
   *
   * @param content - Content object that may contain stringified objects
   * @returns Parsed content object with proper object structures
   */
  private parseContentObjects(content: any): any {
    if (typeof content === 'string') {
      // Try to parse if it's a JSON string
      if (content.startsWith('{') || content.startsWith('[')) {
        try {
          return JSON.parse(content);
        } catch {
          // If parsing fails, return as is
          return content;
        }
      }
      // If it's "[object Object]", return empty object (data was lost)
      if (content === '[object Object]') {
        return {};
      }
      return content;
    }

    if (Array.isArray(content)) {
      return content.map(item => this.parseContentObjects(item));
    }

    if (content && typeof content === 'object') {
      const parsed: any = {};
      for (const key in content) {
        parsed[key] = this.parseContentObjects(content[key]);
      }
      return parsed;
    }

    return content;
  }

  /**
   * Processes uploaded banner image.
   * Handles fieldname "bannerImage" and stores it in pageData.
   *
   * @param pageData - Page data object
   * @param files - Uploaded files from FormData
   * @returns Updated pageData with banner image URL
   */
  private async processBannerImage(
    pageData: any,
    files: Express.Multer.File[],
  ): Promise<any> {
    const baseUrl = Helper.getBaseUrl() || "http://localhost:2022";
    const publicPath = path.resolve(process.cwd(), "public/page-content");
    FileHelper.createDirectoryIfNotExists(publicPath);

    // Process banner image file
    for (const file of files) {
      if (file.fieldname === "bannerImage") {
        // Validate that it's an image file
        if (!file.mimetype || !file.mimetype.startsWith("image/")) {
          throw new Error(
            `Invalid file type for bannerImage. Only image files are allowed. Received: ${file.mimetype}`,
          );
        }
        // Generate unique filename and save
        const fileName = FileHelper.generateUniqueFileName(file.originalname);
        FileHelper.saveFile(file.buffer, fileName, publicPath);

        // Add banner image URL to pageData
        pageData.bannerImage = `${baseUrl}/page-content/${fileName}`;
        break; // Only process first banner image
      }
    }

    return pageData;
  }

  /**
   * Processes uploaded featured image for blog posts.
   * Handles fieldname "featuredImage" and stores it in pageData.
   *
   * @param pageData - Page data object
   * @param files - Uploaded files from FormData
   * @returns Updated pageData with featured image URL
   */
  private async processFeaturedImage(
    pageData: any,
    files: Express.Multer.File[],
  ): Promise<any> {
    const baseUrl = Helper.getBaseUrl() || "http://localhost:2022";
    const publicPath = path.resolve(process.cwd(), "public/page-content");
    FileHelper.createDirectoryIfNotExists(publicPath);

    // Process featured image file
    for (const file of files) {
      if (file.fieldname === "featuredImage") {
        // Validate that it's an image file
        if (!file.mimetype || !file.mimetype.startsWith("image/")) {
          throw new Error(
            `Invalid file type for featuredImage. Only image files are allowed. Received: ${file.mimetype}`,
          );
        }
        // Generate unique filename and save
        const fileName = FileHelper.generateUniqueFileName(file.originalname);
        FileHelper.saveFile(file.buffer, fileName, publicPath);

        // Add featured image URL to pageData
        pageData.featuredImage = `${baseUrl}/page-content/${fileName}`;
        break; // Only process first featured image
      }
    }

    return pageData;
  }

  /**
   * Processes uploaded images for template page content.
   * Uploads files and replaces file objects with URLs in the content object.
   *
   * @param content - Content object from request
   * @param files - Uploaded files from FormData
   * @returns Updated content object with image URLs
   */
  private async processContentImages(
    content: Record<string, any>,
    files: Express.Multer.File[],
  ): Promise<Record<string, any>> {
    const baseUrl = Helper.getBaseUrl() || "http://localhost:2022";
    const publicPath = path.resolve(process.cwd(), "public/page-content");
    FileHelper.createDirectoryIfNotExists(publicPath);

    const processedContent = { ...content };

    // Process each file (fieldname format: "content.bannerImage", "content.step1Image", etc.)
    for (const file of files) {
      if (file.fieldname && file.fieldname.startsWith("content.")) {
        // Validate that it's an image file
        if (!file.mimetype || !file.mimetype.startsWith("image/")) {
          throw new Error(
            `Invalid file type for ${file.fieldname}. Only image files are allowed. Received: ${file.mimetype}`,
          );
        }
        // Extract the key from fieldname (e.g., "content.bannerImage" -> "bannerImage")
        const key = file.fieldname.replace(/^content\./, "");

        // Generate unique filename and save
        const fileName = FileHelper.generateUniqueFileName(file.originalname);
        FileHelper.saveFile(file.buffer, fileName, publicPath);

        // Update content object with image URL
        processedContent[key] = `${baseUrl}/page-content/${fileName}`;
      }
    }

    return processedContent;
  }

  /**
   * Processes uploaded images for pageSections array.
   * Handles fieldnames like "pageSection-0-image-0", "pageSection-1-image-2", etc.
   *
   * @param pageSections - Array of page sections
   * @param files - Uploaded files from FormData
   * @returns Updated pageSections array with image URLs
   */
  private async processPageSectionsImages(
    pageSections: any[],
    files: Express.Multer.File[],
  ): Promise<any[]> {
    const baseUrl = Helper.getBaseUrl() || "http://localhost:2022";
    const publicPath = path.resolve(process.cwd(), "public/page-content");
    FileHelper.createDirectoryIfNotExists(publicPath);

    const processedSections = pageSections.map((section, index) => ({
      ...section,
      images: section.images ? [...section.images] : [],
    }));

    // Process each file with pattern "pageSection-{index}-image-{imageIndex}"
    for (const file of files) {
      if (file.fieldname && file.fieldname.startsWith("pageSection-")) {
        // Validate that it's an image file
        if (!file.mimetype || !file.mimetype.startsWith("image/")) {
          throw new Error(
            `Invalid file type for ${file.fieldname}. Only image files are allowed. Received: ${file.mimetype}`,
          );
        }
        // Parse fieldname: "pageSection-0-image-0" -> sectionIndex: 0, imageIndex: 0
        const match = file.fieldname.match(/^pageSection-(\d+)-image-(\d+)$/);
        if (match) {
          const sectionIndex = parseInt(match[1], 10);
          const imageIndex = parseInt(match[2], 10);

          // Validate indices
          if (
            sectionIndex >= 0 &&
            sectionIndex < processedSections.length &&
            imageIndex >= 0
          ) {
            // Ensure images array exists and has enough elements
            if (!processedSections[sectionIndex].images) {
              processedSections[sectionIndex].images = [];
            }
            // Extend array if needed
            while (processedSections[sectionIndex].images.length <= imageIndex) {
              processedSections[sectionIndex].images.push("");
            }

            // Generate unique filename and save
            const fileName = FileHelper.generateUniqueFileName(file.originalname);
            FileHelper.saveFile(file.buffer, fileName, publicPath);

            // Update the specific image URL in the section
            processedSections[sectionIndex].images[imageIndex] = `${baseUrl}/page-content/${fileName}`;
          }
        }
      }
    }

    return processedSections;
  }

  /**
   * Processes uploaded images for blogSections array.
   * Handles fieldnames like "blogSection-0-image-0", "blogSection-1-image-2", etc.
   *
   * @param blogSections - Array of blog sections
   * @param files - Uploaded files from FormData
   * @returns Updated blogSections array with image URLs
   */
  private async processBlogSectionsImages(
    blogSections: any[],
    files: Express.Multer.File[],
  ): Promise<any[]> {
    const baseUrl = Helper.getBaseUrl() || "http://localhost:2022";
    const publicPath = path.resolve(process.cwd(), "public/page-content");
    FileHelper.createDirectoryIfNotExists(publicPath);

    const processedSections = blogSections.map((section, index) => ({
      ...section,
      images: section.images ? [...section.images] : [],
    }));

    // Process each file with pattern "blogSection-{index}-image-{imageIndex}"
    for (const file of files) {
      if (file.fieldname && file.fieldname.startsWith("blogSection-")) {
        // Validate that it's an image file
        if (!file.mimetype || !file.mimetype.startsWith("image/")) {
          throw new Error(
            `Invalid file type for ${file.fieldname}. Only image files are allowed. Received: ${file.mimetype}`,
          );
        }
        // Parse fieldname: "blogSection-0-image-0" -> sectionIndex: 0, imageIndex: 0
        const match = file.fieldname.match(/^blogSection-(\d+)-image-(\d+)$/);
        if (match) {
          const sectionIndex = parseInt(match[1], 10);
          const imageIndex = parseInt(match[2], 10);

          // Validate indices
          if (
            sectionIndex >= 0 &&
            sectionIndex < processedSections.length &&
            imageIndex >= 0
          ) {
            // Ensure images array exists and has enough elements
            if (!processedSections[sectionIndex].images) {
              processedSections[sectionIndex].images = [];
            }
            // Extend array if needed
            while (processedSections[sectionIndex].images.length <= imageIndex) {
              processedSections[sectionIndex].images.push("");
            }

            // Generate unique filename and save
            const fileName = FileHelper.generateUniqueFileName(file.originalname);
            FileHelper.saveFile(file.buffer, fileName, publicPath);

            // Update the specific image URL in the section
            processedSections[sectionIndex].images[imageIndex] = `${baseUrl}/page-content/${fileName}`;
          }
        }
      }
    }

    return processedSections;
  }

  /**
   * Converts Map fields to plain objects for JSON serialization.
   * Also handles ObjectId conversion to strings and other MongoDB types.
   */
  private convertMapToObject(value: any): any {
    // Handle ObjectId - check if it's an ObjectId instance or has ObjectId structure
    if (value instanceof Types.ObjectId) {
      return value.toString();
    }
    // Handle ObjectId from lean() queries - they have a buffer property
    if (value && typeof value === "object" && value.buffer && value.buffer.type === "Buffer") {
      // This is an ObjectId serialized as buffer, convert to string
      try {
        return new Types.ObjectId(value).toString();
      } catch {
        // If conversion fails, try to get the id from the object
        if (value._id) {
          return value._id.toString();
        }
        return value;
      }
    }
    // Handle Map instances
    if (value instanceof Map) {
      return Object.fromEntries(value);
    }
    // Handle Date objects
    if (value instanceof Date) {
      return value.toISOString();
    }
    // Handle arrays
    if (Array.isArray(value)) {
      return value.map((item) => this.convertMapToObject(item));
    }
    // Handle objects
    if (value && typeof value === "object") {
      const converted: any = {};
      for (const key in value) {
        const val = value[key];
        // Special handling for _id field - convert ObjectId buffer to string
        if (key === "_id" && val && typeof val === "object") {
          // Check if it's an ObjectId with buffer structure
          if (val.buffer && val.buffer.type === "Buffer") {
            try {
              // Try to create ObjectId from the buffer data
              if (val.buffer.data && Array.isArray(val.buffer.data) && val.buffer.data.length > 0) {
                converted[key] = new Types.ObjectId(Buffer.from(val.buffer.data)).toString();
              } else if (val.toString && typeof val.toString === "function") {
                converted[key] = val.toString();
              } else {
                // Fallback: try to reconstruct from the object structure
                // Sometimes ObjectId from lean() has the hex string in a different property
                converted[key] = val.hex || val.id || String(val);
              }
            } catch {
              // If all else fails, try to stringify
              converted[key] = val.toString ? val.toString() : String(val);
            }
          } else if (val instanceof Types.ObjectId) {
            converted[key] = val.toString();
          } else if (val.toString && typeof val.toString === "function" && val.constructor && val.constructor.name === "ObjectId") {
            converted[key] = val.toString();
          } else {
            converted[key] = this.convertMapToObject(val);
          }
        } else {
          converted[key] = this.convertMapToObject(val);
        }
      }
      return converted;
    }
    return value;
  }

  /**
   * Retrieves page details by slug (public endpoint for website).
   *
   * @param res - Express Response object
   */
  @Get("detail/:slug")
  async getPageDetail(
    @Res() res: Response,
    @Param("slug") slug: string,
    @I18n() i18n: I18nContext,
  ) {
    const result = await this.pageService.findBySlug(slug);
    if (!result) {
      return res.status(HttpStatus.NOT_FOUND).json({
        statusCode: HttpStatus.NOT_FOUND,
        message: "Page not found.",
        data: null,
      });
    }
    // Result is already a plain object from lean(), but handle both cases
    const obj = result && typeof result === 'object' && 'toObject' in result 
      ? result.toObject() 
      : result;
    // Convert all Map fields to plain objects
    const convertedData = this.convertMapToObject(obj);
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      message: i18n.t("messages.DATA_RECEIVED"),
      data: convertedData,
    });
  }

  /**
   * Deletes a page by its ID.
   * If the deleted page was the last page for its category, sets the category status to false.
   *
   * @param id - The ID of the page to delete
   * @param res - Express Response object
   * @param req - Express Request object with user info
   * @param i18n - I18n context
   */
  @Delete(":id")
  @UseGuards(AuthGuard("jwt"), AccountActiveGuard)
  async deletePage(
    @Param("id") id: string,
    @Res() res: Response,
    @Req() req: RequestWithUser,
    @I18n() i18n: I18nContext,
  ) {
    try {
      await this.pageService.deletePage(id);

      // Log the deletion
      await this.auditLogService.createAudit({
        table_id: id,
        table_name: "pages",
        oldValue: null,
        newValue: null,
        action: "DELETE",
        userId: req.user.id,
        ipAddress: req.ip,
      });

      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: i18n.t("messages.DELETE_SUCCESS") || "Page deleted successfully",
        data: {},
      });
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        return res.status(error.getStatus()).json({
          statusCode: error.getStatus(),
          message: error.message,
          data: {},
        });
      }

      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: i18n.t("messages.DELETE_FAILED") || "Failed to delete page",
        data: {},
      });
    }
  }
}
