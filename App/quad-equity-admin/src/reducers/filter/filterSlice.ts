import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TableFilterParams } from "interface/page";
import { TableFilterParams as FaqTableFilterParams } from "interface/faq";
import { TableFilterParams as LanguageTableFilterParams } from "interface/language";
import { TableFilterParams as CategoryTableFilterParams } from "interface/category";
import { TableFilterParams as BannerTableFilterParams } from "interface/banner";
import { TableFilterParams as MoodTableFilterParams } from "interface/mood";
import { TableFilterParams as AdminTableFilterParams } from "interface/admin";
import { TableFilterParams as CustomerTableFilterParams } from "interface/customer";
import { TableFilterParams as FeedbackTableFilterParams } from "interface/feedback";
import { TableFilterParams as VideoTableFilterParams } from "interface/video";
import { TableFilterParams as AudioTableFilterParams } from "interface/audio";
import { TableFilterParams as UploadFileTableFilterParams } from "interface/uploadFile";
import { PAGE_LIMIT } from "@utils/constant/common";

interface FiltersState {
  filters: {
    pageFilter: TableFilterParams;
    faqFilter: FaqTableFilterParams;
    languageFilter: LanguageTableFilterParams;
    categoryFilter: CategoryTableFilterParams;
    moodFilter: MoodTableFilterParams;
    adminFilter: AdminTableFilterParams;
    customerFilter: CustomerTableFilterParams;
    feedbackFilter: FeedbackTableFilterParams;
    videoFilter: VideoTableFilterParams;
    audioFilter: AudioTableFilterParams;
    uploadFileFilter: UploadFileTableFilterParams;
    bannerFilter: BannerTableFilterParams;
  };
}

interface FiltersPayloadAction {
  pageFilter?: TableFilterParams;
  faqFilter?: FaqTableFilterParams;
  languageFilter?: LanguageTableFilterParams;
  categoryFilter?: CategoryTableFilterParams;
  moodFilter?: MoodTableFilterParams;
    adminFilter?: AdminTableFilterParams;
    customerFilter?: CustomerTableFilterParams;
    feedbackFilter?: FeedbackTableFilterParams;
    videoFilter?: VideoTableFilterParams;
  audioFilter?: AudioTableFilterParams;
  uploadFileFilter?: UploadFileTableFilterParams;
  bannerFilter?: BannerTableFilterParams;
}

const initialState: FiltersState = {
  filters: {
    pageFilter: {
      updatedAt: "",
      title: "",
      pageSize: PAGE_LIMIT,
      page: 1,
      status: [],
    },
    faqFilter: {
      updatedAt: "",
      title: "",
      pageSize: PAGE_LIMIT,
      page: 1,
      status: [],
    },
    languageFilter: {
      updatedAt: "",
      title: "",
      pageSize: PAGE_LIMIT,
      page: 1,
      status: [],
    },
    categoryFilter: {
      updatedAt: "",
      title: "",
      pageSize: PAGE_LIMIT,
      page: 1,
      status: [],
      type: [],
      is_kids: [],
    },
    moodFilter: {
      updatedAt: "",
      title: "",
      pageSize: PAGE_LIMIT,
      page: 1,
      status: [],
    },
    adminFilter: {},
    customerFilter: {},
    feedbackFilter: {},
    videoFilter: {
      updatedAt: "",
      title: "",
      pageSize: PAGE_LIMIT,
      page: 1,
      status: [],
      language: [],
      category: [],
      show_in: [],
      add_enabled: [],
      access_type: [],
      video_type: [],
      type: []
    },
    audioFilter: {
      updatedAt: "",
      series_title: "",
      pageSize: PAGE_LIMIT,
      page: 1,
      status: [],
      language: [],
      category: [],
      add_enabled: [],
      access_type: [],
      content_type: [],
    },
    uploadFileFilter: {
      updatedAt: "",
      pageSize: PAGE_LIMIT,
      page: 1,
      status: [],
      video_id: "",
      type: "",
      content_type: [],
    },
    bannerFilter: {
      updatedAt: "",
      title: "",
      pageSize: PAGE_LIMIT,
      page: 1,
      status: [],
      type: [],
    },
  },
};

const filterSlice = createSlice({
  name: "saveFilter",
  initialState,
  reducers: {
    saveFilter: (state, action: PayloadAction<FiltersPayloadAction>) => {
      if (action.payload.pageFilter) {
        state.filters.pageFilter = action.payload.pageFilter;
      }
      if (action.payload.faqFilter) {
        state.filters.faqFilter = action.payload.faqFilter;
      }
      if (action.payload.videoFilter) {
        state.filters.videoFilter = action.payload.videoFilter;
      }
      if (action.payload.audioFilter) {
        state.filters.audioFilter = action.payload.audioFilter;
      }
      if (action.payload.categoryFilter) {
        state.filters.categoryFilter = action.payload.categoryFilter;
      }
      if (action.payload.moodFilter) {
        state.filters.moodFilter = action.payload.moodFilter;
      }
      if (action.payload.languageFilter) {
        state.filters.languageFilter = action.payload.languageFilter;
      }
      if (action.payload.uploadFileFilter) {
        state.filters.uploadFileFilter = action.payload.uploadFileFilter;
      }
      if (action.payload.bannerFilter) {
        state.filters.bannerFilter = action.payload.bannerFilter;
      }
      if (action.payload.customerFilter) {
        state.filters.customerFilter = action.payload.customerFilter;
      }
      if (action.payload.adminFilter) {
        state.filters.adminFilter = action.payload.adminFilter;
      }
      if (action.payload.feedbackFilter) {
        state.filters.feedbackFilter = action.payload.feedbackFilter;
      }
    },
  },
});

export const { saveFilter } = filterSlice.actions;
export default filterSlice.reducer;
