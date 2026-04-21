import React, { useEffect, useState } from "react";
import { Skeleton, Flex } from "antd";
import { ReloadOutlined, PlusCircleOutlined } from "@ant-design/icons";
import type { FilterValue, SorterResult } from "antd/es/table/interface";
import PageBreadcrumb from "@components/common/PageBreadCrumb";
import IconButton from "@components/Table/IconButton";
import PageMeta from "@components/common/PageMeta";
import { useGetCmsCategoriesQuery } from "@services/cmsCategoryApi";
import {
  CmsCategoryValuesInterface,
  CmsCategoryTableFilterParams,
  CmsCategoryFormValuesInterface,
} from "interface/cmsCategory";
import TableComponent from "./list";
import FormComponent from "./form";
import { PAGE_LIMIT } from "@utils/constant/common";
import useTableStatePersistence from "../../hooks/useTableStatePersistence";

const Index: React.FC = () => {
  const storageKey = "cms-category-management-table-state";
  const [filter, setFilter] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [typeItem, setTypeItem] = useState<CmsCategoryFormValuesInterface>(
    {} as CmsCategoryFormValuesInterface
  );
  const [filteredInfo, setFilteredInfo] = useState<
    Record<string, FilterValue | null>
  >({});
  const [sortedInfo, setSortedInfo] = useState<
    SorterResult<CmsCategoryValuesInterface>
  >({} as SorterResult<CmsCategoryValuesInterface>);
  const [categoryFilter, setCategoryFilter] =
    useState<CmsCategoryTableFilterParams | null>(null);
  const { clearState } = useTableStatePersistence<
    CmsCategoryTableFilterParams,
    CmsCategoryValuesInterface
  >({
    storageKey,
    tableFilter: categoryFilter,
    setTableFilter: setCategoryFilter,
    filteredInfo,
    setFilteredInfo,
    sortedInfo,
    setSortedInfo,
    filter,
    setFilter,
  });

  const getFormattedParams = (
    params: CmsCategoryTableFilterParams | null
  ): { [key: string]: string | number } => {
    const result: { [key: string]: string | number } = {
      page: 1,
      limit: PAGE_LIMIT,
    };

    if (params && Object.keys(params).length > 0) {
      if (params?.name?.[0]) {
        result.name = params.name[0];
      }
      if (params?.slug?.[0]) {
        result.slug = params.slug[0];
      }
      // Note: placement filtering is done on frontend for multiple selections
      // Only send to API if single selection (for backward compatibility)
      if (params?.placement?.length === 1) {
        result.placement = params.placement[0];
      }
      if (params?.status?.length) {
        result.status = params.status.join("-");
      }
      // Note: updatedAt filtering is done on frontend, not sent to API
      if (params?.sortField) {
        result.sort = params.sortField;
      }
      if (params?.sortOrder) {
        result.direction = params.sortOrder === "ascend" ? "asc" : "desc";
      }
      if (params?.page) {
        result.page = params.page;
      }
      if (params?.pageSize) {
        result.limit = params.pageSize;
      }
    }

    return result;
  };

  const queryParams = React.useMemo(() => {
    return getFormattedParams(categoryFilter);
  }, [categoryFilter]);

  const { data, isLoading, error } = useGetCmsCategoriesQuery(queryParams, {
    skip: false,
  });

  const allCategories = data?.data?.results ?? [];
  
  // Client-side filtering for updatedAt and placement (since API doesn't support multiple placement filters properly)
  const categories = React.useMemo(() => {
    let filtered = allCategories;
    
    // Filter by updatedAt if provided
    if (filteredInfo?.updatedAt && Array.isArray(filteredInfo.updatedAt) && filteredInfo.updatedAt.length > 0) {
      const dateFilter = filteredInfo.updatedAt[0] as string;
      if (dateFilter) {
        // Parse date range (format: "YYYY-MM-DDTOYYYY-MM-DD")
        const [startDate, endDate] = dateFilter.split('TO');
        if (startDate && endDate) {
          const start = new Date(startDate);
          const end = new Date(endDate);
          // Set end date to end of day
          end.setHours(23, 59, 59, 999);
          
          filtered = filtered.filter((category) => {
            if (!category.updatedAt) return false;
            const categoryDate = new Date(category.updatedAt);
            return categoryDate >= start && categoryDate <= end;
          });
        }
      }
    }
    
    // Filter by placement if provided (handle multiple selections)
    if (filteredInfo?.placement && Array.isArray(filteredInfo.placement) && filteredInfo.placement.length > 0) {
      const selectedPlacements = filteredInfo.placement as string[];
      
      filtered = filtered.filter((category) => {
        if (!category.placement || !Array.isArray(category.placement) || category.placement.length === 0) {
          return false;
        }
        
        // Extract placement types from category (can be objects or strings)
        const categoryPlacements = category.placement.map((p: any) => {
          if (typeof p === 'object' && p !== null && p.type) {
            return p.type;
          } else if (typeof p === 'string') {
            return p;
          }
          return null;
        }).filter((p): p is string => p !== null && typeof p === 'string');
        
        // Check if any of the selected placements match any of the category's placements
        return selectedPlacements.some((selectedPlacement) => 
          categoryPlacements.includes(selectedPlacement)
        );
      });
    }
    
    return filtered;
  }, [allCategories, filteredInfo?.updatedAt, filteredInfo?.placement]);
  
  const pagination = data?.data?.pagination ?? {
    total: 0,
    page: 0,
    currentPage: 0,
    limit: 0,
  };
  
  // Adjust pagination total for client-side filtered data
  const adjustedPagination = React.useMemo(() => {
    const hasClientSideFilters = 
      (filteredInfo?.updatedAt && Array.isArray(filteredInfo.updatedAt) && filteredInfo.updatedAt.length > 0) ||
      (filteredInfo?.placement && Array.isArray(filteredInfo.placement) && filteredInfo.placement.length > 0);
    
    if (hasClientSideFilters) {
      return {
        ...pagination,
        total: categories.length,
      };
    }
    return pagination;
  }, [pagination, categories.length, filteredInfo?.updatedAt, filteredInfo?.placement]);

  // Handle API errors gracefully
  React.useEffect(() => {
    if (error && 'status' in error && error.status === 404) {
      console.warn('CMS Category API endpoint not found. Please ensure the backend API is implemented.');
    }
  }, [error]);

  // Handle API errors gracefully
  if (error && 'status' in error && error.status === 404) {
    console.warn('CMS Category API endpoint not found. Please ensure the backend API is implemented.');
  }

  useEffect(() => {
    if (categoryFilter && Object.keys(categoryFilter).length > 0) {
      setFilter(true);
      setFilteredInfo({
        ...(categoryFilter as unknown as Record<string, FilterValue | null>),
      });
      if (categoryFilter.sortField && categoryFilter.sortOrder) {
        setSortedInfo({
          columnKey: categoryFilter.sortField,
          order: categoryFilter.sortOrder,
          field: categoryFilter.sortField,
        });
      }
    }
  }, [categoryFilter]);

  const onEditActionHandler = (key: string) => {
    const record = categories.find((item) => item.id === key);
    if (record) {
      setTypeItem(record);
    }
    setOpen(true);
  };

  const onPaginationActionHandler = (params: CmsCategoryTableFilterParams) => {
    setCategoryFilter(params);
    setFilter(true);
  };

  const handleResetFilter = () => {
    setFilter(false);
    setFilteredInfo({});
    setSortedInfo({});
    setCategoryFilter(null);
    clearState();
  };

  return (
    <>
      <PageMeta title="CMS Categories Management" />
      <PageBreadcrumb pageTitle="CMS Categories Management" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <Flex gap="small" vertical>
          <Flex gap="small" align="center" justify="end">
            <IconButton
              handleButtonAction={() => {
                setTypeItem({} as CmsCategoryFormValuesInterface);
                setOpen(true);
              }}
              title="Add CMS Category"
              icon={<PlusCircleOutlined />}
            />
            {filter && (
              <IconButton
                handleButtonAction={handleResetFilter}
                title="Reset Filters"
                icon={<ReloadOutlined />}
              />
            )}
          </Flex>
        </Flex>
        {!isLoading && (
          <TableComponent
            data={categories || []}
            datePagination={adjustedPagination}
            onEditActionHandler={onEditActionHandler}
            onPaginationActionHandler={onPaginationActionHandler}
            filteredInfo={filteredInfo}
            sortedInfo={sortedInfo}
            setFilteredInfo={setFilteredInfo}
            setSortedInfo={(value) =>
              setSortedInfo(
                value ?? ({} as SorterResult<CmsCategoryValuesInterface>)
              )
            }
            currentPage={categoryFilter?.page ?? 1}
            pageSize={categoryFilter?.pageSize ?? PAGE_LIMIT}
            filter={filter}
          />
        )}
        {isLoading && (
          <Skeleton loading={true} active paragraph={{ rows: 10 }} />
        )}
        {open && (
          <FormComponent
            isOpen={open}
            closeModal={() => setOpen(false)}
            item={typeItem}
          />
        )}
      </div>
    </>
  );
};

export default Index;
