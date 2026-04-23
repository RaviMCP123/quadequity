import React, { useEffect } from "react";
import { Modal } from "@components/modal";
import { Form } from "react-bootstrap";
import { useForm, SubmitHandler } from "react-hook-form";
import Message from "@components/form/input/ErrorMessage";
import Button from "@components/button";
import Label from "@components/form/Label";
import {
  CmsCategoryFormValuesInterface,
  CmsCategoryFormProps,
} from "interface/cmsCategory";
import {
  useCreateCmsCategoryMutation,
  useUpdateCmsCategoryMutation,
  useGetCmsCategoriesQuery,
  useUpdateCmsCategoryStatusMutation,
  useGetPlacementSortOrdersQuery,
} from "@services/cmsCategoryApi";
import { useGetPagesQuery } from "@services/pageApi";
/** Placements offered in Quad Equity CMS (banner / quicklinks removed). */
const PLACEMENT_OPTIONS = ["header", "footer"] as const;

function normalizeCategoryName(value?: string): string {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function stripLegacyPlacements<T extends { type?: string } | string>(
  placements: T[],
): T[] {
  return placements.filter((p: any) => {
    const t =
      typeof p === "object" && p?.type
        ? p.type
        : typeof p === "string"
          ? p
          : "";
    return t !== "banner" && t !== "quicklinks";
  }) as T[];
}

const Index: React.FC<CmsCategoryFormProps> = ({ isOpen, closeModal, item }) => {
  const [createCmsCategory, { isLoading: isCreating }] =
    useCreateCmsCategoryMutation();
  const [updateCmsCategory, { isLoading: isUpdating }] =
    useUpdateCmsCategoryMutation();
  const [updateCmsCategoryStatus, { isLoading: isUpdatingStatus }] =
    useUpdateCmsCategoryStatusMutation();
  const isLoading = isCreating || isUpdating || isUpdatingStatus;
  
  // Track if sort order has been manually set to prevent auto-override (per placement)
  const [sortOrderManuallySet, setSortOrderManuallySet] = React.useState<Record<string, boolean>>({});
  
  // Store sort orders per placement: { "header": 1, "footer": 2, ... }
  const [sortOrdersByPlacement, setSortOrdersByPlacement] = React.useState<Record<string, number>>({});
  
  // Track initial placements (from categories API/item) to detect new selections
  const [initialPlacements, setInitialPlacements] = React.useState<string[]>([]);
  
  // Track if we need to fetch sort orders (only when new placement is selected)
  const [shouldFetchSortOrders, setShouldFetchSortOrders] = React.useState<boolean>(false);
  
  // Fetch all categories to get existing placements (for initial load)
  const { data: categoriesData } = useGetCmsCategoriesQuery(
    { page: 1, limit: 1000 }, // Fetch all categories
    { skip: !isOpen } // Only fetch when modal is open
  );
  const allCategories = categoriesData?.data?.results ?? [];
  
  // Fetch placement sort order counts from API (only when new placement is selected)
  const { data: placementSortOrdersData, isLoading: placementSortOrdersLoading } = useGetPlacementSortOrdersQuery(
    undefined,
    { skip: !isOpen || !shouldFetchSortOrders } // Only fetch when modal is open AND new placement is selected
  );
  const placementSortOrders = placementSortOrdersData?.data ?? {};

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CmsCategoryFormValuesInterface>({ defaultValues: item });

  // Fetch all pages to check if any pages exist for this category
  const { data: pagesData } = useGetPagesQuery(
    { page: 1, limit: 10000 }, // Fetch all pages
    { skip: !isOpen || !item?.id } // Only fetch when editing and modal is open
  );
  const allPages = pagesData?.data?.results ?? [];

  // Check if any pages exist for this category
  const categorySlug = watch("slug") || item?.slug || "";
  const hasPages = React.useMemo(() => {
    if (!item?.id || !categorySlug) return false; // New categories don't have pages yet
    
    const slugToMatch = categorySlug.toLowerCase().trim();
    
    // Check if any page has a category that matches this category's slug
    return allPages.some((page: any) => {
      const pageCategory = (page.category || "").toLowerCase().trim();
      
      if (!pageCategory) return false;
      
      // Exact match
      if (pageCategory === slugToMatch) return true;
      
      // Check if page category starts with the slug followed by a separator
      // e.g., "complaints-and-dispute-resolution" starts with "complaints-"
      if (pageCategory.startsWith(slugToMatch + "-") || pageCategory.startsWith(slugToMatch + "_")) {
        return true;
      }
      
      // Check if slug starts with page category followed by a separator
      // e.g., "complaints-and-dispute-resolution" category with "complaints" slug
      if (slugToMatch.startsWith(pageCategory + "-") || slugToMatch.startsWith(pageCategory + "_")) {
        return true;
      }
      
      // Also check if they share the same base word (for edge cases)
      // Extract the first word from both and compare
      const slugFirstWord = slugToMatch.split(/[-_]/)[0];
      const pageFirstWord = pageCategory.split(/[-_]/)[0];
      if (slugFirstWord && slugFirstWord === pageFirstWord && slugFirstWord.length > 2) {
        return true;
      }
      
      return false;
    });
  }, [allPages, categorySlug, item?.id]);

  useEffect(() => {
    if (item?.id) {
      // Ensure placement is an array
      const placementArray = Array.isArray(item.placement) ? item.placement : [];
      
      // Extract initial placement types from item (from categories API)
      const initialPlacementTypes: string[] = [];
      placementArray.forEach((placement: any) => {
        if (typeof placement === 'object' && placement !== null && placement.type) {
          if (
            placement.type !== "banner" &&
            placement.type !== "quicklinks"
          ) {
            initialPlacementTypes.push(placement.type);
          }
        } else if (typeof placement === 'string') {
          if (placement !== "banner" && placement !== "quicklinks") {
            initialPlacementTypes.push(placement);
          }
        }
      });
      setInitialPlacements(initialPlacementTypes);
      
      // Initialize sort orders from item if available
      // Placement can be array of objects: [{ type: "header", sortOrder: 0 }, ...]
      // or array of strings: ["header", "footer"] (legacy format)
      const initialSortOrders: Record<string, number> = {};
      const filteredPlacements = stripLegacyPlacements(placementArray);

      filteredPlacements.forEach((placement: any) => {
        if (typeof placement === 'object' && placement !== null && placement.type) {
          // New format: { type: "header", sortOrder: 0 }
          initialSortOrders[placement.type] = placement.sortOrder ?? item.sortOrder ?? 0;
        } else if (typeof placement === 'string') {
          // Legacy format: "header"
          initialSortOrders[placement] = item.sortOrder ?? 0;
        }
      });

      reset({
        ...item,
        placement: filteredPlacements,
      });
      setSortOrdersByPlacement(initialSortOrders);
      // Mark all as manually set when editing (these come from categories API)
      const manuallySet: Record<string, boolean> = {};
      Object.keys(initialSortOrders).forEach((placementType: string) => {
        manuallySet[placementType] = true;
      });
      setSortOrderManuallySet(manuallySet);
      setShouldFetchSortOrders(false); // Don't fetch sort orders on initial load
    } else {
      reset({
        name: "",
        slug: "",
        placement: [],
        sortOrder: 0,
        status: false, // New categories should be inactive until a page is added
      });
      setSortOrdersByPlacement({});
      setSortOrderManuallySet({});
      setInitialPlacements([]); // No initial placements for new category
      setShouldFetchSortOrders(false); // Don't fetch sort orders on initial load
    }
  }, [item, reset, isOpen]);

  // Watch placement value for auto-incrementing sort order per placement
  const placementValue = watch("placement");
  const selectedPlacements = React.useMemo(() => {
    if (!placementValue) return [];
    if (!Array.isArray(placementValue)) return [];
    // Extract placement types from array (can be objects or strings)
    const extracted = placementValue
      .map((p: any) => {
        // Handle object format: { type: "header", sortOrder: 0 }
        if (typeof p === 'object' && p !== null && p.type && typeof p.type === 'string') {
          return p.type;
        } 
        // Handle string format: "header"
        else if (typeof p === 'string' && p.trim() !== '') {
          return p;
        }
        return null;
      })
      .filter((p): p is string => p !== null && typeof p === 'string' && p.trim() !== '');
    
    // Final safety check - ensure all are strings
    return extracted.filter((p): p is string => typeof p === 'string');
  }, [placementValue]);

  const existingCategoryNames = React.useMemo(() => {
    const currentId = item?.id || (item as any)?._id;
    return allCategories
      .filter((category: any) => {
        const categoryId = category?.id || category?._id;
        return currentId ? categoryId !== currentId : true;
      })
      .map((category: any) => normalizeCategoryName(category?.name))
      .filter(Boolean);
  }, [allCategories, item]);

  // Detect when a new placement is selected (not in initial placements)
  useEffect(() => {
    if (!isOpen) return;
    
    // Find newly selected placements (not in initial placements)
    const newPlacements = selectedPlacements.filter(
      (placement: string) => !initialPlacements.includes(placement)
    );
    
    // If there are new placements, fetch sort orders API
    if (newPlacements.length > 0) {
      setShouldFetchSortOrders(true);
    }
  }, [selectedPlacements, initialPlacements, isOpen]);

  // Auto-set sort order for newly selected placements using API (API already returns incremented value)
  useEffect(() => {
    if (isOpen && shouldFetchSortOrders && !placementSortOrdersLoading && placementSortOrders) {
      // Only process placements that are NOT in initial placements (newly selected)
      const newPlacements = selectedPlacements.filter(
        (placement: string) => !initialPlacements.includes(placement)
      );
      
      if (newPlacements.length > 0) {
        // Update sort orders and placement array
        const currentPlacements = Array.isArray(watch("placement")) ? watch("placement") : [];
        const updatedPlacements = currentPlacements.map((p: any) => {
          const placementType = typeof p === 'object' && p !== null && p.type ? p.type : (typeof p === 'string' ? p : null);
          
          // If this is a newly selected placement, update its sort order from API
          if (placementType && newPlacements.includes(placementType) && !sortOrderManuallySet[placementType]) {
            const placementSortOrder = placementSortOrders[placementType as keyof typeof placementSortOrders] ?? 0;
            const nextSortOrder = Math.max(0, placementSortOrder);
            
            // Update sortOrdersByPlacement
            setSortOrdersByPlacement((prev) => ({
              ...prev,
              [placementType]: nextSortOrder,
            }));
            
            // Return updated placement object
            return { type: placementType, sortOrder: nextSortOrder };
          }
          
          // Keep existing placement as is
          return p;
        });
        
        // Update the form with new sort orders
        setValue("placement", updatedPlacements, { shouldValidate: false });
      }
    }
  }, [selectedPlacements, placementSortOrders, placementSortOrdersLoading, shouldFetchSortOrders, item?.id, isOpen, sortOrderManuallySet, initialPlacements, watch, setValue]);

  const onSubmit: SubmitHandler<CmsCategoryFormValuesInterface> = async (
    data: CmsCategoryFormValuesInterface
  ) => {
    const placementsForSubmit = selectedPlacements.filter(
      (p) => p !== "banner" && p !== "quicklinks",
    );

    // Ensure placement is an array and convert to object format
    const placementArray = Array.isArray(data.placement) ? data.placement : [];
    
    // Convert placement to array of objects with type and sortOrder
    const placementObjects = placementsForSubmit.map((placementType: string) => {
      // Check if placement already exists in array as object
      const existingPlacement = placementArray.find((p: any) => {
        if (typeof p === 'object' && p !== null && p.type) {
          return p.type === placementType;
        }
        return false;
      });
      
      if (existingPlacement && typeof existingPlacement === 'object') {
        // Update existing object with current sortOrder
        return {
          type: placementType,
          sortOrder: sortOrdersByPlacement[placementType] ?? existingPlacement.sortOrder ?? 0,
        };
      } else {
        // Create new object
        return {
          type: placementType,
          sortOrder: sortOrdersByPlacement[placementType] ?? 0,
        };
      }
    });
    
    // Use the minimum sort order as the main sortOrder for backward compatibility
    const minSortOrder = placementObjects.length > 0
      ? Math.min(...placementObjects.map((p: any) => p.sortOrder ?? 0))
      : 0;
    
    if (item?.id) {
      // For updates, exclude status from the main update payload
      // Status is only updated via the table switch, not from the form
      const { status, ...updateData } = data;
      const payload = { 
        params: { 
          ...updateData, 
          placement: placementObjects,
          sortOrder: minSortOrder,
        }, 
        id: item.id,
        onClose: closeModal 
      };
      await updateCmsCategory(payload);
    } else {
      // For new categories, always set status to false (backend will handle activation when pages are added)
      const payload = { 
        params: { 
          ...data, 
          placement: placementObjects,
          sortOrder: minSortOrder,
          status: false, // Force status to false for new categories
        }, 
        onClose: closeModal 
      };
      await createCmsCategory(payload);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      className="max-w-[700px] m-4"
      preventClose={isLoading}
    >
      <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
        {isLoading && (
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-[#0056d2]/20 border-t-[#0056d2] rounded-full animate-spin"></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {item?.id ? "Updating CMS Category..." : "Creating CMS Category..."}
              </span>
            </div>
          </div>
        )}
        <div className="px-2 pr-14">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            CMS Category
          </h4>
        </div>
        <Form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
          <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
            <Form.Group className="col-span-2 pt-4">
              <Label>
                Name <span className="text-error-500">*</span>
              </Label>
              <Form.Control
                type="text"
                className={`h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90 dark:focus:border-brand-800 ${
                  errors.name
                    ? "border-rose-300 focus:border-rose-300  dark:border-rose-300 dark:focus:border-rose-300"
                    : "dark:focus:border-primary focus:border-primary"
                }`}
                {...register("name", {
                  required: "Name is required.",
                  maxLength: {
                    value: 250,
                    message: "Name should not exceed 250 characters.",
                  },
                  validate: {
                    noEdgeSpaces: (value) =>
                      value.trim() === value ||
                      "No leading or trailing spaces allowed.",
                    uniqueName: (value) =>
                      !existingCategoryNames.includes(normalizeCategoryName(value)) ||
                      "Category name already exists.",
                  },
                })}
                isInvalid={!!errors.name}
                placeholder="Please enter category name."
              />
              <Message message={errors?.name?.message ?? ""} />
            </Form.Group>

            <Form.Group className="col-span-2 pt-4">
              <Label>Slug</Label>
              <Form.Control
                type="text"
                className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90 dark:focus:border-brand-800"
                {...register("slug")}
                placeholder="Auto-generated from name if not provided"
              />
            </Form.Group>

            <Form.Group className="col-span-2 pt-4">
              <Label>
                Placement
              </Label>
              <div className="space-y-3">
                {PLACEMENT_OPTIONS.map((option) => {
                  const placementValue = watch("placement") || [];
                  const currentPlacements = Array.isArray(placementValue) ? placementValue : [];
                  // Check if option exists in placement array (can be objects or strings)
                  const isChecked = currentPlacements.some((p: any) => {
                    if (typeof p === 'object' && p !== null && p.type) {
                      return p.type === option;
                    } else if (typeof p === 'string') {
                      return p === option;
                    }
                    return false;
                  });
                  return (
                    <div key={option} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`placement-${option}`}
                        className="w-5 h-5 border-gray-300 text-brand-500 focus:ring-brand-500 rounded dark:border-gray-700 dark:bg-gray-900"
                        checked={isChecked}
                        onChange={(e) => {
                          const currentPlacements = Array.isArray(watch("placement")) ? watch("placement") : [];
                          let newPlacements: any[];
                          
                          if (e.target.checked) {
                            // Check if option already exists
                            const exists = currentPlacements.some((p: any) => {
                              if (typeof p === 'object' && p !== null && p.type) {
                                return p.type === option;
                              } else if (typeof p === 'string') {
                                return p === option;
                              }
                              return false;
                            });
                            
                            if (!exists) {
                              // Use existing sort order if available, otherwise use temporary value (will be updated by API)
                              const sortOrder = sortOrdersByPlacement[option] ?? 0;
                              
                              newPlacements = [...currentPlacements, { type: option, sortOrder }];
                              // Note: Sort order will be updated by useEffect when API responds
                            } else {
                              newPlacements = currentPlacements;
                            }
                          } else {
                            // Remove option from array (can be object or string)
                            newPlacements = currentPlacements.filter((p: any) => {
                              if (typeof p === 'object' && p !== null && p.type) {
                                return p.type !== option;
                              } else if (typeof p === 'string') {
                                return p !== option;
                              }
                              return true;
                            });
                            // Remove sort order for removed placement
                            setSortOrdersByPlacement((prev) => {
                              const updated = { ...prev };
                              delete updated[option];
                              return updated;
                            });
                            // Remove manual set flag for removed placement
                            setSortOrderManuallySet((prev) => {
                              const updated = { ...prev };
                              delete updated[option];
                              return updated;
                            });
                          }
                          
                          setValue("placement", newPlacements, { shouldValidate: true });
                        }}
                      />
                      <label
                        htmlFor={`placement-${option}`}
                        className="ml-2 text-sm font-medium text-gray-800 dark:text-gray-200 capitalize cursor-pointer"
                      >
                        {option}
                      </label>
                    </div>
                  );
                })}
              </div>
              <input
                type="hidden"
                {...register("placement")}
              />
              <Message message={errors?.placement?.message ?? ""} />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Select where this category should appear (optional - you can select multiple options)
              </p>
            </Form.Group>

            {/* Dynamic Sort Order fields for each selected placement */}
            {selectedPlacements.length > 0 && (
              <div className="col-span-2 pt-4">
                <Label>Sort Order by Placement</Label>
                <div className="space-y-4 mt-2">
                  {selectedPlacements.map((placement: string) => {
                    // Ensure placement is a valid string
                    if (typeof placement !== 'string' || !placement) return null;
                    return (
                      <Form.Group key={placement} className="pt-2">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                          Sort for {placement}
                        </Label>
                      <Form.Control
                        type="number"
                        className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90 dark:focus:border-brand-800"
                        value={sortOrdersByPlacement[placement] !== undefined ? sortOrdersByPlacement[placement] : ''}
                        onChange={(e) => {
                          const inputValue = e.target.value;
                          
                          // Allow empty string
                          if (inputValue === '') {
                            setSortOrdersByPlacement((prev) => {
                              const updated = { ...prev };
                              delete updated[placement];
                              return updated;
                            });
                            
                            // Mark as manually set
                            setSortOrderManuallySet((prev) => ({
                              ...prev,
                              [placement]: true,
                            }));
                            
                            // Update the placement array to reflect empty sortOrder
                            const currentPlacements = Array.isArray(watch("placement")) ? watch("placement") : [];
                            const updatedPlacements = currentPlacements.map((p: any) => {
                              if (typeof p === 'object' && p !== null && p.type === placement) {
                                return { ...p, sortOrder: 0 };
                              }
                              return p;
                            });
                            setValue("placement", updatedPlacements, { shouldValidate: false });
                            return;
                          }
                          
                          const value = parseInt(inputValue, 10);
                          if (!isNaN(value)) {
                            const newSortOrder = Math.max(0, value);
                            
                            setSortOrdersByPlacement((prev) => ({
                              ...prev,
                              [placement]: newSortOrder,
                            }));
                            
                            // Mark as manually set
                            setSortOrderManuallySet((prev) => ({
                              ...prev,
                              [placement]: true,
                            }));
                            
                            // Update the placement array to reflect the new sortOrder
                            const currentPlacements = Array.isArray(watch("placement")) ? watch("placement") : [];
                            const updatedPlacements = currentPlacements.map((p: any) => {
                              if (typeof p === 'object' && p !== null && p.type === placement) {
                                return { ...p, sortOrder: newSortOrder };
                              }
                              return p;
                            });
                            setValue("placement", updatedPlacements, { shouldValidate: false });
                          }
                        }}
                        onBlur={(e) => {
                          // When user leaves the field, if it's empty, set to 0
                          const inputValue = e.target.value;
                          if (inputValue === '' && sortOrdersByPlacement[placement] === undefined) {
                            setSortOrdersByPlacement((prev) => ({
                              ...prev,
                              [placement]: 0,
                            }));
                            
                            // Update the placement array
                            const currentPlacements = Array.isArray(watch("placement")) ? watch("placement") : [];
                            const updatedPlacements = currentPlacements.map((p: any) => {
                              if (typeof p === 'object' && p !== null && p.type === placement) {
                                return { ...p, sortOrder: 0 };
                              }
                              return p;
                            });
                            setValue("placement", updatedPlacements, { shouldValidate: false });
                          }
                        }}
                        placeholder="0"
                        min={1}
                        step={1}
                      />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Lower numbers appear first in the {placement} menu (minimum: 1)
                        </p>
                      </Form.Group>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
            <Button
              type="button"
              className="btn btn-outline-secondary"
              onClick={closeModal}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (item?.id ? "Updating..." : "Creating...") : (item?.id ? "Update" : "Create")}
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default Index;
