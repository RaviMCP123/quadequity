import { baseApi } from "./baseApi";
import * as API from "@utils/apiPath";
import type { ContactRequest } from "interface/contactRequest";

type ContactListApiResponse = {
  statusCode: number;
  message: string;
  data: {
    results: ContactRequest[];
    pagination: {
      total: number;
      page: number;
      currentPage: number;
      limit: number;
    };
  };
};

export const contactRequestApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getContactRequests: builder.query<
      ContactListApiResponse,
      { [key: string]: string | number }
    >({
      query: (params) => ({
        url: API.GET_CONTACT_REQUEST,
        method: "GET",
        params,
      }),
      providesTags: ["ContactRequest"],
    }),
  }),
});

export const { useGetContactRequestsQuery } = contactRequestApi;
