import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, FilterQuery, Types } from "mongoose";
import slugify from "slugify";
import { Page } from "./page.schema";
import { PageDto, FindAllQueryDto } from "./dto/page.dto";
import * as _ from "lodash";

@Injectable()
export class PageService {
  constructor(
    @InjectModel("Page")
    private pageModel: Model<Page>,
    @InjectModel("CmsCategory")
    private cmsCategoryModel: Model<any>,
  ) {}

  createSlug(text: string): string {
    return slugify(text, { lower: true });
  }

  /**
   * Normalizes title and description fields to always use multilingual object format.
   * Converts string values to { en: string } format for consistency.
   */
  private normalizePageData(page: any): any {
    if (!page) return page;

    const normalized = { ...page };

    // Normalize title - convert string to { en: string } if needed
    if (normalized.title) {
      if (typeof normalized.title === 'string') {
        normalized.title = { en: normalized.title };
      }
    } else {
      normalized.title = { en: '' };
    }

    // Normalize description - convert string to { en: string } if needed
    if (normalized.description) {
      if (typeof normalized.description === 'string') {
        normalized.description = { en: normalized.description };
      }
    } else {
      normalized.description = { en: '' };
    }

    return normalized;
  }

  /**
   * Creates a new page with a generated slug and saves it to the database.
   *
   * @param request - Page data (PageDto)
   * @returns Promise<Page> - The created page document
   */
  async createPage(request: PageDto): Promise<Page> {
    // Convert title and description from object to string if needed
    // Schema expects strings, but frontend may send multilingual objects
    let titleString = request.title;
    let descriptionString = request.description;

    if (request.title && typeof request.title === 'object') {
      // Extract 'en' value or first available value
      titleString = (request.title as any).en || Object.values(request.title as any)[0] || '';
    }

    if (request.description && typeof request.description === 'object') {
      // Extract 'en' value or first available value
      descriptionString = (request.description as any).en || Object.values(request.description as any)[0] || '';
    }

    // Generate slug if not provided
    // Priority: customSlug > slug > auto-generate from title
    if (!request.slug && !request.customSlug && titleString) {
      request.slug = this.createSlug(titleString);
    }
    // Use customSlug as slug if customSlug is provided and slug is not
    if (request.customSlug && !request.slug) {
      request.slug = request.customSlug;
    }

    // Convert account_holder_id string to ObjectId if provided
    const createData: any = { 
      ...request,
      title: titleString,
      description: descriptionString,
    };
    if (
      request.account_holder_id &&
      Types.ObjectId.isValid(request.account_holder_id)
    ) {
      createData.account_holder_id = new Types.ObjectId(
        request.account_holder_id,
      );
    }

    const newEntity = new this.pageModel(createData);
    const savedPage = await newEntity.save();

    // Update CMS category status to true if page has a category
    if (request.category) {
      await this.updateCategoryStatus(request.category, true);
    }

    return savedPage;
  }

  /**
   * Updates the status of a CMS category based on whether pages exist for it.
   * @param categorySlug - The category slug to update
   * @param status - The status to set (true if pages exist, false otherwise)
   */
  private async updateCategoryStatus(
    categorySlug: string,
    status: boolean,
  ): Promise<void> {
    try {
      // Find category by slug and update status
      const category = await this.cmsCategoryModel.findOne({
        slug: categorySlug,
      });

      if (category && category.status !== status) {
        await this.cmsCategoryModel.findByIdAndUpdate(
          category._id,
          { $set: { status: status } },
        );
      }
    } catch (error) {
      // Silently fail - don't break page creation if category update fails
      console.error('Error updating category status:', error);
    }
  }

  /**
   * Updates an existing page by ID with the provided data.
   *
   * @param request - Updated page data (PageDto)
   * @param id - The ID of the page to update
   * @returns Promise<Page | null> - The updated page document, or null if not found
   */
  async updatePage(request: PageDto, id: string): Promise<Page> {
    // Convert title and description from object to string if needed
    // Schema expects strings, but frontend may send multilingual objects
    let titleString = request.title;
    let descriptionString = request.description;

    if (request.title && typeof request.title === 'object') {
      // Extract 'en' value or first available value
      titleString = (request.title as any).en || Object.values(request.title as any)[0] || '';
    }

    if (request.description && typeof request.description === 'object') {
      // Extract 'en' value or first available value
      descriptionString = (request.description as any).en || Object.values(request.description as any)[0] || '';
    }

    // Convert account_holder_id string to ObjectId if provided
    const updateData: any = { 
      ...request,
      title: titleString,
      description: descriptionString,
    };
    if (
      request.account_holder_id &&
      Types.ObjectId.isValid(request.account_holder_id)
    ) {
      updateData.account_holder_id = new Types.ObjectId(
        request.account_holder_id,
      );
    }

    const updatedPage = await this.pageModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true },
    );

    // Update CMS category status to true if page has a category
    if (request.category) {
      await this.updateCategoryStatus(request.category, true);
    }

    return updatedPage;
  }

  /**
   * Retrieves a paginated list of pages with optional filtering and sorting.
   *
   * @param findAllQueryDto - Query parameters for filtering, sorting, and pagination
   *   - title: optional keyword to filter by page title
   *   - updatedAt: optional date range filter ("startDate TO endDate")
   *   - sort: field to sort by (default: created_at)
   *   - direction: sort order ("asc" or "desc")
   *   - page: current page number (default: 1)
   *   - limit: number of items per page (default: 10)
   * @returns Paginated list of pages with total count.
   */
  async findAll(
    findAllQueryDto: FindAllQueryDto,
    lang: string,
  ): Promise<{
    results: any[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      title,
      updatedAt,
      sort = "created_at",
      direction = "desc",
      page = 1,
      limit = 10,
    } = findAllQueryDto;
    const query: {
      title?: { $regex: string; $options: string };
      updatedAt?: { $gte: Date; $lte: Date };
    } = {};
    const sortOptions = {};
    sortOptions["updatedAt"] = direction === "asc" ? 1 : -1;
    if (sort) {
      sortOptions[sort] = direction === "asc" ? 1 : -1;
    }
    if (sort === "title") {
      sortOptions["title"] = direction === "asc" ? 1 : -1;
    }
    if (title) {
      query["title"] = { $regex: _.trim(title), $options: "i" };
    }
    if (updatedAt) {
      const dateRange = updatedAt.split("TO");
      if (dateRange.length === 2) {
        const startDate = new Date(dateRange[0].trim());
        const endDate = new Date(dateRange[1].trim());
        endDate.setHours(23, 59, 59, 999);
        query.updatedAt = {
          $gte: startDate,
          $lte: endDate,
        };
      }
    }

    const [results, total] = await Promise.all([
      this.pageModel
        .find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort(sortOptions)
        .lean({ getters: true })
        .exec(),
      this.pageModel.countDocuments(query).exec(),
    ]);
    // Transform _id fields to strings and normalize data structure
    const transformedResults = results.map((result: any) => {
      if (result && result._id) {
        // Handle ObjectId conversion - try multiple methods
        const idValue: any = result._id;
        if (idValue && typeof idValue === 'object') {
          if (idValue.toString && typeof idValue.toString === 'function') {
            result._id = idValue.toString();
          } else if (idValue.$oid) {
            result._id = idValue.$oid;
          } else if (idValue.buffer && idValue.buffer.data && Array.isArray(idValue.buffer.data) && idValue.buffer.data.length > 0) {
            result._id = new Types.ObjectId(Buffer.from(idValue.buffer.data)).toString();
          } else if (idValue.hex) {
            result._id = idValue.hex;
          } else {
            // Last resort: try to stringify
            result._id = String(idValue);
          }
        }
      }
      // Normalize title and description to consistent multilingual format
      return this.normalizePageData(result);
    });
    return {
      results: transformedResults,
      total,
      page,
      limit,
    };
  }

  /**
   * Finds a single page by slug and returns full data.
   *
   * @param slug - The slug identifier
   * @returns Promise<any> - The matched page with full data, or null if not found
   */
  async findBySlug(slug: string): Promise<any> {
    const result: any = await this.pageModel
      .findOne({ slug, status: true })
      .lean({ getters: true })
      .exec();
    if (result && result._id) {
      // Transform _id to string
      const idValue: any = result._id;
      if (idValue && typeof idValue === 'object') {
        if (idValue.toString && typeof idValue.toString === 'function') {
          result._id = idValue.toString();
        } else if (idValue.$oid) {
          result._id = idValue.$oid;
        } else if (idValue.buffer && idValue.buffer.data && Array.isArray(idValue.buffer.data) && idValue.buffer.data.length > 0) {
          result._id = new Types.ObjectId(Buffer.from(idValue.buffer.data)).toString();
        } else if (idValue.hex) {
          result._id = idValue.hex;
        } else {
          result._id = String(idValue);
        }
      }
    }
    // Normalize title and description to consistent multilingual format
    return this.normalizePageData(result);
  }

  /**
   * Finds a single page by query and returns only selected fields.
   *
   * @param query - Mongoose filter object to match the page
   * @returns Promise<Page | undefined> - The matched page with only title and description, or undefined if not found
   */
  async findOne(query: FilterQuery<Page>): Promise<Page | undefined> {
    return await this.pageModel.findOne(query).select("title description slug");
  }

  /**
   * Finds a single page by ID and returns full data including content.
   * Used for editing pages.
   *
   * @param id - The page ID
   * @returns Promise<any> - The matched page with full data, or null if not found
   */
  async findById(id: string): Promise<any> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    const result: any = await this.pageModel.findById(id).lean({ getters: true }).exec();
    if (result && result._id) {
      // Transform _id to string
      const idValue: any = result._id;
      if (idValue && typeof idValue === 'object') {
        if (idValue.toString && typeof idValue.toString === 'function') {
          result._id = idValue.toString();
        } else if (idValue.$oid) {
          result._id = idValue.$oid;
        } else if (idValue.buffer && idValue.buffer.data && Array.isArray(idValue.buffer.data) && idValue.buffer.data.length > 0) {
          result._id = new Types.ObjectId(Buffer.from(idValue.buffer.data)).toString();
        } else if (idValue.hex) {
          result._id = idValue.hex;
        } else {
          result._id = String(idValue);
        }
      }
    }
    // Normalize title and description to consistent multilingual format
    return this.normalizePageData(result);
  }

  /**
   * Updates the status of a page by its ID.
   *
   * @param request - Object containing the new status (true/false)
   * @param id - The ID of the page to update
   * @returns Promise<boolean> - Returns true if the update was executed
   */
  async updatePageStatus(
    request: {
      status: boolean;
    },
    id: string,
  ): Promise<boolean> {
    await this.pageModel.updateOne({ _id: id }, request);
    return true;
  }

  /**
   * Deletes a page by its ID.
   * If the deleted page was the last page for its category, sets the category status to false.
   *
   * @param id - The ID of the page to delete
   * @returns Promise<boolean> - Returns true if the page was deleted
   * @throws BadRequestException if invalid ID format
   * @throws NotFoundException if page not found
   */
  async deletePage(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid page ID format.");
    }

    // Find the page before deleting to get its category
    const page = await this.pageModel.findById(id);
    if (!page) {
      throw new NotFoundException("Page not found.");
    }

    const categorySlug = page.category;

    // Delete the page
    await this.pageModel.findByIdAndDelete(id);

    // If the page had a category, check if there are any other pages with that category
    if (categorySlug) {
      const remainingPagesCount = await this.pageModel.countDocuments({
        category: categorySlug,
      });

      // If no pages remain for this category, set category status to false
      if (remainingPagesCount === 0) {
        await this.updateCategoryStatus(categorySlug, false);
      }
    }

    return true;
  }
}
