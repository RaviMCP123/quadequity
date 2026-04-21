import { baseApi } from "./baseApi";
import * as API from "@utils/apiPath";
import type {
  CmsCategoryApiResponse,
  CmsCategoryListApiResponse,
  CmsCategoryPayload,
  PlacementSortOrdersResponse,
} from "interface/cmsCategory";

export const cmsCategoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCmsCategories: builder.query<
      CmsCategoryApiResponse,
      { [key: string]: string | number }
    >({
      query: (params) => ({
        url: API.GET_CMS_CATEGORY,
        method: "GET",
        params,
      }),
      providesTags: ["CmsCategory"],
    }),
    getCmsCategoryList: builder.query<CmsCategoryListApiResponse, void>({
      query: () => ({
        url: API.GET_CMS_CATEGORY_LIST,
        method: "GET",
      }),
      providesTags: ["CmsCategory"],
    }),
    createCmsCategory: builder.mutation<
      CmsCategoryApiResponse,
      CmsCategoryPayload
    >({
      query: ({ params }) => ({
        url: API.GET_CMS_CATEGORY,
        method: "POST",
        body: params,
      }),
      invalidatesTags: ["CmsCategory"],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          arg.onClose();
        } catch (error) {
          console.error("Failed to create CMS Category:", error);
        }
      },
    }),
    updateCmsCategory: builder.mutation<
      CmsCategoryApiResponse,
      CmsCategoryPayload & { id: string }
    >({
      query: ({ params, id }) => ({
        url: `${API.GET_CMS_CATEGORY}/${id}`,
        method: "PUT",
        body: params,
      }),
      invalidatesTags: ["CmsCategory"],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          arg.onClose();
        } catch (error) {
          console.error("Failed to update CMS Category:", error);
        }
      },
    }),
    deleteCmsCategory: builder.mutation<CmsCategoryApiResponse, string>({
      query: (id) => ({
        url: `${API.GET_CMS_CATEGORY}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["CmsCategory"],
    }),
    updateCmsCategoryStatus: builder.mutation<
      CmsCategoryApiResponse,
      { id: string; status: boolean }
    >({
      query: ({ id, status }) => ({
        url: `${API.GET_CMS_CATEGORY}/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["CmsCategory"],
    }),
    getPlacementSortOrders: builder.query<PlacementSortOrdersResponse, void>({
      query: () => ({
        url: API.GET_CMS_CATEGORY_PLACEMENT_SORT_ORDERS,
        method: "GET",
      }),
      providesTags: ["CmsCategory"],
    }),
  }),
});

export const {
  useGetCmsCategoriesQuery,
  useGetCmsCategoryListQuery,
  useCreateCmsCategoryMutation,
  useUpdateCmsCategoryMutation,
  useDeleteCmsCategoryMutation,
  useUpdateCmsCategoryStatusMutation,
  useGetPlacementSortOrdersQuery,
} = cmsCategoryApi;
