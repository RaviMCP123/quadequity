import { createApi } from "@reduxjs/toolkit/query/react";
import type {
  BaseQueryFn,
  FetchBaseQueryError,
  FetchArgs,
} from "@reduxjs/toolkit/query";
import type { AxiosHeaders, AxiosRequestConfig } from "axios";
import agent from "@utils/agent";

const baseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args) => {
  try {
    let result;
    if (typeof args === "string") {
      result = await agent.get(args);
    } else {
      const { url, method = "GET", body, params, headers } = args;
      const config: AxiosRequestConfig = {
        params,
        headers: headers as AxiosHeaders | undefined,
      };

      // When body is FormData, remove Content-Type so axios sets multipart/form-data with boundary
      if (body instanceof FormData) {
        const existing =
          (config.headers as Record<string, unknown>) || {};
        config.headers = {
          ...existing,
          "Content-Type": undefined,
        } as unknown as AxiosHeaders;
      }

      if (method === "GET") {
        result = await agent.get(url, config);
      } else if (method === "POST") {
        result = await agent.post(url, body, config);
      } else if (method === "PUT") {
        result = await agent.put(url, body, config);
      } else if (method === "PATCH") {
        result = await agent.patch(url, body, config);
      } else if (method === "DELETE") {
        result = await agent.delete(url, { ...config, data: body });
      } else {
        throw new Error(`Unsupported method: ${method}`);
      }
    }

    return { data: result.data };
  } catch (error) {
    const axiosError = error as {
      response?: { status?: number; data?: unknown };
      message?: string;
    };
    return {
      error: {
        status: axiosError.response?.status || 500,
        data: axiosError.response?.data || axiosError.message,
      } as FetchBaseQueryError,
    };
  }
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery,
  tagTypes: [
    "Faq",
    "ContactUs",
    "ContactRequest",
    "Enquiry",
    "Page",
    "Admin",
    "Dashboard",
    "Manager",
    "Invoice",
    "PayLater",
    "Reporting",
    "Monitoring",
    "School",
    "User",
    "CmsCategory",
  ],
  endpoints: () => ({}),
});
