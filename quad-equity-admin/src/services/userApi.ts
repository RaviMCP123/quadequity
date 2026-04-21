import { setUserProfile } from "@reducers/user/userSlice";
import type {
  ApiResponse,
  UpdateProfileImagePayload,
  UserInterface,
  UserPassword,
} from "interface/user";
import * as API from "@utils/apiPath";
import { baseApi } from "./baseApi";

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query<ApiResponse, void>({
      query: () => ({
        url: API.GET_PROFILE,
        method: "GET",
      }),
      providesTags: ["User"],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setUserProfile(data.data));
        } catch (error) {
          console.error("Failed to get profile:", error);
        }
      },
    }),
    updateProfile: builder.mutation<ApiResponse, UserInterface>({
      query: ({ params }) => ({
        url: API.UPDATE_PROFILE,
        method: "POST",
        body: params,
      }),
      invalidatesTags: ["User"],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            userApi.util.updateQueryData('getProfile', undefined, (draft) => {
              if (draft && data?.data) {
                draft.data = data.data;
              }
            })
          );
          if (data?.data) {
            dispatch(setUserProfile(data.data));
          }
        } catch (error) {
          console.error("Failed to update profile:", error);
        }
      },
    }),
    updateProfilePassword: builder.mutation<ApiResponse, UserPassword>({
      query: ({ params }) => ({
        url: API.UPDATE_PASSWORD,
        method: "POST",
        body: params,
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(userApi.endpoints.getProfile.initiate());
        } catch (error) {
          console.error("Failed to update password:", error);
        }
      },
    }),
    updateProfileImage: builder.mutation<ApiResponse, UpdateProfileImagePayload>({
      query: ({ formData }) => ({
        url: API.UPDATE_PROFILE_IMAGE,
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }),
      invalidatesTags: ["User"],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(userApi.endpoints.getProfile.initiate());
        } catch (error) {
          console.error("Failed to update profile image:", error);
        }
      },
    }),
  }),
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUpdateProfilePasswordMutation,
  useUpdateProfileImageMutation,
} = userApi;

