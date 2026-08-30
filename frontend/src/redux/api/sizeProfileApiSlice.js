import { apiSlice } from "./apiSlice";

export const sizeProfileApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET size profile
    getSizeProfile: builder.query({
      query: () => ({
        url: "/api/sizeprofile",
        method: "GET",
        credentials: "include", // ✅ ensures cookies (JWT/session) are sent
      }),
    }),
    // SAVE/UPDATE size profile
    saveSizeProfile: builder.mutation({
      query: (profile) => ({
        url: "/api/sizeprofile",
        method: "POST",
        body: profile,
        credentials: "include",
      }),
    }),
  }),
});

export const { useGetSizeProfileQuery, useSaveSizeProfileMutation } = sizeProfileApi;
