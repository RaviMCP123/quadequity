import React, { useState, useEffect } from "react";
import { useForm, SubmitHandler, FieldErrors } from "react-hook-form";
import { Form } from "react-bootstrap";
import { Tabs, Switch, Upload, Modal as AntdModal } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { Modal } from "@components/modal";
import { FormProps, FormValuesInterface, FaqSection, PageSection, ValuesInterface } from "interface/page";
import { Language } from "interface/common";
import Message from "@components/form/input/ErrorMessage";
import Button from "@components/button";
import CKEditor from "@components/CKEditor";
import Label from "@components/form/Label";
import { ADMIN_LANGUAGE_LIST, LANGUAGE } from "@utils/constant/common";
import { useCreatePageMutation, useUpdatePageMutation, useGetPagesQuery } from "@services/pageApi";
import { useGetCmsCategoryListQuery, useGetPlacementSortOrdersQuery } from "@services/cmsCategoryApi";
import { getTemplateByKey, getStaticPageTemplateOptions } from "@config/pageTemplates";
import {
  canonicalizeStaticTemplateKey,
  isPageWithSectionsTemplate,
  isContactContentTemplate,
  isFooterContentTemplate,
  isInnerPageContentTemplate,
} from "@config/staticPageTemplates";
import type { UploadFile } from "antd/es/upload/interface";
import SimpleTemplateEditor from "@components/SimpleTemplateEditor";
import { normalizeImageUrl } from "@utils/imageUrl";
import showToast from "@utils/toast";

// Helper function to extract string from nested objects
const extractStringFromNested = (val: any): string => {
  if (typeof val === 'string') {
    return val === '[object Object]' ? '' : val;
  }
  if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
    const firstValue = Object.values(val)[0];
    if (typeof firstValue === 'string') {
      return firstValue === '[object Object]' ? '' : firstValue;
    }
    if (typeof firstValue === 'object' && firstValue !== null) {
      return extractStringFromNested(firstValue);
    }
    return String(firstValue || '');
  }
  return String(val || '');
};

const Index: React.FC<FormProps> = ({ isOpen, closeModal, item, existingPages = [] }) => {
  const languageList = ADMIN_LANGUAGE_LIST;
  const { data: cmsCategoryData } = useGetCmsCategoryListQuery();
  const cmsCategories = cmsCategoryData?.data ?? [];
  
  // Fetch placement sort order counts from API
  const { data: placementSortOrdersData, isLoading: placementSortOrdersLoading } = useGetPlacementSortOrdersQuery(
    undefined,
    { skip: !isOpen } // Only fetch when modal is open
  );
  const placementSortOrders = placementSortOrdersData?.data ?? {};
  
  // Debug: Log when API is called and data is received
  React.useEffect(() => {
    if (isOpen && !placementSortOrdersLoading && placementSortOrdersData) {
      console.log('[SORTORDER] API called successfully! Data:', placementSortOrders);
    }
  }, [isOpen, placementSortOrdersLoading, placementSortOrdersData, placementSortOrders]);
  
  // Fetch ALL pages to check which categories are already used
  // Use a high limit to get all pages, or fetch without pagination if API supports it
  const { data: allPagesData } = useGetPagesQuery(
    { page: 1, limit: 10000 }, // High limit to get all pages
    { skip: !isOpen } // Only fetch when modal is open
  );
  const allPages = allPagesData?.data?.results ?? [];
  
  // Helper function to calculate next sortOrder for a given placement using API response
  const calculateNextSortOrder = (placement: string, excludePageId?: string, currentItemPlacement?: string): number => {
    if (!placement) return 1;
    
    // Wait for API data to load
    if (placementSortOrdersLoading) {
      console.log('[SORTORDER] API still loading, returning 1');
      return 1; // Default to 1 if API is still loading
    }
    
    // Get count from API response
    let placementCount = placementSortOrders[placement as keyof typeof placementSortOrders] ?? 0;
    
    console.log('[SORTORDER] Calculating for placement:', placement, 'API count:', placementCount);
    console.log('[SORTORDER] Placement sort orders data:', placementSortOrders);
    console.log('[SORTORDER] Current item placement:', currentItemPlacement, 'excludePageId:', excludePageId);
    
    // If editing and the current item already has this placement, subtract 1 from count
    // because the API count includes the current page
    if (excludePageId && currentItemPlacement === placement) {
      placementCount = Math.max(0, placementCount - 1);
      console.log('[SORTORDER] Adjusted count (excluding current page):', placementCount);
    }
    
    // Calculate next sortOrder: count + 1
    const nextSortOrder = Math.max(1, placementCount + 1);
    
    console.log('[SORTORDER] Final Result:', { 
      placement, 
      placementCount, 
      nextSortOrder,
      excludePageId,
      currentItemPlacement
    });
    
    return nextSortOrder;
  };
  
  const [activeLang, setActiveLang] = useState(LANGUAGE);
  const [createPage, { isLoading: isCreating }] = useCreatePageMutation();
  const [updatePage, { isLoading: isUpdating }] = useUpdatePageMutation();
  const isLoading = isCreating || isUpdating;
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValuesInterface>({ 
    defaultValues: {
      ...item,
      // Set category and templateKey from item if editing
      category: item?.category || "",
      templateKey: item
        ? canonicalizeStaticTemplateKey(
            (item as FormValuesInterface).templateKey,
            (item as ValuesInterface).category,
          )
        : "",
      placement: item?.placement || "",
      sortOrder: item?.sortOrder,
      // Convert title from multilingual to simple string if needed
      title: typeof item?.title === 'string' 
        ? item.title 
        : (typeof item?.title === 'object' && item.title 
            ? Object.values(item.title)[0] || ""
            : "") as any,
      // Convert description from multilingual to simple string if needed
      description: typeof item?.description === 'string' 
        ? item.description 
        : (typeof item?.description === 'object' && item.description 
            ? Object.values(item.description)[0] || " "
            : " ") as any,
      showFirstName: item?.showFirstName !== false,
      showLastName: item?.showLastName !== false,
      showPhoneNumber: item?.showPhoneNumber !== false,
      showEmail: item?.showEmail !== false,
      showSchoolName: item?.showSchoolName !== false,
      showJobTitle: item?.showJobTitle !== false,
      showComments: item?.showComments !== false,
    }
  });

  const selectedTemplate = watch('templateKey') || item?.templateKey || '';
  
  // Calculate sortOrder when placement changes or allPages loads
  // This handles both initial load and when user changes placement
  const watchedPlacement = watch('placement');
  useEffect(() => {
    // Extract placement from item - handle both array and string formats
    let currentPlacement: string | undefined;
    if (item?.placement) {
      if (Array.isArray(item.placement) && item.placement.length > 0) {
        currentPlacement = (item.placement as any)[0]?.type;
      } else if (typeof item.placement === 'string') {
        currentPlacement = item.placement;
      }
    }
    const currentPageId = item?.id || (item as any)?._id;
    const isEditing = !!(item?.id || (item as any)?._id);
    
    // Wait for placement sort orders API to load before calculating
    if (placementSortOrdersLoading) {
      console.log('[SORTORDER] useEffect: API still loading, skipping calculation');
      return; // Don't calculate yet, wait for API to load
    }
    
    console.log('[SORTORDER] useEffect: API loaded, placement sort orders:', placementSortOrders);
    
    // If placement changed from original (user selected different placement), recalculate
    if (isEditing && watchedPlacement && watchedPlacement !== currentPlacement) {
      console.log('[SORTORDER] useEffect: Placement changed from', currentPlacement, 'to', watchedPlacement);
      // User changed placement - calculate new sortOrder for the new placement
      const nextSortOrder = calculateNextSortOrder(
        watchedPlacement,
        currentPageId,
        currentPlacement
      );
      setValue('sortOrder', nextSortOrder, { shouldValidate: false });
      return;
    }
    
    // Also recalculate if placement is set and API just finished loading (to fix any incorrect value set when API was loading)
    // This handles the case where user changed placement while API was loading
    if (watchedPlacement && !placementSortOrdersLoading) {
      const currentSortOrder = watch('sortOrder');
      // If placement changed from original, always recalculate
      // Otherwise, only recalculate if current sortOrder is 1 (likely incorrect) or undefined
      const shouldRecalculate = (isEditing && watchedPlacement !== currentPlacement) || 
                                (!isEditing) || 
                                (currentSortOrder === 1 || currentSortOrder === undefined);
      
      if (shouldRecalculate) {
        console.log('[SORTORDER] useEffect: Recalculating sortOrder for placement:', watchedPlacement, 'currentSortOrder:', currentSortOrder);
        const nextSortOrder = calculateNextSortOrder(
          watchedPlacement,
          isEditing ? currentPageId : undefined,
          currentPlacement
        );
        setValue('sortOrder', nextSortOrder, { shouldValidate: false });
        return;
      }
    }
    
    // Only run on initial load when editing and placement exists, and placement hasn't been changed by user
    // Check if watchedPlacement matches item.placement to ensure user hasn't changed it
    if (isEditing && currentPlacement && watchedPlacement === currentPlacement) {
      // If editing and placement hasn't changed, preserve existing sortOrder if it exists
      if (item?.sortOrder !== undefined) {
        console.log('[SORTORDER] useEffect: Preserving existing sortOrder:', item.sortOrder);
        setValue('sortOrder', item.sortOrder, { shouldValidate: false });
      } else {
        // Calculate next sortOrder for the placement if sortOrder is missing
        console.log('[SORTORDER] useEffect: Calculating sortOrder for unchanged placement:', currentPlacement);
        const nextSortOrder = calculateNextSortOrder(
          currentPlacement,
          currentPageId,
          currentPlacement
        );
        setValue('sortOrder', nextSortOrder, { shouldValidate: false });
      }
    }
  }, [placementSortOrdersLoading, placementSortOrders, item?.placement, item?.sortOrder, item?.id, (item as any)?._id, setValue, watchedPlacement]);
  
  // Determine template type based on templateKey (primary) or category (fallback)
  // When editing, prioritize item.templateKey to show template immediately
  const isEditing = !!(item?.id || (item as any)?._id);

  // IMPORTANT: When editing, use item.templateKey FIRST to show template immediately
  // This ensures the template editor is shown before content is loaded
  const currentTemplateKey = isEditing
    ? (item.templateKey || selectedTemplate)
    : selectedTemplate;
  
  // Four static template keys: page_template, contactus_template, portfolio_template, footer_template (plus legacy)
  const isPageTemplate = isPageWithSectionsTemplate(currentTemplateKey);
  const isPortfolioTemplate = currentTemplateKey === "portfolio_template";
  const isHomePage = currentTemplateKey === "home_template" || currentTemplateKey === "HOMEPAGE_V1";
  const isInnerPageTemplate = isInnerPageContentTemplate(currentTemplateKey);
  const isContactUs = isContactContentTemplate(currentTemplateKey);
  const isRegisterSchool = currentTemplateKey === "register-school";
  const isFaq = currentTemplateKey === "faq";
  const isTermsCondition = currentTemplateKey === "terms-condition";
  const isFooterTemplate = isFooterContentTemplate(currentTemplateKey);
  // Get selected template config (for templates that use SimpleTemplateEditor)
  // This is computed immediately when editing, so template editor can show
  const templateConfig = React.useMemo(() => {
    if (isHomePage) {
      return getTemplateByKey('home_template');
    }
    if (isInnerPageTemplate) {
      return getTemplateByKey('INNER_PAGE_V1');
    }
    return undefined;
  }, [isHomePage, isInnerPageTemplate, currentTemplateKey]);

  // State for template image uploads
  const [templateImageFiles, setTemplateImageFiles] = useState<Record<string, UploadFile[]>>({});

  // Load sample content when template is selected (only for new pages)
  useEffect(() => {
    if (!item?.id && selectedTemplate && templateConfig?.sampleContent) {
      // Pre-fill with sample content
      const sampleImageFiles: Record<string, UploadFile[]> = {};
      
      Object.entries(templateConfig.sampleContent).forEach(([key, value]) => {
        // Check if this is an image field from template config
        const isImageField = templateConfig.fields.find(f => f.key === key && f.type === 'image');
        
        if (isImageField && typeof value === 'string' && (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/'))) {
          // Image URL from sample content - convert to UploadFile format for preview
          const fileName = value.split('/').pop() || `${key}.jpg`;
          sampleImageFiles[key] = [{
            uid: `sample-${key}-${Date.now()}`,
            name: fileName,
            status: 'done',
            url: value,
          }];
          setValue(`content.${key}` as any, value);
        } else if (isImageField && typeof value === 'object' && value !== null) {
          // Multilingual image URL (e.g., { en: "http://..." })
          const firstLang = Object.keys(value)[0];
          const imageUrl = (value as Record<string, string>)[firstLang];
          if (imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://') || imageUrl.startsWith('/'))) {
            const normalizedUrl = normalizeImageUrl(imageUrl);
            const fileName = imageUrl.split('/').pop() || `${key}.jpg`;
            sampleImageFiles[key] = [{
              uid: `sample-${key}-${Date.now()}`,
              name: fileName,
              status: 'done',
              url: normalizedUrl,
            }];
            setValue(`content.${key}` as any, value);
          }
        } else if (typeof value === 'object' && value !== null) {
          // Multilingual content (non-image)
          Object.entries(value as Record<string, string>).forEach(([lang, content]) => {
            setValue(`content.${key}.${lang}` as any, content);
          });
        } else {
          // Simple string value (non-image)
          setValue(`content.${key}` as any, value);
        }
      });
      
      // Set sample images for preview
      if (Object.keys(sampleImageFiles).length > 0) {
        setTemplateImageFiles(prev => ({ ...prev, ...sampleImageFiles }));
      }
    }
  }, [selectedTemplate, templateConfig, item?.id, setValue]);

  // Helper function to normalize multilingual values
  const getLangValue = (field: any, defaultLang: string = 'en'): string => {
    if (typeof field === 'string') {
      return field;
    }
    if (typeof field === 'object' && field !== null && !Array.isArray(field)) {
      // Try default language first, then first available value
      return field[defaultLang] || Object.values(field)[0] || '';
    }
    return '';
  };

  // Load existing template content when editing
  // Use a ref to track the last item ID to prevent unnecessary resets
  const lastItemIdRef = React.useRef<string | undefined>(undefined);
  
  // SEO State - Declare early so it can be used in useEffect
  const [metaTitle, setMetaTitle] = useState<Record<string, string>>({});
  const [metaDescription, setMetaDescription] = useState<Record<string, string>>({});
  const [customSlug, setCustomSlug] = useState<string>("");
  const [schemaMarkup, setSchemaMarkup] = useState<string>("");
  const [robotsIndex, setRobotsIndex] = useState<boolean>(true);
  const [robotsFollow, setRobotsFollow] = useState<boolean>(true);
  
  useEffect(() => {
    if (!isOpen) {
      // Reset the ref when modal closes
      lastItemIdRef.current = undefined;
      return;
    }
    
    if (!item) return;
    
    const currentItemId = item?.id || (item as any)?._id;
    
    // Only reset if this is a different item or first time opening
    if (currentItemId && currentItemId === lastItemIdRef.current) {
      // Same item, don't reset - this prevents form reset on every keystroke
      return;
    }
    
    // Update the ref
    lastItemIdRef.current = currentItemId;
    
    // Check if editing (has id or _id)
    // Note: API returns _id, but we also check for id for compatibility
    const isEditing = !!(item.id || (item as any)._id);
    
    if (isEditing) {
        
        // Normalize content first, then include it in reset
        let normalizedContent: Record<string, any> = {};
        const imageFilesMap: Record<string, UploadFile[]> = {};
        
        if (item.content && Object.keys(item.content).length > 0) {
          // Get template config to identify image fields
          const currentTemplate = item.templateKey ? getTemplateByKey(item.templateKey) : undefined;
          const imageFieldKeys = currentTemplate?.fields
            ?.filter(field => field.type === 'image')
            .map(field => field.key) || [];
          
          // Build content object with normalized values
          Object.entries(item.content).forEach(([key, value]) => {
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
              // Check if it's double-nested (e.g., { en: { en: "value" } })
              const firstKey = Object.keys(value)[0];
              const firstValue = value[firstKey];
              
              if (typeof firstValue === 'object' && firstValue !== null && !Array.isArray(firstValue)) {
                // Double-nested: flatten it
                const langContent: Record<string, string> = {};
                Object.entries(firstValue as Record<string, any>).forEach(([lang, content]) => {
                  // Ensure content is a string, not another object
                  if (typeof content === 'string' && content !== '[object Object]') {
                    langContent[lang] = content;
                  }
                });
                if (Object.keys(langContent).length > 0) {
                  normalizedContent[key] = langContent;
                }
              } else {
                // Normal multilingual content - preserve as-is (already in correct format)
                normalizedContent[key] = value;
              }
            } else if (typeof value === 'string') {
              // Check if this is an image field (from template config or by key name)
              const isImageField = imageFieldKeys.includes(key) || 
                                   key.toLowerCase().includes('image') || 
                                   key.toLowerCase().includes('photo') || 
                                   key.toLowerCase().includes('picture');
              const isUrl = value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/');
              
              if (isImageField && isUrl && value.trim() !== '') {
                // Image URL - convert to UploadFile format for preview
                const normalizedUrl = normalizeImageUrl(value);
                const fileName = value.split('/').pop() || `${key}.jpg`;
                const imageFiles: UploadFile[] = [{
                  uid: `existing-${key}-${Date.now()}`,
                  name: fileName,
                  status: 'done',
                  url: normalizedUrl,
                }];
                imageFilesMap[key] = imageFiles;
                // Store the URL in content for reference (keep original URL for backend)
                normalizedContent[key] = value;
              } else {
                // Regular string value
                normalizedContent[key] = value;
              }
            } else if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'string') {
              // Image URLs as array - convert to UploadFile format for preview
              const imageFiles: UploadFile[] = value.map((url, index) => {
                const normalizedUrl = normalizeImageUrl(url);
                return {
                  uid: `existing-${key}-${index}-${Date.now()}`,
                  name: url.split('/').pop() || `${key}-${index}.jpg`,
                  status: 'done',
                  url: normalizedUrl,
                };
              });
              imageFilesMap[key] = imageFiles;
              // Also store the URL in content for reference (keep original URL for backend)
              normalizedContent[key] = value[0]; // Store first URL
            }
          });
        }
        
        // Set image files state
        setTemplateImageFiles(imageFilesMap);
        
        // Normalize all fields and include content in reset
        const formData = {
          ...item,
          id: item.id || (item as any)._id || '',
          category: item.category || "",
          templateKey: canonicalizeStaticTemplateKey(
            item.templateKey,
            (item as ValuesInterface).category,
          ),
          title: getLangValue(item.title),
          description: getLangValue(item.description),
          content: normalizedContent, // Include content in reset
          showFirstName: item.showFirstName !== false,
          showLastName: item.showLastName !== false,
          showPhoneNumber: item.showPhoneNumber !== false,
          showEmail: item.showEmail !== false,
          showSchoolName: item.showSchoolName !== false,
          showJobTitle: item.showJobTitle !== false,
          showComments: item.showComments !== false,
        };
        
        reset(formData);
        
        // Load FAQ sections if exists
        if (item.faqSections && Array.isArray(item.faqSections)) {
          setValue('faqSections', item.faqSections);
        }
        
        // Load Contact Us fields if exists (handle multilingual objects)
        if (item.email) setValue('email', typeof item.email === 'string' ? item.email : String(item.email || ''));
        if (item.phone) setValue('phone', typeof item.phone === 'string' ? item.phone : String(item.phone || ''));
        
        // Handle multilingual address
        if (item.address) {
          if (typeof item.address === 'string') {
            setValue('address', item.address);
          } else if (typeof item.address === 'object' && item.address !== null) {
            // Set each language value
            Object.entries(item.address as Record<string, any>).forEach(([lang, val]) => {
              if (typeof val === 'string') {
                setValue(`address.${lang}` as any, val);
              }
            });
          }
        }
        
        // Handle multilingual Contact Us fields
        const multilingualContactFields = [
          'customerSupportTitle',
          'customerSupportDescription',
          'feedbackTitle',
          'feedbackDescription',
          'mediaTitle',
          'mediaDescription',
          'formTitle',
          'submitButtonText',
        ];
        
        multilingualContactFields.forEach((fieldName) => {
          const fieldValue = (item as any)[fieldName];
          if (fieldValue) {
            if (typeof fieldValue === 'string') {
              setValue(fieldName as any, fieldValue);
            } else if (typeof fieldValue === 'object' && fieldValue !== null) {
              // Set each language value
              Object.entries(fieldValue as Record<string, any>).forEach(([lang, val]) => {
                if (typeof val === 'string') {
                  setValue(`${fieldName}.${lang}` as any, val);
                }
              });
            }
          }
        });
        if (item.showFirstName !== undefined) setValue('showFirstName', item.showFirstName);
        if (item.showLastName !== undefined) setValue('showLastName', item.showLastName);
        if (item.showPhoneNumber !== undefined) setValue('showPhoneNumber', item.showPhoneNumber);
        if (item.showEmail !== undefined) setValue('showEmail', item.showEmail);
        if (item.showSchoolName !== undefined) setValue('showSchoolName', item.showSchoolName);
        if (item.showJobTitle !== undefined) setValue('showJobTitle', item.showJobTitle);
        if (item.showComments !== undefined) setValue('showComments', item.showComments);
        
        // Load SEO fields - Always initialize, even if empty
        // Meta Title
        if ((item as any)?.metaTitle) {
          if (typeof (item as any).metaTitle === 'string') {
            setMetaTitle({ [LANGUAGE]: (item as any).metaTitle });
          } else if (typeof (item as any).metaTitle === 'object') {
            setMetaTitle((item as any).metaTitle || {});
          }
        } else {
          // Initialize empty if not present
          setMetaTitle({});
        }
        
        // Meta Description
        if ((item as any)?.metaDescription) {
          if (typeof (item as any).metaDescription === 'string') {
            setMetaDescription({ [LANGUAGE]: (item as any).metaDescription });
          } else if (typeof (item as any).metaDescription === 'object') {
            setMetaDescription((item as any).metaDescription || {});
          }
        } else {
          // Initialize empty if not present
          setMetaDescription({});
        }
        
        // Custom Slug - Always initialize, use existing slug
        // Category slug will be set in a separate useEffect after allCategories is available
        setCustomSlug((item as any)?.customSlug || item?.slug || "");
        
        // Schema Markup - Always initialize, preserve the value exactly as stored
        const itemSchemaMarkup = (item as any)?.schemaMarkup;
        if (itemSchemaMarkup && typeof itemSchemaMarkup === 'string') {
          // Preserve the exact value including newlines and formatting
          setSchemaMarkup(itemSchemaMarkup);
        } else {
          setSchemaMarkup("");
        }
        
        // Robots Index - Default to true if not set
        setRobotsIndex((item as any)?.robotsIndex !== undefined ? (item as any).robotsIndex : true);
        
        // Robots Follow - Default to true if not set
        setRobotsFollow((item as any)?.robotsFollow !== undefined ? (item as any).robotsFollow : true);
    } else {
        // Reset form for new page
        reset({
          category: "",
          templateKey: "",
          title: "",
          description: " ",
          showFirstName: true,
          showLastName: true,
          showPhoneNumber: true,
          showEmail: true,
          showSchoolName: true,
          showJobTitle: true,
          showComments: true,
        });
        setTemplateImageFiles({});
        // Reset SEO fields
        setMetaTitle({});
        setMetaDescription({});
        setCustomSlug("");
        setSchemaMarkup("");
        setRobotsIndex(true);
        setRobotsFollow(true);
      }
  }, [isOpen, item?.id, (item as any)?._id, reset, setValue, item?.category]);
  
  // Get categories that are already used (excluding current item being edited)
  // Use allPages from API instead of existingPages prop to get accurate data across all pages
  // This checks if any page's category matches a CMS category slug (with flexible matching)
  const usedCategories = React.useMemo(() => {
    const currentPageId = item?.id || (item as any)?._id;
    // Use allPages from API query, fallback to existingPages if API data not available yet
    const pagesToCheck = allPages.length > 0 ? allPages : existingPages;
    
    // Get all unique page categories
    const pageCategories = pagesToCheck
      .filter((page: ValuesInterface) => {
        const pageId = page.id || (page as any)?._id;
        // Exclude current page if editing
        return pageId !== currentPageId && page.category;
      })
      .map((page: ValuesInterface) => (page.category || "").toLowerCase().trim())
      .filter((cat: string) => cat.length > 0);
    
    // Now check which CMS category slugs match any of these page categories
    const usedCategorySlugs = new Set<string>();
    
    cmsCategories.forEach((cmsCat: any) => {
      const categorySlug = (cmsCat.slug || "").toLowerCase().trim();
      if (!categorySlug) return;
      
      // Check if any page category matches this CMS category slug
      const isUsed = pageCategories.some((pageCategory: string) => {
        // Exact match
        if (pageCategory === categorySlug) return true;
        
        // Check if page category starts with the slug followed by a separator
        // e.g., "complaints-and-dispute-resolution" starts with "complaints-"
        if (pageCategory.startsWith(categorySlug + "-") || pageCategory.startsWith(categorySlug + "_")) {
          return true;
        }
        
        // Check if slug starts with page category followed by a separator
        if (categorySlug.startsWith(pageCategory + "-") || categorySlug.startsWith(pageCategory + "_")) {
          return true;
        }
        
        // Also check if they share the same base word (for edge cases)
        // Extract the first word from both and compare
        const slugFirstWord = categorySlug.split(/[-_]/)[0];
        const pageFirstWord = pageCategory.split(/[-_]/)[0];
        if (slugFirstWord && slugFirstWord === pageFirstWord && slugFirstWord.length > 2) {
          return true;
        }
        
        return false;
      });
      
      if (isUsed) {
        usedCategorySlugs.add(categorySlug);
      }
    });
    
    return Array.from(usedCategorySlugs);
  }, [allPages, existingPages, item?.id, item, cmsCategories]);

  // Available categories - Only from CMS Category API
  // Map CMS Categories to dropdown options
  const allCategories = React.useMemo(() => {
    // Only use CMS Categories from API - no hardcoded fallback
    return cmsCategories
      // .filter((cat: any) => cat.status === true) // Only show categories with status: true
      .map((cat: any) => {
        // Use slug if available, otherwise generate from name
        const slug = cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        return {
          value: slug,
          label: cat.name,
          categoryId: cat.id, // Store category ID for reference
        };
      });
  }, [cmsCategories]);

  // Filter categories based on edit mode (no synthetic "blog" option)
  const availableCategories = React.useMemo(() => {
    const editing = !!(item?.id || (item as any)?._id);

    if (editing) {
      return allCategories;
    }

    const usedCategoryValues = new Set(
      usedCategories.map((cat: string) => cat.toLowerCase().trim()),
    );

    return allCategories.filter((cat: { value: string }) => {
      const catValueNormalized = cat.value.toLowerCase().trim();
      return !usedCategoryValues.has(catValueNormalized);
    });
  }, [allCategories, usedCategories, item?.id, (item as any)?._id]);

  
  // FAQ Sections State
  const [faqSections, setFaqSections] = useState<FaqSection[]>(
    item?.faqSections || []
  );

  // Initialize FAQ sections when item changes
  useEffect(() => {
    if (item?.faqSections) {
      setFaqSections(item.faqSections);
    } else if (!item?.id && isFaq) {
      // Initialize with one empty section for new FAQ
      setFaqSections([{ heading: {}, questions: [] }]);
    }
  }, [item?.id, item?.faqSections, isFaq]);

  // Page Sections State (for dynamic Page Template)
  const [pageSections, setPageSections] = useState<PageSection[]>(
    item?.pageSections || []
  );

  // State for page section images
  const [pageSectionImages, setPageSectionImages] = useState<Record<string, UploadFile[]>>({});
  
  // State for section validation errors
  const [pageSectionErrors, setPageSectionErrors] = useState<
    Record<number, { description?: string; image?: string }>
  >({});

  // Footer Template State
  const [footerDescription, setFooterDescription] = useState<Record<string, string>>((item as any)?.footerDescription || {});
  const [footerAddress, setFooterAddress] = useState<Record<string, string>>((item as any)?.address || {});
  const [xUrl, setXUrl] = useState<string>((item as any)?.twitterUrl || (item as any)?.facebookUrl || '');
  const [linkedinUrl, setLinkedinUrl] = useState<string>((item as any)?.linkedinUrl || '');

  // Banner State (for Page Template)
  const [bannerTitle, setBannerTitle] = useState<Record<string, string>>(
    (item as any)?.bannerTitle || {}
  );
  const [bannerDescription, setBannerDescription] = useState<Record<string, string>>(
    (item as any)?.bannerDescription || {}
  );
  const [bannerImage, setBannerImage] = useState<UploadFile[]>([]);

  // Initialize Page sections when item changes
  useEffect(() => {
    if (!isOpen) return;
    
    const isEditing = !!(item?.id || (item as any)?._id);
    
    // Load banner data
    if (isEditing) {
      if ((item as any)?.bannerTitle) {
        setBannerTitle((item as any).bannerTitle || {});
      }
      if ((item as any)?.bannerDescription) {
        setBannerDescription((item as any).bannerDescription || {});
      }
      if ((item as any)?.bannerImage) {
        const bannerImageUrl = (item as any).bannerImage;
        if (bannerImageUrl && typeof bannerImageUrl === 'string' && bannerImageUrl.trim() !== '') {
          const normalizedUrl = normalizeImageUrl(bannerImageUrl);
          setBannerImage([{
            uid: `banner-image-${Date.now()}`,
            name: bannerImageUrl.split('/').pop() || 'banner.jpg',
            status: 'done' as const,
            url: normalizedUrl,
          }]);
        }
      }
    }
    
    if (isEditing && item?.pageSections && Array.isArray(item.pageSections) && item.pageSections.length > 0) {
      // Load sections with all fields
      setPageSections(item.pageSections);
      
      // Initialize images for each section
      const imagesMap: Record<string, UploadFile[]> = {};
      item.pageSections.forEach((section, index) => {
        const sectionKey = `section-${index}`;
        if (section.images && Array.isArray(section.images) && section.images.length > 0) {
          // Load the first image (only one image per section)
          const imageUrl = section.images[0];
          if (imageUrl) {
            const normalizedUrl = normalizeImageUrl(imageUrl);
            imagesMap[sectionKey] = [{
              uid: `section-${index}-image-${Date.now()}`,
              name: imageUrl.split('/').pop() || 'section-image.jpg',
              status: 'done' as const,
              url: normalizedUrl,
            }];
          }
        }
      });
      setPageSectionImages(imagesMap);
    } else if (!isEditing && isPageTemplate) {
      const defaultLang = languageList[0]?.code || 'en';
      const isPortfolio = currentTemplateKey === 'portfolio_template';

      const prefilledBannerTitle: Record<string, string> = isPortfolio
        ? { [defaultLang]: 'OUR PORTFOLIO — MELBOURNE, VICTORIA' }
        : { [defaultLang]: 'Independent Selective Long-Term' };
      const prefilledBannerDescription: Record<string, string> = isPortfolio
        ? {
            [defaultLang]:
              'Ventures we are building for the long term across technology, mobility and financial services.',
          }
        : {
            [defaultLang]:
              '<p>Quad Equities is a private investment and venture platform focused on building and scaling businesses across Australian and international markets.</p>',
          };

      const prefilledSections: PageSection[] = isPortfolio
        ? [
            {
              title: { [defaultLang]: 'FINTECH · EDUCATION' },
              subtitle: { [defaultLang]: 'Bridging families and schools through structured fee instalment solutions.' },
              description: { [defaultLang]: 'Termly' },
              buttonUrl: '/termly',
            },
            {
              title: { [defaultLang]: 'AUTOMOTIVE · SERVICES' },
              subtitle: { [defaultLang]: 'Accessible, dependable car repair for Australian families and businesses.' },
              description: { [defaultLang]: 'Everydaycar' },
              buttonUrl: '/everydaycar',
            },
            {
              title: { [defaultLang]: 'INSURTECH · PROTECTION' },
              subtitle: { [defaultLang]: 'Protection solutions that simplify policy ownership and claims.' },
              description: { [defaultLang]: 'Coversyou' },
              buttonUrl: '/coversyou',
            },
            {
              title: { [defaultLang]: 'MOBILITY · TRANSPORT' },
              subtitle: { [defaultLang]: 'Safer movement for people and goods with practical fleet technology.' },
              description: { [defaultLang]: 'Tovride' },
              buttonUrl: '/tovride',
            },
          ]
        : [
            {
              title: {},
              subtitle: {},
              description: {
                [defaultLang]:
                  'An Independent Investment Platform\nQuad Equities operates with a long-horizon mindset.\n\nWe deploy capital selectively, maintain active oversight, and prioritise structure over speed.\n\nOur focus is disciplined growth — not rapid expansion.',
              },
            },
            {
              title: {},
              subtitle: {},
              description: {
                [defaultLang]:
                  'Our Mandate\nVenture Creation\nBuilding scalable business models with structure and operational discipline.\n\nStrategic Investment\nBacking high-conviction opportunities aligned with long-term value creation.\n\nCommercialisation\nSupporting measured expansion across domestic and international markets.',
              },
            },
            {
              title: {},
              subtitle: {},
              description: {
                [defaultLang]:
                  'Measured\nStructured\nAccountable\nWe believe durability is built through clarity of structure and disciplined capital management.\n\nWe prioritise resilience across cycles over short-term performance.\n\nWe pursue alignment — not volume.',
              },
            },
          ];

      setBannerTitle(prefilledBannerTitle);
      setBannerDescription(prefilledBannerDescription);
      setBannerImage([]);
      setPageSections(prefilledSections);
      setPageSectionImages({});
    } else if (isEditing && isPageTemplate && (!item?.pageSections || !Array.isArray(item.pageSections) || item.pageSections.length === 0)) {
      // If editing but no pageSections found, initialize with empty section
      setPageSections([{ title: {}, description: {} }]);
    } else if (!isEditing && !isPageTemplate) {
      // Clear sections when not editing and not page template
      setPageSections([]);
      setPageSectionImages({});
      setBannerTitle({});
      setBannerDescription({});
      setBannerImage([]);
    }
  }, [isOpen, item?.id, (item as any)?._id, item?.pageSections, isPageTemplate, selectedTemplate, currentTemplateKey]);

  const onError = (errors: FieldErrors<FormValuesInterface>) => {
    if (errors?.title) {
      const firstErrorLang = Object.keys(errors.title)[0];
      if (firstErrorLang) {
        setActiveLang(firstErrorLang);
      }
    }
  };

  const onSubmit: SubmitHandler<FormValuesInterface> = async (
    data: FormValuesInterface
  ) => {
    // Helper function to strip HTML tags and check if content is empty
    const isEmptyContent = (content: any): boolean => {
      if (!content) return true;
      const str = String(content);
      // Strip HTML tags
      const textContent = str.replace(/<[^>]*>/g, '').trim();
      // Also check for common empty HTML patterns
      return textContent === '' || textContent === '&nbsp;' || /^[\s\n\r]*$/.test(textContent);
    };
    
    // Validate Page Template sections - title and description are required
    const pageErrors: Record<
      number,
      { title?: string; description?: string; image?: string }
    > = {};
    let hasPageErrors = false;
    
    if (isPageTemplate && pageSections && pageSections.length > 0) {
      for (let i = 0; i < pageSections.length; i++) {
        const section = pageSections[i];
        const sectionKey = `section-${i}`;
        const fileList = pageSectionImages[sectionKey] || [];
        const hasSectionFile =
          fileList.length > 0 && !!(fileList[0]?.url || fileList[0]?.originFileObj);
        const hasPersistedImage = !!(section.images?.[0] && String(section.images[0]).trim());

        if (!isPortfolioTemplate) {
          if (!hasSectionFile && !hasPersistedImage) {
            pageErrors[i] = { ...pageErrors[i], image: 'Section image is required.' };
            hasPageErrors = true;
          }
        }

        const descriptionValues = section.description ? Object.values(section.description) : [];
        const hasDescription = descriptionValues.some((val: any) => !isEmptyContent(val));

        if (!hasDescription) {
          pageErrors[i] = { ...pageErrors[i], description: 'Text is required.' };
          hasPageErrors = true;
        }
      }
    }
    
    // Set errors and prevent submission if there are validation errors
    if (hasPageErrors) {
      setPageSectionErrors(pageErrors);
      return;
    }
    
    // Clear errors if validation passes
    setPageSectionErrors({});
    
    // Use category slug first, then customSlug, then existing slug, then generate from title
    const selectedCategory = allCategories.find(cat => cat.value === data.category);
    const categorySlug = selectedCategory?.value || "";
    const slug = categorySlug || customSlug || data.slug || (typeof data.title === 'string' 
      ? data.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
      : data.category || "");
    
    // Only include Contact Us fields if category is contact-us
    const contactUsFields = isContactUs ? {
      email: data.email,
      phone: data.phone,
      address: data.address,
      customerSupportTitle: data.customerSupportTitle,
      customerSupportDescription: data.customerSupportDescription,
      feedbackTitle: data.feedbackTitle,
      feedbackDescription: data.feedbackDescription,
      mediaTitle: data.mediaTitle,
      mediaDescription: data.mediaDescription,
      formTitle: data.formTitle,
      showFirstName: data.showFirstName,
      showLastName: data.showLastName,
      showPhoneNumber: data.showPhoneNumber,
      showEmail: data.showEmail,
      showComments: data.showComments,
    } : {};
    
    // Only include Register School fields if template is register-school
    const registerSchoolFields = isRegisterSchool ? {
      showFirstName: data.showFirstName,
      showLastName: data.showLastName,
      showPhoneNumber: data.showPhoneNumber,
      showEmail: data.showEmail,
      showSchoolName: data.showSchoolName,
      showJobTitle: data.showJobTitle,
      showComments: data.showComments,
    } : {};
    
    // Only include FAQ fields if category is faq
    const faqFields = isFaq ? {
      faqSections: faqSections,
    } : {};

    // Helper function to ensure URL has protocol
    const ensureUrlProtocol = (url: string): string => {
      if (!url) return url;
      const trimmedUrl = url.trim();
      if (!trimmedUrl) return trimmedUrl;
      // If URL doesn't start with http:// or https://, add https://
      if (!trimmedUrl.match(/^https?:\/\//i)) {
        return `https://${trimmedUrl}`;
      }
      return trimmedUrl;
    };

    // Only include Footer Template fields if template is footer-template
    const footerTemplateFields = isFooterTemplate ? {
      footerDescription: Object.keys(footerDescription).length > 0 ? footerDescription : undefined,
      address: Object.keys(footerAddress).length > 0 ? footerAddress : undefined,
      facebookUrl: undefined,
      linkedinUrl: linkedinUrl ? ensureUrlProtocol(linkedinUrl) : undefined,
      instagramUrl: undefined,
      twitterUrl: xUrl ? ensureUrlProtocol(xUrl) : undefined,
      copyrightText: undefined,
    } : {};
    
    // Only include Page Template fields if template is PAGE_TEMPLATE_V1 or REGISTER_SCHOOL_V1
    // Process banner description - preserve user-defined colors, only add white if no color is set
    const processedBannerDescription: Record<string, string> = {};
    if (isPageTemplate && Object.keys(bannerDescription).length > 0) {
      Object.entries(bannerDescription).forEach(([lang, content]) => {
        if (content && content.trim() !== '') {
          // Check if content already has color styling
          const hasColor = /color:\s*[^;]+/gi.test(content) || /style\s*=\s*["'][^"']*color[^"']*["']/gi.test(content);
          
          if (!hasColor) {
            // Only add white color if no color is already set
            processedBannerDescription[lang] = `<div style="color: white;">${content}</div>`;
          } else {
            // Preserve existing colors - don't override user-defined colors
            processedBannerDescription[lang] = content;
          }
        } else {
          processedBannerDescription[lang] = content;
        }
      });
    }

    // Preserve existing images in page sections
    // Filter out empty strings from images arrays
    const cleanedPageSections = isPageTemplate ? pageSections.map((section, sectionIndex) => {
      const sectionKey = `section-${sectionIndex}`;
      const fileList = pageSectionImages[sectionKey] || [];
      
      // Get existing images from the section (filter out empty strings)
      const existingImages = (section.images || []).filter((url: string) => url && url.trim() !== '');
      
      // Determine what images to send:
      // - If fileList is empty: image was removed, send empty array
      // - If there's a new upload (originFileObj): don't send existing URLs (new file will replace)
      // - Otherwise: preserve existing images
      let images: string[] = [];
      if (fileList.length === 0) {
        // Image was removed
        images = [];
      } else {
        const hasNewUpload = fileList.some(file => file.originFileObj);
        if (hasNewUpload) {
          // New upload will replace existing, so don't send old URLs
          images = [];
        } else {
          // No new upload, preserve existing images
          images = existingImages;
        }
      }
      
      return {
        title: isPortfolioTemplate ? section.title : {},
        subtitle: isPortfolioTemplate ? section.subtitle : {},
        description: section.description,
        images: images.length > 0 ? images : undefined,
        buttonText: section.buttonText && Object.keys(section.buttonText).length > 0 ? section.buttonText : undefined,
        buttonUrl: section.buttonUrl || undefined,
      };
    }) : [];

    const bannerUrlFromState =
      bannerImage.length > 0 && typeof bannerImage[0]?.url === "string"
        ? bannerImage[0].url
        : undefined;
    const hasNewBannerUpload =
      isPageTemplate && bannerImage.length > 0 && !!bannerImage[0]?.originFileObj;
    const shouldKeepExistingBannerUrl =
      !!bannerUrlFromState &&
      !hasNewBannerUpload &&
      !bannerUrlFromState.startsWith("blob:");

    const pageTemplateFields = isPageTemplate ? {
      pageSections: cleanedPageSections,
      bannerTitle: Object.keys(bannerTitle).length > 0 ? bannerTitle : undefined,
      bannerDescription: Object.keys(processedBannerDescription).length > 0 ? processedBannerDescription : undefined,
      // Never persist browser preview blob URLs; backend will set real URL for new uploads.
      bannerImage: shouldKeepExistingBannerUrl ? bannerUrlFromState : undefined,
    } : {};

    // Collect template content and handle file uploads
    const templateContent: Record<string, any> = {};
    const formDataFiles: Record<string, File> = {}; // Store files separately for FormData
    
    if (selectedTemplate && templateConfig) {
      templateConfig.fields.forEach((field) => {
        const fieldKey = `content.${field.key}`;
        const multilingual = field.multilingual !== false;
        
        if (field.type === "image") {
          // Handle image uploads
          const fileList = templateImageFiles[field.key];
          if (fileList && fileList.length > 0) {
            const file = fileList[0];
            // Check if it's a new file upload (has originFileObj)
            if (file.originFileObj) {
              // New file upload - add to FormData files
              // The file will be sent as multipart/form-data
              formDataFiles[field.key] = file.originFileObj;
            } else if (file.url && typeof file.url === 'string' && file.url.trim() !== '') {
              // Existing image URL - keep the URL in content
              templateContent[field.key] = file.url;
            }
          }
          // If no file and no URL, don't include this field (image was removed)
        } else if (multilingual) {
          // Get the value directly from content object (already structured as {en: "value", es: "value"})
          const contentValue = watch('content' as any)?.[field.key];
          if (contentValue) {
            if (typeof contentValue === 'object' && !Array.isArray(contentValue)) {
              // Clean the content value to ensure all values are strings, not objects
              const cleanedContent: Record<string, string> = {};
              Object.entries(contentValue).forEach(([langCode, val]) => {
                if (typeof val === 'string') {
                  // Skip "[object Object]" strings - these are corrupted data
                  if (val !== '[object Object]') {
                    cleanedContent[langCode] = val;
                  }
                  // If it's "[object Object]", skip it (don't include in cleanedContent)
                } else if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
                  // Double nested, extract the actual string value
                  const actualValue = Object.values(val)[0];
                  if (typeof actualValue === 'string' && actualValue !== '[object Object]') {
                    cleanedContent[langCode] = actualValue;
                  } else if (typeof actualValue !== 'string') {
                    // Try to extract further if it's still an object
                    const deeperValue = extractStringFromNested(actualValue);
                    if (deeperValue && deeperValue !== '[object Object]') {
                      cleanedContent[langCode] = deeperValue;
                    }
                  }
                } else {
                  const strVal = String(val || '');
                  if (strVal !== '[object Object]') {
                    cleanedContent[langCode] = strVal;
                  }
                }
              });
              // Only add if we have valid cleaned content
              // Check that at least one language has non-empty content
              const hasValidContent = Object.values(cleanedContent).some(v => v && v.trim() !== '' && v !== '[object Object]');
              if (Object.keys(cleanedContent).length > 0 && hasValidContent) {
                templateContent[field.key] = cleanedContent;
              }
            } else if (typeof contentValue === 'string') {
              // Simple string value - but skip if it's "[object Object]"
              if (contentValue !== '[object Object]') {
                templateContent[field.key] = contentValue;
              }
            }
          }
        } else {
          const value = watch(fieldKey as any);
          if (value) {
            templateContent[field.key] = value;
          }
        }
      });
    }

    // Convert title to simple string
    const titleValue = typeof data.title === 'string' 
      ? data.title 
      : (data.title?.[languageList[0]?.code] || data.title?.[Object.keys(data.title || {})[0]] || "");

    // Handle description — preserve HTML (convert multilingual object to primary language string where needed)
    let descriptionValue: string | Record<string, string>;
    if (typeof data.description === 'string') {
      descriptionValue = data.description;
    } else if (typeof data.description === 'object' && data.description !== null && !Array.isArray(data.description)) {
      const firstLang = languageList[0]?.code || Object.keys(data.description)[0] || 'en';
      descriptionValue = data.description[firstLang] || data.description[Object.keys(data.description)[0]] || " ";
    } else {
      descriptionValue = " ";
    }

    // Handle banner image
    const bannerFormDataFiles: Record<string, File> = {};
    if (isPageTemplate && bannerImage.length > 0 && bannerImage[0]?.originFileObj) {
      bannerFormDataFiles['bannerImage'] = bannerImage[0].originFileObj;
    }

    // Handle page section images
    const pageSectionFormDataFiles: Record<string, File> = {};
    if (isPageTemplate && pageSections.length > 0) {
      pageSections.forEach((_section, sectionIndex) => {
        const sectionKey = `section-${sectionIndex}`;
        const fileList = pageSectionImages[sectionKey] || [];
        
        // Filter to only new uploads (files with originFileObj)
        const newUploads = fileList.filter(file => file.originFileObj);
        
        // Process each new upload - only one image per section, always use index 0
        // Since maxCount is 1, the backend will replace the image at index 0 if it exists
        if (newUploads.length > 0) {
          const key = `pageSection-${sectionIndex}-image-0`;
          pageSectionFormDataFiles[key] = newUploads[0].originFileObj!;
        }
      });
    }

    // SEO fields
    const seoFields = {
      slug,
      customSlug: customSlug || undefined,
      metaTitle: Object.keys(metaTitle).length > 0 ? metaTitle : undefined,
      metaDescription: Object.keys(metaDescription).length > 0 ? metaDescription : undefined,
      schemaMarkup: schemaMarkup.trim() || undefined,
      robotsIndex: robotsIndex !== undefined ? robotsIndex : true,
      robotsFollow: robotsFollow !== undefined ? robotsFollow : true,
    };

    const normalizedData: any = {
            ...data,
      ...seoFields,
      templateKey: selectedTemplate,
      content: Object.keys(templateContent).length > 0 ? templateContent : undefined,
      ...contactUsFields,
      ...registerSchoolFields,
      ...faqFields,
      ...pageTemplateFields,
      ...footerTemplateFields,
      title: titleValue,
      description: (isTermsCondition || isContactUs || isRegisterSchool || isFaq || isPageTemplate || (!isTemplateMode && !isFooterTemplate)) 
        ? descriptionValue 
        : " ",
      // Include placement and sortOrder if they exist
      // Convert to array format as API expects: [{ type: "footer", sortOrder: 2 }]
      ...(data.placement ? {
        placement: [{
          type: data.placement,
          sortOrder: data.sortOrder || 1
        }]
      } : {}),
    };
    
    // If there are file uploads, use FormData (multipart/form-data)
    const hasFileUploads = Object.keys(formDataFiles).length > 0 || 
                           Object.keys(bannerFormDataFiles).length > 0 ||
                           Object.keys(pageSectionFormDataFiles).length > 0;
    
    if (hasFileUploads) {
      const formData = new FormData();
      
      // Append all form data as JSON string
      formData.append('data', JSON.stringify(normalizedData));
      
      // Append image files - these will be sent as multipart/form-data
      // Backend should handle these files and return URLs
      Object.entries(formDataFiles).forEach(([key, file]) => {
        // Append as content.{fieldKey} to match backend expectations
        // e.g., content.bannerImage, content.step1Image, etc.
        formData.append(`content.${key}`, file);
      });
      
      // Append banner image
      Object.entries(bannerFormDataFiles).forEach(([key, file]) => {
        formData.append(key, file);
      });


      // Append page section images
      // Sort keys to ensure consistent ordering (pageSection-0-image-0, pageSection-1-image-0, etc.)
      const sortedPageSectionKeys = Object.keys(pageSectionFormDataFiles).sort((a, b) => {
        // Extract section and image indices for proper sorting
        const aMatch = a.match(/pageSection-(\d+)-image-(\d+)/);
        const bMatch = b.match(/pageSection-(\d+)-image-(\d+)/);
        if (aMatch && bMatch) {
          const aSection = parseInt(aMatch[1]);
          const bSection = parseInt(bMatch[1]);
          const aImage = parseInt(aMatch[2]);
          const bImage = parseInt(bMatch[2]);
          if (aSection !== bSection) return aSection - bSection;
          return aImage - bImage;
        }
        return a.localeCompare(b);
      });
      
      sortedPageSectionKeys.forEach((key) => {
        formData.append(key, pageSectionFormDataFiles[key]);
      });
      
      const payload = { 
        params: formData as any, 
        onClose: closeModal,
        ...((item?.id || (item as any)?._id) && { id: item.id || (item as any)._id }) // Include ID for update
      };
      
      const isEditing = !!(item?.id || (item as any)?._id);
      if (isEditing) {
      await updatePage(payload);
    } else {
      await createPage(payload);
      }
    } else {
      // No file uploads, send as regular JSON
      const payload = { 
        params: normalizedData, 
        onClose: closeModal,
        ...((item?.id || (item as any)?._id) && { id: item.id || (item as any)._id }) // Include ID for update
      };
      const isEditing = !!(item?.id || (item as any)?._id);
      if (isEditing) {
        await updatePage(payload);
      } else {
        await createPage(payload);
      }
    }
  };

  // Template mode: Show template editor for templates that use SimpleTemplateEditor
  // This is computed immediately so template editor shows right away when editing
  // When editing, also check item.templateKey directly as fallback to ensure template shows
  const isTemplateMode = React.useMemo(() => {
    // Page Template is dynamic (not using SimpleTemplateEditor), so exclude it
    const hasHomePageTemplate = isHomePage && templateConfig;
    const hasItemHomePage =
      isEditing && (item?.templateKey === 'HOMEPAGE_V1' || item?.templateKey === 'home_template') && templateConfig;
    const hasInnerPageTemplate = isInnerPageTemplate && templateConfig;
    const hasItemInnerPage = isEditing && item?.templateKey === 'innerpage_template' && templateConfig;
    return hasHomePageTemplate || hasItemHomePage || hasInnerPageTemplate || hasItemInnerPage;
  }, [isHomePage, isInnerPageTemplate, templateConfig, isEditing, item?.templateKey]);
  
  // Debug: Log template detection to verify template shows first
  // Only log when modal opens or template changes, not on every keystroke
  React.useEffect(() => {
    // Template detection logic - removed console.log
    // Removed pageSections from dependencies to prevent re-running on every keystroke
    // Only run when modal opens or template-related values change
  }, [isOpen, isEditing, item?.templateKey, selectedTemplate, currentTemplateKey, isPageTemplate, templateConfig, isTemplateMode]);

  // Watch required fields to disable Save Changes button
  const watchedCategory = watch('category');
  const watchedTemplateKey = watch('templateKey');
  const watchedTitle = watch('title');

  // Helper function to check if title is empty
  const isTitleEmpty = React.useMemo(() => {
    const titleValue = watchedTitle || (isEditing && item?.title ? item.title : null);
    if (!titleValue) return true;
    if (typeof titleValue === 'string') {
      return titleValue.trim() === '';
    }
    if (typeof titleValue === 'object' && titleValue !== null) {
      // Check if it's a multilingual object
      const values = Object.values(titleValue);
      if (values.length === 0) return true;
      // Check if at least one language has a non-empty value
      return !values.some(val => typeof val === 'string' && val.trim() !== '');
    }
    return true;
  }, [watchedTitle, isEditing, item?.title]);

  // Check if Save Changes button should be disabled
  const isSaveDisabled = React.useMemo(() => {
    // For editing, also check item values as fallback
    const categoryValue = watchedCategory || (isEditing && item?.category ? item.category : '');
    const templateValue = watchedTemplateKey || (isEditing && item?.templateKey ? item.templateKey : '');
    
    const categoryEmpty = !categoryValue || categoryValue.trim() === '';
    const templateEmpty = !templateValue || templateValue.trim() === '';
    return categoryEmpty || templateEmpty || isTitleEmpty;
  }, [watchedCategory, watchedTemplateKey, isTitleEmpty, isEditing, item?.category, item?.templateKey]);

  return (
    <Modal isOpen={isOpen} onClose={closeModal} className={`m-4 ${isTemplateMode ? 'max-w-[95vw]' : isFaq ? 'max-w-[900px]' : 'max-w-[700px]'}`} preventClose={isLoading}>
      <div className={`no-scrollbar relative w-full overflow-hidden rounded-3xl bg-white dark:bg-gray-900 ${isTemplateMode ? 'max-w-[95vw] h-[95vh]' : isFaq ? 'max-w-[900px] h-[95vh]' : 'max-w-[700px] h-[90vh]'} flex flex-col`}>
        <div className="p-4 lg:p-6 flex-shrink-0">
        {isLoading && (
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-[#0056d2]/20 border-t-[#0056d2] rounded-full animate-spin"></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {item?.id ? "Updating page..." : "Creating page..."}
              </span>
            </div>
          </div>
        )}
        <div className="px-2 pr-14">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              {item?.id && item?.title 
                ? (typeof item.title === 'string' 
                    ? item.title 
                    : extractStringFromNested(item.title) || "Edit Page")
                : "Static Page"}
          </h4>
          </div>
        </div>
        <Form
          onSubmit={handleSubmit(onSubmit, onError)}
          className="flex flex-col flex-1 min-h-0 overflow-hidden"
        >
          <div className="flex-1 min-h-0 overflow-y-auto">
            {/* CMS Category Selection - Show at the very top */}
            <div className="px-6 pt-4 pb-3 flex-shrink-0 border-b border-gray-200 dark:border-gray-700">
              <Form.Group>
                      <Label>
                  CMS Category <span className="text-error-500">*</span>
                </Label>
                <Form.Control
                  as="select"
                  className={`h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 ${
                    errors?.category
                      ? "border-rose-300 focus:border-rose-300"
                      : "dark:focus:border-primary focus:border-primary"
                  }`}
                  {...register("category", {
                    validate: (value: string | undefined) => {
                      if (!value || value.trim() === "") {
                        return "Category is required.";
                      }
                      return true;
                    },
                    onChange: (e) => {
                      const selectedCategoryValue = e.target.value;
                      if (selectedCategoryValue) {
                        const selectedCategory = allCategories.find(
                          (cat) => cat.value === selectedCategoryValue,
                        );
                        if (selectedCategory) {
                          setCustomSlug(selectedCategory.value);
                          setValue("slug", selectedCategory.value);
                        }
                      }
                    },
                  })}
                  value={watch('category') || item?.category || ''}
                  isInvalid={!!errors?.category}
                  disabled={isEditing || availableCategories.length === 0}
                >
                  <option value="">
                    {availableCategories.length === 0 
                      ? "No available categories (all are used or none exist)" 
                      : "Select CMS Category"}
                  </option>
                  {availableCategories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </Form.Control>
                <Message message={errors?.category?.message ?? ""} />
              </Form.Group>
            </div>

            {/* Template Selection - Show after CMS Category */}
            <div className="px-6 pt-4 pb-3 flex-shrink-0 border-b border-gray-200 dark:border-gray-700">
              <Form.Group>
                <Label>
                  Select Template <span className="text-error-500">*</span>
                </Label>
                <Form.Control
                  as="select"
                  className={`h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 ${
                    errors?.templateKey
                      ? "border-rose-300 focus:border-rose-300"
                      : "dark:focus:border-primary focus:border-primary"
                  }`}
                  {...register("templateKey", {
                    required: "Template is required.",
                  })}
                  value={watch('templateKey') || item?.templateKey || ''}
                  isInvalid={!!errors?.templateKey}
                  disabled={!!item?.id}
                >
                  <option value="">Select Template</option>
                  {getStaticPageTemplateOptions().map((template) => (
                    <option key={template.value} value={template.value}>
                      {template.label}
                    </option>
                  ))}
                </Form.Control>
                <Message message={errors?.templateKey?.message ?? ""} />
              </Form.Group>
            </div>


            {/* Title Field */}
            <div className="px-6 pt-4 pb-3 flex-shrink-0 border-b border-gray-200 dark:border-gray-700">
              <Form.Group>
                <Label>
                  Title <span className="text-error-500">*</span>
                </Label>
                <Form.Control
                  type="text"
                  className={`h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 ${
                    errors?.title
                      ? "border-rose-300 focus:border-rose-300"
                      : "dark:focus:border-primary focus:border-primary"
                  }`}
                  {...register("title" as const, {
                    required: "Title is required.",
                    maxLength: {
                      value: 500,
                      message: "Title should not exceed 500 characters.",
                    },
                    validate: {
                      noEdgeSpaces: (value) =>
                        typeof value === "string" &&
                        (value.trim() === value ||
                          "No leading or trailing spaces allowed."),
                    },
                    onChange: (e) => {
                      const titleValue = e.target.value;
                      if (titleValue && !customSlug) {
                        const generatedSlug = titleValue
                          .toLowerCase()
                          .trim()
                          .replace(/[^a-z0-9]+/g, "-")
                          .replace(/^-+|-+$/g, "");
                        setCustomSlug(generatedSlug);
                      }
                    },
                  })}
                  placeholder="Please enter title."
                  isInvalid={!!errors?.title}
                />
                <Message
                  message={
                    typeof errors?.title === "string"
                      ? errors.title
                      : errors?.title?.message ?? ""
                  }
                />
              </Form.Group>
            </div>

            {/* TEMPLATE EDITORS - Show FIRST when editing, immediately after category/template info */}
            {/* Simple Template Editor - Form-based editor when template is selected */}
            {isTemplateMode && templateConfig ? (
              <div className="pt-4 flex-1 flex flex-col min-h-0 overflow-y-auto px-6">
                <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <h5 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-1">
                    {templateConfig.name} Template Editor
                  </h5>
                  {templateConfig.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {templateConfig.description}
                    </p>
                  )}
                </div>
                <SimpleTemplateEditor
                  key={`template-editor-${item?.id || (item as any)?._id || 'new'}-${isOpen}`}
                  template={templateConfig}
                  languageList={languageList}
                  activeLang={activeLang}
                  content={watch('content') || {}}
                  onContentChange={(key, value, _lang) => {
                    // value is already the full multilingual object { en: "...", es: "..." }
                    // Set the entire object for the field key
                    setValue(`content.${key}` as any, value);
                  }}
                  imageFiles={templateImageFiles}
                  onImageChange={(key, files) => {
                    setTemplateImageFiles((prev) => ({ ...prev, [key]: files }));
                  }}
                />
              </div>
            ) : null}

            {/* Page / Portfolio template: About-style hero + repeater sections (image, text, optional CTA) */}
            {isPageTemplate && (
              <div key={`page-template-${pageSections.length}-${isOpen}`} className="pt-4 px-6">

                {/* Hero = same structure as the marketing site (About / Approach): split area — left image+headline, right lead copy */}
                <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h5 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-1">
                    Hero (top of page)
                  </h5>
                  {/* 1) Hero / banner image (first) */}
                  <Form.Group className="mb-4">
                    <Label>Hero image</Label>
                    <Upload
                      listType="picture-card"
                      fileList={bannerImage}
                      beforeUpload={(file) => {
                        // Validate image file type
                        if (!file.type?.startsWith("image/")) {
                          showToast("Invalid file type. Please select a JPEG, PNG, or JPG image.", "error");
                          return Upload.LIST_IGNORE;
                        }
                        return false; // Prevent auto upload - we handle it manually
                      }}
                      onChange={({ fileList }) => {
                        // Process fileList to ensure preview URLs are set for new files
                        const processedFileList = fileList.slice(0, 1).map((file) => {
                          // If file has originFileObj but no URL, create preview URL
                          if (file.originFileObj && !file.url) {
                            const previewUrl = URL.createObjectURL(file.originFileObj);
                            return {
                              ...file,
                              url: previewUrl,
                              thumbUrl: previewUrl,
                              status: 'done' as const,
                            };
                          }
                          // If file already has URL (existing image), preserve it
                          return {
                            ...file,
                            thumbUrl: file.url || file.thumbUrl,
                            status: file.status || 'done' as const,
                          };
                        });
                        setBannerImage(processedFileList);
                      }}
                      onPreview={(file) => {
                        // Handle preview click - show image in modal
                        // First, try to get the file from state (which has the URL we set)
                        const stateFile = bannerImage.find(f => f.uid === file.uid);
                        let previewUrl = stateFile?.url || stateFile?.thumbUrl || file.url || file.thumbUrl;
                        
                        // If no URL but has originFileObj, create preview URL on the fly
                        const fileObj = stateFile || file;
                        if (!previewUrl && fileObj.originFileObj) {
                          previewUrl = URL.createObjectURL(fileObj.originFileObj);
                        }
                        
                        if (previewUrl) {
                          AntdModal.info({
                            title: file.name || 'Image Preview',
                            content: (
                              <img
                                alt={file.name || 'preview'}
                                style={{ width: '100%' }}
                                src={previewUrl}
                              />
                            ),
                            width: 600,
                            okText: 'Close',
                            zIndex: 100000,
                            centered: true,
                            getContainer: () => document.body,
                          });
                        } else {
                          showToast('Unable to preview image. Please try again.', 'error');
                        }
                      }}
                      onRemove={() => {
                        setBannerImage([]);
                      }}
                      maxCount={1}
                    >
                      {bannerImage.length < 1 && (
                        <div>
                          <PlusOutlined />
                          <div style={{ marginTop: 8 }}>Upload</div>
                        </div>
                      )}
                    </Upload>
                  </Form.Group>

                  {/* 2) Headline on the image (same as h1 in hero) */}
                  <Form.Group className="mb-4">
                    <Label>Headline (on the hero image) <span className="text-error-500">*</span></Label>
            <Tabs
              activeKey={activeLang}
              type="card"
              onChange={(key) => setActiveLang(key)}
              tabBarStyle={languageList.length === 1 ? { display: 'none' } : undefined}
                      items={languageList.map((lang: Language) => ({
                key: lang.code,
                label: <span className="tab-title">{lang.title}</span>,
                children: (
                          <Form.Control
                            type="text"
                            className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm"
                            value={bannerTitle[lang.code] || ""}
                            onChange={(e) => {
                              setBannerTitle(prev => ({
                                ...prev,
                                [lang.code]: e.target.value,
                              }));
                            }}
                            placeholder="e.g. Independent · Selective · Long-Term (line breaks: use HTML &lt;br /&gt;)"
                          />
                        ),
                      }))}
                    />
                  </Form.Group>

                  {/* 3) Lead / intro in the right column (HeroSwiper area) */}
                  <Form.Group className="mb-0">
                    <Label>Intro text (right column, large) <span className="text-error-500">*</span></Label>
                    <Tabs
                      activeKey={activeLang}
                      type="card"
                      onChange={(key) => setActiveLang(key)}
                      tabBarStyle={languageList.length === 1 ? { display: 'none' } : undefined}
                      items={languageList.map((lang: Language) => ({
                        key: lang.code,
                        label: <span className="tab-title">{lang.title}</span>,
                        children: (
                      <CKEditor
                            keyName={`bannerDescription-${lang.code}`}
                            value={(() => {
                              const currentValue = bannerDescription[lang.code] || "";
                              // If empty and it's a new page (not editing), show default visible text
                              if (!currentValue && !item?.id && !(item as any)?._id) {
                                return '<p style="color: black;">Add a short introduction that will appear in the right-hand panel. You can use &lt;strong&gt; to emphasize the first words.</p>';
                              }
                              // If value exists but has white color, make it visible
                              if (currentValue) {
                                let visibleValue = currentValue;
                                // Replace white color with black for visibility
                                visibleValue = visibleValue.replace(/color:\s*white/gi, 'color: black');
                                visibleValue = visibleValue.replace(/color:\s*#ffffff/gi, 'color: black');
                                visibleValue = visibleValue.replace(/color:\s*#fff/gi, 'color: black');
                                // If no color is set and content exists, ensure it's visible
                                if (!/color:\s*[^;]+/gi.test(visibleValue) && !/style\s*=\s*["'][^"']*color[^"']*["']/gi.test(visibleValue) && visibleValue.trim() !== '') {
                                  // Wrap in div with black color if it's not already wrapped
                                  if (!visibleValue.includes('<div') && !visibleValue.includes('<p')) {
                                    visibleValue = `<div style="color: black;">${visibleValue}</div>`;
                                  } else if (visibleValue.includes('<p') && !visibleValue.includes('style')) {
                                    visibleValue = visibleValue.replace(/<p>/gi, '<p style="color: black;">');
                                  }
                                }
                                return visibleValue;
                              }
                              return currentValue;
                            })()}
                            setValue={(_key, value) => {
                              setBannerDescription(prev => ({
                                ...prev,
                                [lang.code]: value,
                              }));
                            }}
                          />
                        ),
                      }))}
                    />
                  </Form.Group>

                  <Form.Group className="mt-4 mb-0">
                    <Label>Description text</Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      className="w-full rounded-lg border px-4 py-2.5 text-sm min-h-[5rem]"
                      value={typeof watch('description') === 'string' ? (watch('description') as string) : ""}
                      onChange={(e) => setValue('description', e.target.value as any)}
                      placeholder="Short supporting text for hero"
                    />
                  </Form.Group>
                </div>

                <div className="mb-2 mt-2">
                  <h5 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                    Content sections
                  </h5>
                </div>

                {pageSections && pageSections.length > 0 ? pageSections.map((section, sectionIndex) => (
                  <div key={`section-${sectionIndex}`} className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h6 className="text-md font-semibold text-gray-700 dark:text-white/80">
                        Section {sectionIndex + 1}
                      </h6>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const newSections = pageSections.filter((_, i) => i !== sectionIndex);
                          setPageSections(newSections);
                          // Clean up images for removed section
                          const sectionKey = `section-${sectionIndex}`;
                          const newImageMap = { ...pageSectionImages };
                          delete newImageMap[sectionKey];
                          setPageSectionImages(newImageMap);
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <DeleteOutlined className="mr-1" />
                        Remove section
                      </Button>
                    </div>

                    {!isPortfolioTemplate && (
                      <Form.Group
                        className={`mb-4 ${pageSectionErrors[sectionIndex]?.image ? 'rounded-lg ring-1 ring-rose-300 p-3' : ''}`}
                      >
                        <Label>
                          ① Image <span className="text-error-500">*</span>
                        </Label>
                        <Upload
                          listType="picture-card"
                          fileList={pageSectionImages[`section-${sectionIndex}`] || []}
                          beforeUpload={(file) => {
                            if (!file.type?.startsWith("image/")) {
                              showToast("Invalid file type. Please select a JPEG, PNG, or JPG image.", "error");
                              return Upload.LIST_IGNORE;
                            }
                            return false;
                          }}
                          onChange={({ fileList }) => {
                            const sectionKey = `section-${sectionIndex}`;
                            const processedFileList = fileList.slice(0, 1).map((file) => {
                              if (file.originFileObj && !file.url) {
                                const previewUrl = URL.createObjectURL(file.originFileObj);
                                return { ...file, url: previewUrl, thumbUrl: previewUrl, status: 'done' as const };
                              }
                              return {
                                ...file,
                                thumbUrl: file.url || file.thumbUrl,
                                status: file.status || 'done' as const,
                              };
                            });
                            setPageSectionImages({ ...pageSectionImages, [sectionKey]: processedFileList });
                            if (pageSectionErrors[sectionIndex]?.image) {
                              const ne = { ...pageSectionErrors };
                              delete ne[sectionIndex]?.image;
                              if (Object.keys(ne[sectionIndex] || {}).length === 0) delete ne[sectionIndex];
                              setPageSectionErrors(ne);
                            }
                          }}
                          onPreview={(file) => {
                            const sectionKey = `section-${sectionIndex}`;
                            const stateFiles = pageSectionImages[sectionKey] || [];
                            const stateFile = stateFiles.find(f => f.uid === file.uid);
                            let previewUrl = stateFile?.url || stateFile?.thumbUrl || file.url || file.thumbUrl;
                            const fileObj = stateFile || file;
                            if (!previewUrl && fileObj.originFileObj) {
                              previewUrl = URL.createObjectURL(fileObj.originFileObj);
                            }
                            if (previewUrl) {
                              AntdModal.info({
                                title: file.name || 'Image Preview',
                                content: <img alt={file.name || 'preview'} style={{ width: '100%' }} src={previewUrl} />,
                                width: 600,
                                okText: 'Close',
                                zIndex: 100000,
                                centered: true,
                                getContainer: () => document.body,
                              });
                            } else {
                              showToast('Unable to preview image. Please try again.', 'error');
                            }
                          }}
                          onRemove={() => {
                            const sectionKey = `section-${sectionIndex}`;
                            setPageSectionImages({ ...pageSectionImages, [sectionKey]: [] });
                            const next = [...pageSections];
                            next[sectionIndex] = { ...next[sectionIndex], images: [] };
                            setPageSections(next);
                          }}
                          maxCount={1}
                        >
                          {(pageSectionImages[`section-${sectionIndex}`] || []).length < 1 && (
                            <div>
                              <PlusOutlined />
                              <div style={{ marginTop: 8 }}>Upload</div>
                            </div>
                          )}
                        </Upload>
                        {pageSectionErrors[sectionIndex]?.image && (
                          <Message message={pageSectionErrors[sectionIndex].image} />
                        )}
                      </Form.Group>
                    )}

                    {isPortfolioTemplate && (
                      <>
                        <Form.Group className="mb-4">
                          <Label>① Type (text field)</Label>
                          <Tabs
                            activeKey={activeLang}
                            type="card"
                            onChange={(key) => setActiveLang(key)}
                            tabBarStyle={languageList.length === 1 ? { display: 'none' } : undefined}
                            items={languageList.map((lang: Language) => ({
                              key: lang.code,
                              label: <span className="tab-title">{lang.title}</span>,
                              children: (
                                <Form.Control
                                  type="text"
                                  className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm"
                                  value={section.title?.[lang.code] || ""}
                                  onChange={(e) => {
                                    const newSections = [...pageSections];
                                    newSections[sectionIndex] = {
                                      ...newSections[sectionIndex],
                                      title: {
                                        ...(newSections[sectionIndex].title || {}),
                                        [lang.code]: e.target.value,
                                      },
                                    };
                                    setPageSections(newSections);
                                  }}
                                  placeholder="e.g., FINTECH · EDUCATION"
                                />
                              ),
                            }))}
                          />
                        </Form.Group>

                        <Form.Group className="mb-4">
                          <Label>② Logo (optional)</Label>
                          <Upload
                            listType="picture-card"
                            fileList={pageSectionImages[`section-${sectionIndex}`] || []}
                            beforeUpload={(file) => {
                              if (!file.type?.startsWith("image/")) {
                                showToast("Invalid file type. Please select an image.", "error");
                                return Upload.LIST_IGNORE;
                              }
                              return false;
                            }}
                            onChange={({ fileList }) => {
                              const sectionKey = `section-${sectionIndex}`;
                              const processedFileList = fileList.slice(0, 1).map((file) => {
                                if (file.originFileObj && !file.url) {
                                  const previewUrl = URL.createObjectURL(file.originFileObj);
                                  return { ...file, url: previewUrl, thumbUrl: previewUrl, status: 'done' as const };
                                }
                                return {
                                  ...file,
                                  thumbUrl: file.url || file.thumbUrl,
                                  status: file.status || 'done' as const,
                                };
                              });
                              setPageSectionImages({ ...pageSectionImages, [sectionKey]: processedFileList });
                            }}
                            onPreview={(file) => {
                              const sectionKey = `section-${sectionIndex}`;
                              const stateFiles = pageSectionImages[sectionKey] || [];
                              const stateFile = stateFiles.find(f => f.uid === file.uid);
                              let previewUrl = stateFile?.url || stateFile?.thumbUrl || file.url || file.thumbUrl;
                              const fileObj = stateFile || file;
                              if (!previewUrl && fileObj.originFileObj) {
                                previewUrl = URL.createObjectURL(fileObj.originFileObj);
                              }
                              if (previewUrl) {
                                AntdModal.info({
                                  title: file.name || 'Image Preview',
                                  content: <img alt={file.name || 'preview'} style={{ width: '100%' }} src={previewUrl} />,
                                  width: 600,
                                  okText: 'Close',
                                  zIndex: 100000,
                                  centered: true,
                                  getContainer: () => document.body,
                                });
                              }
                            }}
                            onRemove={() => {
                              const sectionKey = `section-${sectionIndex}`;
                              setPageSectionImages({ ...pageSectionImages, [sectionKey]: [] });
                              const next = [...pageSections];
                              next[sectionIndex] = { ...next[sectionIndex], images: [] };
                              setPageSections(next);
                            }}
                            maxCount={1}
                          >
                            {(pageSectionImages[`section-${sectionIndex}`] || []).length < 1 && (
                              <div>
                                <PlusOutlined />
                                <div style={{ marginTop: 8 }}>Upload</div>
                              </div>
                            )}
                          </Upload>
                        </Form.Group>
                      </>
                    )}

                    {/* ② Text (right column) — single field: image | text | optional button */}
                    <Form.Group className="mb-4">
                      <Label>
                        {isPortfolioTemplate ? '③ Text area' : '② Text (right column)'} <span className="text-error-500">*</span>
                      </Label>
                      <Tabs
                        activeKey={activeLang}
                        type="card"
                        onChange={(key) => setActiveLang(key)}
                        tabBarStyle={languageList.length === 1 ? { display: 'none' } : undefined}
                        items={languageList.map((lang: Language) => ({
                          key: lang.code,
                          label: <span className="tab-title">{lang.title}</span>,
                          children: (
                            <Form.Control
                              as="textarea"
                              rows={8}
                              className={`w-full rounded-lg border px-4 py-2.5 text-sm min-h-[12rem] ${
                                pageSectionErrors[sectionIndex]?.description ? 'border-rose-300' : ''
                              }`}
                              value={section.description?.[lang.code] || ""}
                              onChange={(e) => {
                                const newSections = [...pageSections];
                                newSections[sectionIndex] = {
                                  ...newSections[sectionIndex],
                                  description: {
                                    ...newSections[sectionIndex].description,
                                    [lang.code]: e.target.value,
                                  },
                                };
                                setPageSections(newSections);
                                if (pageSectionErrors[sectionIndex]?.description) {
                                  const newErrors = { ...pageSectionErrors };
                                  delete newErrors[sectionIndex]?.description;
                                  if (Object.keys(newErrors[sectionIndex] || {}).length === 0) {
                                    delete newErrors[sectionIndex];
                                  }
                                  setPageSectionErrors(newErrors);
                                }
                              }}
                            />
                          ),
                        }))}
                      />
                      {pageSectionErrors[sectionIndex]?.description && (
                        <Message message={pageSectionErrors[sectionIndex].description} />
                      )}
                    </Form.Group>

                    {/* Optional CTA */}
                    <div className="mb-4 p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-800/30">
                      <p className="text-sm font-medium text-gray-800 dark:text-white/90 mb-2">Optional CTA</p>

                    {/* Button Text */}
                    <Form.Group className="mb-3">
                      <Label>Button label (optional)</Label>
                      <Tabs
                        activeKey={activeLang}
                        type="card"
                        onChange={(key) => setActiveLang(key)}
                        tabBarStyle={languageList.length === 1 ? { display: 'none' } : undefined}
                        items={languageList.map((lang: Language) => ({
                          key: lang.code,
                          label: <span className="tab-title">{lang.title}</span>,
                          children: (
                            <Form.Control
                              type="text"
                              className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm"
                              value={section.buttonText?.[lang.code] || ""}
                              onChange={(e) => {
                                const newSections = [...pageSections];
                                newSections[sectionIndex] = {
                                  ...newSections[sectionIndex],
                                  buttonText: {
                                    ...(newSections[sectionIndex].buttonText || {}),
                                    [lang.code]: e.target.value,
                                  },
                                };
                                setPageSections(newSections);
                              }}
                              placeholder="Button text"
                            />
                          ),
                        }))}
                      />
                    </Form.Group>

                    {/* Button URL */}
                    <Form.Group className="mb-4">
                      <Label>Button URL / Redirect Page (Optional)</Label>
                      <div className="mb-2">
                        <Form.Control
                          as="select"
                          className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700"
                          value={(() => {
                            // Check if current buttonUrl matches any page slug
                            if (!section.buttonUrl) return "";
                            const matchingPage = allPages.find((page: any) => {
                              const pageSlug = page.slug || page.customSlug || '';
                              return section.buttonUrl === `/${pageSlug}`;
                            });
                            return matchingPage ? section.buttonUrl : "";
                          })()}
                          onChange={(e) => {
                            const newSections = [...pageSections];
                            newSections[sectionIndex] = {
                              ...newSections[sectionIndex],
                              buttonUrl: e.target.value || undefined,
                            };
                            setPageSections(newSections);
                          }}
                        >
                          <option value="">Select a page</option>
                          {allPages
                            .filter((page: any) => page.id !== (item?.id || (item as any)?._id))
                            .map((page: any) => {
                              const pageTitle = typeof page.title === 'string' 
                                ? page.title 
                                : (page.title?.[languageList[0]?.code] || Object.values(page.title || {})[0] || 'Untitled');
                              const pageSlug = page.slug || page.customSlug || '';
                              return (
                                <option key={page.id || (page as any)._id} value={pageSlug ? `/${pageSlug}` : ''}>
                                  {pageTitle} {pageSlug ? `(${pageSlug})` : ''}
                                </option>
                              );
                            })}
                        </Form.Control>
                      </div>
                      <div>
                        <Form.Control
                          type="text"
                          className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700"
                          value={section.buttonUrl || ""}
                          onChange={(e) => {
                            const newSections = [...pageSections];
                            newSections[sectionIndex] = {
                              ...newSections[sectionIndex],
                              buttonUrl: e.target.value || undefined,
                            };
                            setPageSections(newSections);
                          }}
                        />
                      </div>
                    </Form.Group>
                    </div>

                  </div>
                )) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No sections yet.
                  </div>
                )}
                <div className="flex justify-center mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const newSections = [...pageSections, { title: {}, description: {} }];
                      setPageSections(newSections);
                    }}
                  >
                    <PlusOutlined className="mr-1" />
                    Add section
                  </Button>
                </div>
              </div>
            )}

            {/* Contact Us Template */}
            {isContactUs && (
              <>
                {/* Description Field - Show before form for Contact Us */}
                <div className="px-6 pt-6 pb-4">
                  <Form.Group className="mb-4">
                    <Label>Description</Label>
                      <CKEditor
                        keyName={"description"}
                      value={watch('description') as string || ""}
                        setValue={(_key, value) =>
                        setValue("description" as const, value || " ")
                        }
                      />
                    </Form.Group>
                </div>

                {/* Contact Us Right Side (Form) */}
                <div className="px-6 pt-6 pb-4">
                  <h5 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-6">
                    Contact Us Form Fields
                  </h5>
                  <Form.Group className="mb-4">
                    <Label>Quad Email Address</Label>
                    <Form.Control
                      type="email"
                      className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm"
                      value={watch('email') || ""}
                      onChange={(e) => setValue('email', e.target.value)}
                      placeholder="e.g., gab@quadequities.com.au"
                    />
                  </Form.Group>
                  <Form.Group className="mb-4">
                    <Label>Phone Number</Label>
                    <Form.Control
                      type="text"
                      className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm"
                      value={watch('phone') || ""}
                      onChange={(e) => setValue('phone', e.target.value)}
                      placeholder="e.g., +61 402 888087"
                    />
                  </Form.Group>
                  <Form.Group className="mb-4">
                    <Label>Address</Label>
                    <Tabs
                      activeKey={activeLang}
                      type="card"
                      onChange={(key) => setActiveLang(key)}
                      tabBarStyle={languageList.length === 1 ? { display: 'none' } : undefined}
                      items={languageList.map((lang: Language) => ({
                        key: lang.code,
                        label: <span className="tab-title">{lang.title}</span>,
                        children: (
                          <Form.Control
                            type="text"
                            className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm"
                            value={watch(`address.${lang.code}` as any) || ""}
                            onChange={(e) => setValue(`address.${lang.code}` as any, e.target.value)}
                            placeholder="e.g., Berwick, Victoria"
                          />
                        ),
                      }))}
                    />
                  </Form.Group>
                  <div className="mb-4">
                    <div className="mb-3">
                      <h6 className="text-base font-semibold text-gray-800 dark:text-white/90 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-t-lg inline-block">
                        Form Field Visibility
                      </h6>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg rounded-tl-none p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-gray-700 dark:text-gray-200 mb-0">Show Name</Label>
                          <Switch
                            checked={(watch('showFirstName') !== false) || (watch('showLastName') !== false)}
                            onChange={(checked) => {
                              setValue('showFirstName', checked);
                              setValue('showLastName', checked);
                            }}
                            style={{
                              backgroundColor:
                                (watch('showFirstName') !== false) || (watch('showLastName') !== false)
                                  ? '#374151'
                                  : undefined,
                            }}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label className="text-gray-700 dark:text-gray-200 mb-0">Show Phone Number</Label>
                          <Switch
                            checked={watch('showPhoneNumber') !== false}
                            onChange={(checked) => setValue('showPhoneNumber', checked)}
                            style={{
                              backgroundColor:
                                watch('showPhoneNumber') !== false ? '#374151' : undefined,
                            }}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label className="text-gray-700 dark:text-gray-200 mb-0">Show Email Address</Label>
                          <Switch
                            checked={watch('showEmail') !== false}
                            onChange={(checked) => setValue('showEmail', checked)}
                            style={{
                              backgroundColor: watch('showEmail') !== false ? '#374151' : undefined,
                            }}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label className="text-gray-700 dark:text-gray-200 mb-0">Show Message</Label>
                          <Switch
                            checked={watch('showComments') !== false}
                            onChange={(checked) => setValue('showComments', checked)}
                            style={{
                              backgroundColor: watch('showComments') !== false ? '#374151' : undefined,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Register School Template */}
            {isRegisterSchool && (
              <>
                {/* Description Field - Show before form for Register School */}
                <div className="px-6 pt-6 pb-4">
                  <Form.Group className="mb-4">
                    <Label>Description</Label>
                      <CKEditor
                        keyName={"description-register-school"}
                      value={watch('description') as string || ""}
                        setValue={(_key, value) =>
                        setValue("description" as const, value || " ")
                        }
                      />
                    </Form.Group>
                </div>

                {/* Register School Form Fields */}
                <div className="px-6 pt-6 pb-4">
                  <h5 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-6">
                    Register School Form Fields
                  </h5>
                  <div className="mb-4">
                    <div className="mb-4">
                      <h6 className="text-base font-semibold text-white bg-[#0056d2] px-4 py-2 rounded-t-lg inline-block">
                        Form Field Visibility
                      </h6>
                    </div>
                    
                    <div className="bg-[#0056d2] rounded-lg rounded-tl-none p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-white mb-0">Show First Name</Label>
                          <Switch
                            checked={watch('showFirstName') !== false}
                            onChange={(checked) => setValue('showFirstName', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label className="text-white mb-0">Show Last Name</Label>
                          <Switch
                            checked={watch('showLastName') !== false}
                            onChange={(checked) => setValue('showLastName', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label className="text-white mb-0">Show Phone Number</Label>
                          <Switch
                            checked={watch('showPhoneNumber') !== false}
                            onChange={(checked) => setValue('showPhoneNumber', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label className="text-white mb-0">Show Email</Label>
                          <Switch
                            checked={watch('showEmail') !== false}
                            onChange={(checked) => setValue('showEmail', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label className="text-white mb-0">Show School Name</Label>
                          <Switch
                            checked={watch('showSchoolName') !== false}
                            onChange={(checked) => setValue('showSchoolName', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label className="text-white mb-0">Show Job Title</Label>
                          <Switch
                            checked={watch('showJobTitle') !== false}
                            onChange={(checked) => setValue('showJobTitle', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label className="text-white mb-0">Show Comments</Label>
                          <Switch
                            checked={watch('showComments') !== false}
                            onChange={(checked) => setValue('showComments', checked)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* FAQ Sections (Only show when template is faq) */}
            {isFaq && (
              <div className="px-6 pt-6 pb-4">
                <div className="flex items-center justify-between mb-6">
                  <h5 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                    FAQ Sections
                  </h5>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const newSections = [...faqSections, { heading: {}, questions: [] }];
                      setFaqSections(newSections);
                    }}
                  >
                    <PlusOutlined className="mr-1" />
                    Add Section
                  </Button>
                </div>

                {faqSections.map((section, sectionIndex) => (
                  <div key={sectionIndex} className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h6 className="text-md font-semibold text-gray-700 dark:text-white/80">
                        Section {sectionIndex + 1}
                      </h6>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const newSections = faqSections.filter((_, i) => i !== sectionIndex);
                          setFaqSections(newSections);
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <DeleteOutlined className="mr-1" />
                        Remove Section
                      </Button>
                    </div>

                    {/* Section Heading */}
                    <Form.Group className="mb-4">
                      <Label>Section Heading</Label>
                      <Tabs
                        activeKey={activeLang}
                        type="card"
                        onChange={(key) => setActiveLang(key)}
                        tabBarStyle={languageList.length === 1 ? { display: 'none' } : undefined}
                        items={languageList.map((lang: Language) => ({
                          key: lang.code,
                          label: <span className="tab-title">{lang.title}</span>,
                          children: (
                            <Form.Control
                              type="text"
                              className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm"
                              value={section.heading?.[lang.code] || ""}
                              onChange={(e) => {
                                const newSections = [...faqSections];
                                newSections[sectionIndex] = {
                                  ...newSections[sectionIndex],
                                  heading: {
                                    ...newSections[sectionIndex].heading,
                                    [lang.code]: e.target.value,
                                  },
                                };
                                setFaqSections(newSections);
                              }}
                              placeholder="e.g., GENERAL, FOR SCHOOLS"
                            />
                ),
              }))}
            />
                    </Form.Group>

                    {/* Questions in Section */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <Label>Questions & Answers</Label>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const newSections = [...faqSections];
                            newSections[sectionIndex] = {
                              ...newSections[sectionIndex],
                              questions: [
                                ...(newSections[sectionIndex].questions || []),
                                { question: {}, answer: {} },
                              ],
                            };
                            setFaqSections(newSections);
                          }}
                        >
                          <PlusOutlined className="mr-1" />
                          Add Q&A
                        </Button>
          </div>

                      {(section.questions || []).map((qa, qaIndex) => (
                        <div key={qaIndex} className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                              Q&A {qaIndex + 1}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const newSections = [...faqSections];
                                newSections[sectionIndex] = {
                                  ...newSections[sectionIndex],
                                  questions: newSections[sectionIndex].questions.filter((_, i) => i !== qaIndex),
                                };
                                setFaqSections(newSections);
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <DeleteOutlined />
                            </Button>
                          </div>

                          {/* Question */}
                          <Form.Group className="mb-3">
                            <Label>Question</Label>
                            <Tabs
                              activeKey={activeLang}
                              type="card"
                              onChange={(key) => setActiveLang(key)}
                              tabBarStyle={languageList.length === 1 ? { display: 'none' } : undefined}
                              items={languageList.map((lang: Language) => ({
                                key: lang.code,
                                label: <span className="tab-title">{lang.title}</span>,
                                children: (
                                  <Form.Control
                                    type="text"
                                    className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm"
                                    value={qa.question?.[lang.code] || ""}
                                    onChange={(e) => {
                                      const newSections = [...faqSections];
                                      newSections[sectionIndex].questions[qaIndex] = {
                                        ...newSections[sectionIndex].questions[qaIndex],
                                        question: {
                                          ...newSections[sectionIndex].questions[qaIndex].question,
                                          [lang.code]: e.target.value,
                                        },
                                      };
                                      setFaqSections(newSections);
                                    }}
                                    placeholder="Enter question"
                                  />
                                ),
                              }))}
                            />
                          </Form.Group>

                          {/* Answer */}
                          <Form.Group>
                            <Label>Answer</Label>
                            <Tabs
                              activeKey={activeLang}
                              type="card"
                              onChange={(key) => setActiveLang(key)}
                              tabBarStyle={languageList.length === 1 ? { display: 'none' } : undefined}
                              items={languageList.map((lang: Language) => ({
                                key: lang.code,
                                label: <span className="tab-title">{lang.title}</span>,
                                children: (
                                  <CKEditor
                                    keyName={`faq-answer-${sectionIndex}-${qaIndex}-${lang.code}`}
                                    value={qa.answer?.[lang.code] || ""}
                                    setValue={(_key, value) => {
                                      const newSections = [...faqSections];
                                      newSections[sectionIndex].questions[qaIndex] = {
                                        ...newSections[sectionIndex].questions[qaIndex],
                                        answer: {
                                          ...newSections[sectionIndex].questions[qaIndex].answer,
                                          [lang.code]: value,
                                        },
                                      };
                                      setFaqSections(newSections);
                                    }}
                                  />
                                ),
                              }))}
                            />
                          </Form.Group>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Footer Template Sections (Only show when template is footer-template) */}
            {isFooterTemplate && (
              <div className="pt-4 px-6">
                <h5 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
                  Footer Content
                </h5>

                {/* Mission Description */}
                <Form.Group className="mb-4">
                  <Label>Mission Description</Label>
                  <Tabs
                    activeKey={activeLang}
                    type="card"
                    onChange={(key) => setActiveLang(key)}
                    tabBarStyle={languageList.length === 1 ? { display: 'none' } : undefined}
                    items={languageList.map((lang: Language) => ({
                      key: lang.code,
                      label: <span className="tab-title">{lang.title}</span>,
                      children: (
                        <Form.Control
                          as="textarea"
                          rows={3}
                          className="w-full rounded-lg border px-4 py-2.5 text-sm"
                          value={footerDescription[lang.code] || ""}
                          onChange={(e) => setFooterDescription(prev => ({ ...prev, [lang.code]: e.target.value }))}
                          placeholder="Enter footer mission text"
                        />
                      ),
                    }))}
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Label>Address</Label>
                  <Tabs
                    activeKey={activeLang}
                    type="card"
                    onChange={(key) => setActiveLang(key)}
                    tabBarStyle={languageList.length === 1 ? { display: 'none' } : undefined}
                    items={languageList.map((lang: Language) => ({
                      key: lang.code,
                      label: <span className="tab-title">{lang.title}</span>,
                      children: (
                        <Form.Control
                          as="textarea"
                          rows={2}
                          className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm"
                          value={footerAddress[lang.code] || ""}
                          onChange={(e) => setFooterAddress(prev => ({ ...prev, [lang.code]: e.target.value }))}
                          placeholder="e.g., Suite 2, 86 High Street, Berwick Victoria 3806"
                        />
                      ),
                    }))}
                  />
                </Form.Group>

                {/* Social Media URLs */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <Form.Group>
                    <Label>X (Twitter) URL</Label>
                    <Form.Control
                      type="text"
                      className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm"
                      value={xUrl}
                      onChange={(e) => setXUrl(e.target.value)}
                      placeholder="https://x.com/..."
                    />
                  </Form.Group>
                  <Form.Group>
                    <Label>LinkedIn URL</Label>
                    <Form.Control
                      type="text"
                      className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="https://linkedin.com/..."
                    />
                  </Form.Group>
                </div>

              </div>
            )}

            {/* Description - Show for Terms & Conditions and simple templates when NOT in template/contact/faq/pageTemplate/footerTemplate mode */}
            {(isTermsCondition || (!isTemplateMode && !isContactUs && !isRegisterSchool && !isFaq && !isPageTemplate && !isFooterTemplate)) && (
                  <div className="px-6 pt-6 pb-4">
                    <Form.Group className="mb-4">
                  <Label>Description</Label>
                      <CKEditor
                        keyName={"description"}
                        value={watch('description') as string || ""}
                        setValue={(_key, value) =>
                          setValue("description" as const, value || " ")
                        }
                      />
                    </Form.Group>
                  </div>
            )}

            {/* SEO Management Section - Always show at the end for all templates */}
            <div className="px-6 pt-6 pb-4 flex-shrink-0 border-t border-gray-200 dark:border-gray-700">
              <h5 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
                SEO Management
              </h5>
              
              {/* Custom URL / Slug */}
              <Form.Group className="mb-4">
                <Label>
                  Custom URL / Slug
                </Label>
                <Form.Control
                  type="text"
                  className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700"
                  value={customSlug}
                  onChange={(e) => {
                    const slugValue = e.target.value
                      .toLowerCase()
                      .trim()
                      .replace(/[^a-z0-9-]+/g, '-')
                      .replace(/^-+|-+$/g, '');
                    setCustomSlug(slugValue);
                  }}
                  placeholder="e.g., about-us, contact-page"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Auto-generated from title. You can customize it here.
                </p>
              </Form.Group>

              {/* Meta Title */}
              <Form.Group className="mb-4">
                <Label>Meta Title</Label>
                <Tabs
                  activeKey={activeLang}
                  type="card"
                  onChange={(key) => setActiveLang(key)}
                  tabBarStyle={languageList.length === 1 ? { display: 'none' } : undefined}
                  items={languageList.map((lang: Language) => ({
                    key: lang.code,
                    label: <span className="tab-title">{lang.title}</span>,
                    children: (
                      <Form.Control
                        type="text"
                        className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm"
                        value={metaTitle[lang.code] || ""}
                        onChange={(e) => {
                          setMetaTitle(prev => ({
                            ...prev,
                            [lang.code]: e.target.value,
                          }));
                        }}
                        placeholder="Enter meta title (recommended: 50-60 characters)"
                        maxLength={60}
                      />
                    ),
                  }))}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Recommended: 50-60 characters. Leave empty to use page title.
                </p>
              </Form.Group>

              {/* Meta Description */}
              <Form.Group className="mb-4">
                <Label>Meta Description</Label>
                <Tabs
                  activeKey={activeLang}
                  type="card"
                  onChange={(key) => setActiveLang(key)}
                  tabBarStyle={languageList.length === 1 ? { display: 'none' } : undefined}
                  items={languageList.map((lang: Language) => ({
                    key: lang.code,
                    label: <span className="tab-title">{lang.title}</span>,
                    children: (
                      <Form.Control
                        as="textarea"
                        rows={3}
                        className="w-full rounded-lg border px-4 py-2.5 text-sm"
                        value={metaDescription[lang.code] || ""}
                        onChange={(e) => {
                          setMetaDescription(prev => ({
                            ...prev,
                            [lang.code]: e.target.value,
                          }));
                        }}
                        placeholder="Enter meta description (recommended: 150-160 characters)"
                        maxLength={160}
                      />
                    ),
                  }))}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Recommended: 150-160 characters. Leave empty to use page description.
                </p>
              </Form.Group>

              {/* Robots Meta Tags */}
              <div className="mb-4">
                <Label className="mb-2 block">Robots Meta Tags</Label>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={robotsIndex}
                      onChange={setRobotsIndex}
                      checkedChildren="Index"
                      unCheckedChildren="No Index"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Allow search engines to index this page
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={robotsFollow}
                      onChange={setRobotsFollow}
                      checkedChildren="Follow"
                      unCheckedChildren="No Follow"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Allow search engines to follow links
                    </span>
                  </div>
                </div>
              </div>

              {/* Schema Markup (JSON-LD) */}
              <Form.Group className="mb-4">
                <Label>Schema Markup (JSON-LD)</Label>
                <Form.Control
                  as="textarea"
                  rows={6}
                  className="w-full rounded-lg border px-4 py-2.5 text-sm font-mono"
                  value={schemaMarkup}
                  onChange={(e) => setSchemaMarkup(e.target.value)}
                  placeholder='{"@context": "https://schema.org", "@type": "WebPage", ...}'
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Optional: Add structured data (JSON-LD) for better search engine understanding.
                </p>
              </Form.Group>
            </div>
          </div>
          <div className="flex items-center gap-3 px-6 py-4 flex-shrink-0 border-t border-gray-200 dark:border-gray-700 lg:justify-end">
            <Button size="sm" variant="outline" onClick={closeModal}>
              Close
            </Button>
            <Button size="sm" type={'submit'} disabled={isSaveDisabled || isLoading}>Save Changes</Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default Index;
