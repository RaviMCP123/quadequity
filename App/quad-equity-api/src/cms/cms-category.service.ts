import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import slugify from "slugify";
import { CmsCategory } from "./cms-category.schema";
import {
  CreateCmsCategoryDto,
  UpdateCmsCategoryDto,
  FindAllCmsCategoryQueryDto,
} from "./dto/cms-category.dto";
import * as _ from "lodash";

@Injectable()
export class CmsCategoryService {
  constructor(
    @InjectModel("CmsCategory")
    private cmsCategoryModel: Model<CmsCategory>,
    @InjectModel("Page")
    private pageModel: Model<any>, // Page model to check if category is in use
  ) {}

  /**
   * Generates a URL-friendly slug from a name.
   * @param text - The text to convert to a slug
   * @returns The generated slug
   */
  createSlug(text: string): string {
    return slugify(text, {
      lower: true,
      strict: true, // Remove special characters
      trim: true,
    });
  }

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  private async ensureUniqueName(name: string, excludeId?: string): Promise<void> {
    const normalizedName = _.trim(name).replace(/\s+/g, " ");
    const query: any = {
      name: {
        $regex: `^${this.escapeRegex(normalizedName)}$`,
        $options: "i",
      },
    };

    if (excludeId) {
      query._id = { $ne: new Types.ObjectId(excludeId) };
    }

    const existing = await this.cmsCategoryModel.findOne(query);
    if (existing) {
      throw new ConflictException("Category name already exists.");
    }
  }

  /**
   * Ensures slug uniqueness by appending a number if needed.
   * @param slug - The base slug
   * @param excludeId - ID to exclude from uniqueness check (for updates)
   * @returns A unique slug
   */
  async ensureUniqueSlug(
    slug: string,
    excludeId?: string,
  ): Promise<string> {
    let uniqueSlug = slug;
    let counter = 1;

    while (true) {
      const query: any = { slug: uniqueSlug };
      if (excludeId) {
        query._id = { $ne: new Types.ObjectId(excludeId) };
      }

      const existing = await this.cmsCategoryModel.findOne(query);
      if (!existing) {
        return uniqueSlug;
      }

      counter++;
      uniqueSlug = `${slug}-${counter}`;
    }
  }

  /**
   * Helper to convert placement item to plain object while preserving all properties
   */
  private placementItemToObject(item: any): any {
    if (item.toObject) {
      return item.toObject();
    }
    if (item._doc) {
      return { ...item._doc };
    }
    return { ...item };
  }

  /**
   * Adjusts sortOrder for all categories in a specific placement when inserting a new item.
   * If newSortOrder is 1, all existing items with sortOrder >= 1 will be incremented.
   * @param placementType - The placement type (header, footer, banner, quicklinks)
   * @param newSortOrder - The sortOrder of the new item being inserted
   * @param excludeId - Category ID to exclude from adjustment (for updates)
   */
  async adjustPlacementSortOrderOnInsert(
    placementType: string,
    newSortOrder: number,
    excludeId?: string,
  ): Promise<void> {
    // Find all categories that have this placement type
    const categories = await this.cmsCategoryModel.find({
      "placement.type": placementType,
      ...(excludeId ? { _id: { $ne: new Types.ObjectId(excludeId) } } : {}),
    });

    const bulkOps: any[] = [];

    // Update categories that have sortOrder >= newSortOrder
    for (const category of categories) {
      if (category.placement && Array.isArray(category.placement)) {
        let hasChanges = false;
        const updatedPlacement = category.placement.map((item: any) => {
          if (item.type === placementType && item.sortOrder >= newSortOrder) {
            hasChanges = true;
            const itemObj = this.placementItemToObject(item);
            return {
              ...itemObj,
              sortOrder: item.sortOrder + 1,
            };
          }
          return this.placementItemToObject(item);
        });

        if (hasChanges) {
          bulkOps.push({
            updateOne: {
              filter: { _id: category._id },
              update: { $set: { placement: updatedPlacement } },
            },
          });
        }
      }
    }

    if (bulkOps.length > 0) {
      await this.cmsCategoryModel.bulkWrite(bulkOps);
    }
  }

  /**
   * Adjusts sortOrder for all categories in a specific placement when updating an existing item.
   * Handles moving an item from oldSortOrder to newSortOrder.
   * @param placementType - The placement type (header, footer, banner, quicklinks)
   * @param oldSortOrder - The current sortOrder of the item being updated
   * @param newSortOrder - The new sortOrder for the item
   * @param excludeId - Category ID to exclude from adjustment
   */
  async adjustPlacementSortOrderOnUpdate(
    placementType: string,
    oldSortOrder: number,
    newSortOrder: number,
    excludeId: string,
  ): Promise<void> {
    if (oldSortOrder === newSortOrder) {
      return; // No change needed
    }

    // Find all categories that have this placement type
    const categories = await this.cmsCategoryModel.find({
      "placement.type": placementType,
      _id: { $ne: new Types.ObjectId(excludeId) },
    });

    const bulkOps: any[] = [];

    for (const category of categories) {
      if (category.placement && Array.isArray(category.placement)) {
        let hasChanges = false;
        const updatedPlacement = category.placement.map((item: any) => {
          if (item.type === placementType) {
            // Moving item to a lower position (e.g., from 3 to 1)
            if (newSortOrder < oldSortOrder) {
              if (
                item.sortOrder >= newSortOrder &&
                item.sortOrder < oldSortOrder
              ) {
                hasChanges = true;
                const itemObj = this.placementItemToObject(item);
                return {
                  ...itemObj,
                  sortOrder: item.sortOrder + 1,
                };
              }
            }
            // Moving item to a higher position (e.g., from 1 to 3)
            else if (newSortOrder > oldSortOrder) {
              if (
                item.sortOrder > oldSortOrder &&
                item.sortOrder <= newSortOrder
              ) {
                hasChanges = true;
                const itemObj = this.placementItemToObject(item);
                return {
                  ...itemObj,
                  sortOrder: item.sortOrder - 1,
                };
              }
            }
          }
          return this.placementItemToObject(item);
        });

        if (hasChanges) {
          bulkOps.push({
            updateOne: {
              filter: { _id: category._id },
              update: { $set: { placement: updatedPlacement } },
            },
          });
        }
      }
    }

    if (bulkOps.length > 0) {
      await this.cmsCategoryModel.bulkWrite(bulkOps);
    }
  }

  /**
   * Creates a new CMS category.
   * @param createDto - Category data
   * @returns The created category
   */
  async create(createDto: CreateCmsCategoryDto): Promise<CmsCategory> {
    await this.ensureUniqueName(createDto.name);

    // Generate slug if not provided
    let slug = createDto.slug;
    if (!slug && createDto.name) {
      slug = this.createSlug(createDto.name);
    }

    // Ensure slug uniqueness
    if (slug) {
      slug = await this.ensureUniqueSlug(slug);
    }

    // Convert manager string to ObjectId if provided
    const categoryData: any = {
      name: createDto.name,
      slug: slug || undefined,
      placement: createDto.placement,
      sortOrder: createDto.sortOrder ?? 0,
      status: createDto.status ?? false, // Default to false - will be set to true when a page is added
    };

    if (createDto.manager) {
      if (Types.ObjectId.isValid(createDto.manager)) {
        categoryData.manager = new Types.ObjectId(createDto.manager);
      } else {
        throw new BadRequestException("Invalid manager ID format.");
      }
    } else {
      categoryData.manager = null;
    }

    // Check for duplicate slug if provided
    if (slug) {
      const existing = await this.cmsCategoryModel.findOne({ slug });
      if (existing) {
        throw new ConflictException("Category with this slug already exists.");
      }
    }

    // Adjust sortOrder for placements before creating
    if (createDto.placement && Array.isArray(createDto.placement)) {
      for (const placementItem of createDto.placement) {
        await this.adjustPlacementSortOrderOnInsert(
          placementItem.type,
          placementItem.sortOrder,
        );
      }
    }

    const newCategory = new this.cmsCategoryModel(categoryData);
    return newCategory.save();
  }

  /**
   * Updates an existing CMS category.
   * @param id - Category ID
   * @param updateDto - Updated category data
   * @returns The updated category
   */
  async update(
    id: string,
    updateDto: UpdateCmsCategoryDto,
  ): Promise<CmsCategory> {
    const category = await this.cmsCategoryModel.findById(id);
    if (!category) {
      throw new NotFoundException("CMS Category not found");
    }

    const updateData: any = {};

    // Handle name and slug
    if (updateDto.name !== undefined) {
      await this.ensureUniqueName(updateDto.name, id);
      updateData.name = updateDto.name;
      // If name changed and slug not provided, regenerate slug
      if (!updateDto.slug && updateDto.name !== category.name) {
        const newSlug = this.createSlug(updateDto.name);
        updateData.slug = await this.ensureUniqueSlug(newSlug, id);
      }
    }

    if (updateDto.slug !== undefined) {
      if (updateDto.slug === null || updateDto.slug === "") {
        // If slug is explicitly set to null/empty, generate from name
        const nameToUse = updateDto.name || category.name;
        const newSlug = this.createSlug(nameToUse);
        updateData.slug = await this.ensureUniqueSlug(newSlug, id);
      } else {
        // Check uniqueness if slug is provided
        const slug = this.createSlug(updateDto.slug);
        updateData.slug = await this.ensureUniqueSlug(slug, id);
      }
    }

    // Handle placement changes - adjust sortOrder for affected placements
    if (updateDto.placement !== undefined) {
      const oldPlacement = category.placement || [];
      const newPlacement = updateDto.placement;

      // Process each placement type in the new placement
      for (const newPlacementItem of newPlacement) {
        const oldPlacementItem = oldPlacement.find(
          (item: any) => item.type === newPlacementItem.type,
        );

        if (oldPlacementItem) {
          // Placement type exists, check if sortOrder changed
          if (oldPlacementItem.sortOrder !== newPlacementItem.sortOrder) {
            await this.adjustPlacementSortOrderOnUpdate(
              newPlacementItem.type,
              oldPlacementItem.sortOrder,
              newPlacementItem.sortOrder,
              id,
            );
          } else {
            // SortOrder is the same, but we need to check if there's a conflict
            // (another item already at this position). If so, we should still adjust.
            const conflictingCategory = await this.cmsCategoryModel.findOne({
              "placement.type": newPlacementItem.type,
              "placement.sortOrder": newPlacementItem.sortOrder,
              _id: { $ne: new Types.ObjectId(id) },
            });

            if (conflictingCategory) {
              // There's a conflict - treat it as an insert to push the conflicting item
              await this.adjustPlacementSortOrderOnInsert(
                newPlacementItem.type,
                newPlacementItem.sortOrder,
                id,
              );
            }
          }
        } else {
          // New placement type being added
          await this.adjustPlacementSortOrderOnInsert(
            newPlacementItem.type,
            newPlacementItem.sortOrder,
            id,
          );
        }
      }

      // Handle removed placements - adjust sortOrder for items that were after removed items
      for (const oldPlacementItem of oldPlacement) {
        const stillExists = newPlacement.some(
          (item: any) => item.type === oldPlacementItem.type,
        );

        if (!stillExists) {
          // Placement was removed, need to decrement items that were after it
          const categories = await this.cmsCategoryModel.find({
            "placement.type": oldPlacementItem.type,
            _id: { $ne: new Types.ObjectId(id) },
          });

          const bulkOps: any[] = [];

          for (const cat of categories) {
            if (cat.placement && Array.isArray(cat.placement)) {
              let hasChanges = false;
              const updatedPlacement = cat.placement.map((item: any) => {
                if (
                  item.type === oldPlacementItem.type &&
                  item.sortOrder > oldPlacementItem.sortOrder
                ) {
                  hasChanges = true;
                  const itemObj = this.placementItemToObject(item);
                  return {
                    ...itemObj,
                    sortOrder: item.sortOrder - 1,
                  };
                }
                return this.placementItemToObject(item);
              });

              if (hasChanges) {
                bulkOps.push({
                  updateOne: {
                    filter: { _id: cat._id },
                    update: { $set: { placement: updatedPlacement } },
                  },
                });
              }
            }
          }

          if (bulkOps.length > 0) {
            await this.cmsCategoryModel.bulkWrite(bulkOps);
          }
        }
      }

      updateData.placement = updateDto.placement;
    }

    if (updateDto.manager !== undefined) {
      if (updateDto.manager === null || updateDto.manager === "") {
        updateData.manager = null;
      } else if (Types.ObjectId.isValid(updateDto.manager)) {
        updateData.manager = new Types.ObjectId(updateDto.manager);
      } else {
        throw new BadRequestException("Invalid manager ID format.");
      }
    }

    if (updateDto.sortOrder !== undefined) {
      updateData.sortOrder = updateDto.sortOrder;
    }

    if (updateDto.status !== undefined) {
      updateData.status = updateDto.status;
    }

    return this.cmsCategoryModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true },
    );
  }

  /**
   * Retrieves a paginated list of CMS categories with filtering and sorting.
   * @param queryDto - Query parameters
   * @returns Paginated list of categories
   */
  async findAll(
    queryDto: FindAllCmsCategoryQueryDto,
  ): Promise<{
    results: CmsCategory[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      name,
      placement,
      status,
      manager,
      sort = "sortOrder",
      direction = "asc",
      page = 1,
      limit = 10,
    } = queryDto;

    const query: any = {};

    // Filter by name (search)
    if (name) {
      query.name = { $regex: _.trim(name), $options: "i" };
    }

    // Filter by placement (can be comma-separated string or single value)
    // Now placement is an array of objects with { type, sortOrder }
    if (placement) {
      const placementArray = placement.split(",").map((p) => p.trim());
      if (placementArray.length === 1) {
        // If single value, check if it's in the placement.type field
        query["placement.type"] = placementArray[0];
      } else {
        // If multiple values, use $in operator on placement.type
        query["placement.type"] = { $in: placementArray };
      }
    }

    // Filter by status
    if (status) {
      const statusValues = status.split("-");
      if (statusValues.length === 1) {
        query.status = statusValues[0] === "true";
      } else {
        // If both true and false are requested, don't filter by status
        // (show all)
      }
    }

    // Filter by manager
    if (manager) {
      if (Types.ObjectId.isValid(manager)) {
        query.manager = new Types.ObjectId(manager);
      }
    }

    // Build sort options
    const sortOptions: any = {};
    const sortField = sort || "sortOrder";
    sortOptions[sortField] = direction === "asc" ? 1 : -1;
    // Secondary sort by sortOrder if not the primary sort
    if (sortField !== "sortOrder") {
      sortOptions.sortOrder = 1;
    }

    const skip = (page - 1) * limit;

    const [results, total] = await Promise.all([
      this.cmsCategoryModel
        .find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.cmsCategoryModel.countDocuments(query).exec(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      results,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Retrieves a simple list of all CMS categories (no pagination).
   * @param filters - Optional filters
   * @returns List of categories
   */
  async findList(filters?: {
    status?: boolean;
    placement?: "header" | "footer" | "banner" | string;
  }): Promise<CmsCategory[]> {
    const query: any = {};

    if (filters?.status !== undefined) {
      query.status = filters.status;
    }

    if (filters?.placement) {
      // Handle comma-separated placement values
      // Now placement is an array of objects with { type, sortOrder }
      const placementArray = filters.placement.split(",").map((p) => p.trim());
      if (placementArray.length === 1) {
        query["placement.type"] = placementArray[0];
      } else {
        query["placement.type"] = { $in: placementArray };
      }
    }

    return this.cmsCategoryModel
      .find(query)
      .sort({ sortOrder: 1, name: 1 })
      .exec();
  }

  /**
   * Retrieves a single CMS category by ID.
   * @param id - Category ID
   * @returns The category
   */
  async findOne(id: string): Promise<CmsCategory> {
    const category = await this.cmsCategoryModel.findById(id);
    if (!category) {
      throw new NotFoundException("CMS Category not found");
    }
    return category;
  }

  /**
   * Deletes a CMS category.
   * Checks if the category is being used by any pages before deletion.
   * @param id - Category ID
   * @throws NotFoundException if category not found
   * @throws BadRequestException if category is in use
   */
  async delete(id: string): Promise<void> {
    const category = await this.cmsCategoryModel.findById(id);
    if (!category) {
      throw new NotFoundException("CMS Category not found");
    }

    // Check if category is being used by any pages
    // Pages reference categories by slug in the 'category' field
    if (category.slug) {
      const pagesUsingCategory = await this.pageModel.countDocuments({
        category: category.slug,
      });

      if (pagesUsingCategory > 0) {
        throw new BadRequestException(
          "Cannot delete category. It is being used by one or more pages.",
        );
      }
    }

    await this.cmsCategoryModel.findByIdAndDelete(id);
  }

  /**
   * Gets the next available sortOrder for each placement type.
   * Returns the maximum sortOrder + 1 for each placement (or 1 if no items exist).
   * @returns Object with placement types as keys and next available sortOrder as values
   */
  async getPlacementSortOrderCounts(): Promise<{
    header: number;
    footer: number;
    banner: number;
    quicklinks: number;
  }> {
    const placementTypes = ["header", "footer", "banner", "quicklinks"];
    const sortOrders: any = {};

    for (const placementType of placementTypes) {
      // Find all categories with this placement type
      const categories = await this.cmsCategoryModel.find({
        "placement.type": placementType,
      });

      let maxSortOrder = 0;

      // Find the maximum sortOrder for this placement type
      for (const category of categories) {
        if (category.placement && Array.isArray(category.placement)) {
          for (const placementItem of category.placement) {
            if (
              placementItem.type === placementType &&
              placementItem.sortOrder > maxSortOrder
            ) {
              maxSortOrder = placementItem.sortOrder;
            }
          }
        }
      }

      // Next available sortOrder is maxSortOrder + 1 (or 1 if no items exist)
      sortOrders[placementType] = maxSortOrder + 1;
    }

    return sortOrders;
  }
}
