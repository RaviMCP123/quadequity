import React, { useEffect, useState } from "react";
import { Flex, Skeleton } from "antd";
import { ReloadOutlined, PlusCircleOutlined } from "@ant-design/icons";
import Swal from "sweetalert2";
import type { FilterValue, SorterResult } from "antd/es/table/interface";
import PageBreadcrumb from "@components/common/PageBreadCrumb";
import IconButton from "@components/Table/IconButton";
import PageMeta from "@components/common/PageMeta";
import { useGetPagesQuery, useGetPageByIdQuery, useDeletePageMutation } from "@services/pageApi";
import { ValuesInterface, TableFilterParams, FormValuesInterface, MultilingualTitle } from "interface/page";
import TableComponent from "./list";
import FormComponent from "./form";
import { PAGE_LIMIT, LANGUAGE } from "@utils/constant/common";
import useTableStatePersistence from "../../hooks/useTableStatePersistence";

const Index: React.FC = () => {
  const storageKey = "page-management-table-state";
  const [filter, setFilter] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [typeItem, setTypeItem] = useState<FormValuesInterface>(() => ({
    title: {},
    description: {},
  }));
  const [filteredInfo, setFilteredInfo] = useState<
    Record<string, FilterValue | null>
  >({});
  const [sortedInfo, setSortedInfo] = useState<SorterResult<ValuesInterface>>(
    {} as SorterResult<ValuesInterface>
  );
  const [pageFilter, setPageFilter] = useState<TableFilterParams | null>(null);
  const { clearState } = useTableStatePersistence<
    TableFilterParams,
    ValuesInterface
  >({
    storageKey,
    tableFilter: pageFilter,
    setTableFilter: setPageFilter,
    filteredInfo,
    setFilteredInfo,
    sortedInfo,
    setSortedInfo,
    filter,
    setFilter,
  });

  const getFormattedParams = (params: TableFilterParams | null): { [key: string]: string | number } => {
    const result: { [key: string]: string | number } = {
      page: 1,
      limit: PAGE_LIMIT,
    };

    if (params && Object.keys(params).length > 0) {
      if (params?.title?.[0]) {
        result.title = params.title[0];
      }
      if (params?.updatedAt?.[0]) {
        result.updatedAt = params.updatedAt[0];
      }
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
    return getFormattedParams(pageFilter);
  }, [pageFilter]);

  const { data, isLoading } = useGetPagesQuery(queryParams, {
    skip: false,
  });
  const [deletePage] = useDeletePageMutation();

  const page = data?.data?.results ?? [];
  const pagination = data?.data?.pagination ?? {
    total: 0,
    page: 0,
    currentPage: 0,
    limit: 0,
  };

  useEffect(() => {
    if (pageFilter && Object.keys(pageFilter).length > 0) {
      setFilter(true);
      setFilteredInfo({
        ...(pageFilter as unknown as Record<string, FilterValue | null>),
      });
      if (pageFilter.sortField && pageFilter.sortOrder) {
        setSortedInfo({
          columnKey: pageFilter.sortField,
          order: pageFilter.sortOrder,
          field: pageFilter.sortField,
        });
      }
    }
  }, [pageFilter]);

  const normalizeMultilingual = (value?: unknown): MultilingualTitle => {
    if (typeof value === "string") {
      return { [LANGUAGE]: value };
    }
    return (value ?? {}) as MultilingualTitle;
  };

  const onEditActionHandler = (key: string) => {
    // Find the page by id or _id (API returns _id, but we check both)
    const record = page.find((item) => {
      const itemId = item.id || (item as any)._id;
      return itemId === key || String(itemId) === String(key);
    });
    
    if (record) {
      // Normalize the page data - map _id to id if needed
      // IMPORTANT: Preserve content as-is, don't override with empty object
      const normalizedPage = {
        ...record,
        id: record.id || (record as any)._id || key,
        // Ensure all fields are included, especially templateKey and content
        title: typeof record.title === 'string' 
          ? record.title 
          : normalizeMultilingual(record.title),
        description: typeof record.description === 'string'
          ? record.description
          : normalizeMultilingual(record.description),
        category: record.category || "",
        slug: record.slug || "",
        templateKey: record.templateKey || "",
        // Handle placement: can be array of objects with type and sortOrder, or simple string
        placement: (() => {
          if (Array.isArray(record.placement) && record.placement.length > 0) {
            // Extract the first placement type (assuming single placement selection in form)
            return record.placement[0]?.type || "";
          }
          return typeof record.placement === 'string' ? record.placement : "";
        })(),
        // Extract sortOrder from placement array if it exists, otherwise use record.sortOrder
        sortOrder: (() => {
          if (Array.isArray(record.placement) && record.placement.length > 0) {
            // Get sortOrder from the first placement object
            return record.placement[0]?.sortOrder;
          }
          return record.sortOrder;
        })(),
        // Preserve content - use record.content if it exists and has keys, otherwise keep original
        content: (record.content && Object.keys(record.content).length > 0) 
          ? record.content 
          : (record as any).content || {},
        // Contact Us fields
        email: record.email,
        phone: record.phone,
        address: record.address,
        customerSupportTitle: record.customerSupportTitle,
        customerSupportDescription: record.customerSupportDescription,
        feedbackTitle: record.feedbackTitle,
        feedbackDescription: record.feedbackDescription,
        mediaTitle: record.mediaTitle,
        mediaDescription: record.mediaDescription,
        formTitle: record.formTitle,
        submitButtonText: record.submitButtonText,
        showFirstName: record.showFirstName,
        showLastName: record.showLastName,
        showPhoneNumber: record.showPhoneNumber,
        showEmail: record.showEmail,
        showSchoolName: record.showSchoolName,
        showJobTitle: record.showJobTitle,
        showComments: record.showComments,
        // FAQ fields
        faqSections: record.faqSections || [],
        // Page Template fields
        pageSections: record.pageSections || [],
      };

      setTypeItem(normalizedPage);
      setOpen(true);
    } else {
      console.warn("Page not found for key:", key, "Available pages:", page.map(p => ({ id: p.id, _id: (p as any)._id })));
    }
  };

  const onPaginationActionHandler = (params: TableFilterParams) => {
    setPageFilter(params);
    setFilter(true);
  };

  const onDeleteActionHandler = async (key: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this! This will delete the page permanently.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6b7280",
    });

    if (result.isConfirmed) {
      try {
        await deletePage(key).unwrap();
        Swal.fire({
          title: "Deleted!",
          text: "The page has been deleted successfully.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error) {
        Swal.fire({
          title: "Error!",
          text: "Failed to delete the page. Please try again.",
          icon: "error",
          confirmButtonColor: "#d33",
        });
      }
    }
  };

  const handleResetFilter = () => {
    setFilter(false);
    setFilteredInfo({});
    setSortedInfo({});
    setPageFilter(null);
    clearState();
  };

  return (
    <>
      <PageMeta title="Static Pages Management" />
      <PageBreadcrumb pageTitle="Static Pages Management" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <Flex gap="small" vertical>
          <Flex gap="small" align="center" justify="end">
            <IconButton
              handleButtonAction={() => {
                setTypeItem({
                  title: {},
                  description: {},
                  category: "",
                });
                setOpen(true);
              }}
              title="Add Static Page"
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
            data={page}
            datePagination={pagination}
            onEditActionHandler={onEditActionHandler}
            onDeleteActionHandler={onDeleteActionHandler}
            onPaginationActionHandler={(params: unknown) =>
              onPaginationActionHandler(params as TableFilterParams)
            }
            filteredInfo={filteredInfo}
            sortedInfo={sortedInfo}
            setFilteredInfo={setFilteredInfo}
            setSortedInfo={(value) =>
              setSortedInfo(value ?? ({} as SorterResult<ValuesInterface>))
            }
            currentPage={pageFilter?.page ?? 1}
            pageSize={pageFilter?.pageSize ?? PAGE_LIMIT}
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
            existingPages={page}
          />
        )}
      </div>
    </>
  );
};

export default Index;
