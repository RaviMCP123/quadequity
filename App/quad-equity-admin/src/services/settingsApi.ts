import * as API from "@utils/apiPath";
import { baseApi } from "./baseApi";
import type {
  EmailCredentialsResponse,
  TestEmailInput,
  UpdateEmailCredentialsInput,
} from "interface/settings";

export const settingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEmailCredentials: builder.query<EmailCredentialsResponse, void>({
      query: () => ({
        url: API.GET_EMAIL_CREDENTIALS,
        method: "GET",
      }),
      providesTags: ["Settings"],
    }),
    updateEmailCredentials: builder.mutation<
      EmailCredentialsResponse,
      UpdateEmailCredentialsInput
    >({
      query: (params) => ({
        url: API.UPDATE_EMAIL_CREDENTIALS,
        method: "PUT",
        body: params,
      }),
      invalidatesTags: ["Settings"],
    }),
    testEmailCredentials: builder.mutation<
      { statusCode: number; message: string; data: unknown },
      TestEmailInput
    >({
      query: (params) => ({
        url: API.TEST_EMAIL_CREDENTIALS,
        method: "POST",
        body: params,
      }),
    }),
  }),
});

export const {
  useGetEmailCredentialsQuery,
  useUpdateEmailCredentialsMutation,
  useTestEmailCredentialsMutation,
} = settingsApi;
