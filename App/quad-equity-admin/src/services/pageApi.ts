import { baseApi } from "./baseApi";
import * as API from "@utils/apiPath";
import type { ApiResponse, PagePayload, ValuesInterface } from "interface/page";

export const pageApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPages: builder.query<ApiResponse, { [key: string]: string | number }>({
      query: (params) => ({
        url: API.GET_PAGE,
        method: "GET",
        params,
      }),
      providesTags: ["Page"],
    }),
    getPageById: builder.query<{ statusCode: number; message: string; data: ValuesInterface }, string>({
      query: (id) => ({
        url: `${API.GET_PAGE}/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Page", id }],
    }),
    createPage: builder.mutation<ApiResponse, PagePayload>({
      query: ({ params }) => {
        // Check if params is FormData (for file uploads)
        if (params instanceof FormData) {
          return {
            url: API.GET_PAGE,
            method: "POST",
            body: params,
          };
        }
        return {
        url: API.GET_PAGE,
        method: "POST",
        body: params,
        };
      },
      invalidatesTags: ["Page"],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          arg.onClose();
        } catch (error) {
          console.error("Failed to create page:", error);
        }
      },
    }),
    updatePage: builder.mutation<ApiResponse, PagePayload>({
      query: ({ params, id }) => {
        // Check if params is FormData (for file uploads)
        const url = id ? `${API.GET_PAGE}/${id}` : API.GET_PAGE;
        if (params instanceof FormData) {
          return {
            url: url,
            method: "PUT",
            body: params,
          };
        }
        return {
          url: url,
        method: "PUT",
        body: params,
        };
      },
      invalidatesTags: ["Page"],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          arg.onClose();
        } catch (error) {
          console.error("Failed to update page:", error);
        }
      },
    }),
    deletePage: builder.mutation<ApiResponse, string>({
      query: (id) => ({
        url: `${API.GET_PAGE}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Page"],
    }),
    updatePageStatus: builder.mutation<
      ApiResponse,
      { id: string; status: boolean }
    >({
      query: ({ id, status }) => ({
        url: `${API.GET_PAGE}/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Page"],
    }),
  }),
});

export const {
  useGetPagesQuery,
  useGetPageByIdQuery,
  useCreatePageMutation,
  useUpdatePageMutation,
  useDeletePageMutation,
  useUpdatePageStatusMutation,
} = pageApi;

