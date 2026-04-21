export interface ActiveUsersReport {
  date: string;
  count: number;
}

export interface NewRegistrationsReport {
  date: string;
  count: number;
}

export interface TopUserByWatchTime {
  userId: string;
  firstName: string;
  lastName?: string;
  email?: string;
  mobileNumber?: string;
  totalWatchTime: number; // in minutes
  totalVideosWatched: number;
}

export interface TopWatchedVideo {
  videoId: string;
  title: string;
  category?: string;
  views: number;
  likes: number;
  watchTime: number; // in minutes
}

export interface MostLikedStory {
  storyId: string;
  title: string;
  author?: string;
  likes: number;
  views: number;
  shares: number;
}

export interface PopularAudio {
  audioId: string;
  title: string;
  category?: string;
  plays: number;
  likes: number;
  duration: number; // in minutes
}

export interface RevenueByPlan {
  planName: string;
  planId: string;
  totalRevenue: number;
  subscriberCount: number;
  averageRevenue: number;
}

export interface RevenueByMonth {
  month: string;
  revenue: number;
  subscriptionRevenue: number;
  adRevenue: number;
}

export interface RevenueByCountry {
  country: string;
  revenue: number;
  subscriberCount: number;
  currency?: string;
}

export interface AdRevenue {
  date: string;
  revenue: number;
  impressions: number;
  clicks: number;
  ctr: number; // click-through rate
}

export interface CoinsEarnedThroughAds {
  date: string;
  coinsEarned: number;
  adViews: number;
  usersEarned: number;
}

export interface EngagementReport {
  date: string;
  likes: number;
  comments: number;
  shares: number;
  totalEngagement: number;
}

export interface UserReportsData {
  activeUsers: ActiveUsersReport[];
  newRegistrations: NewRegistrationsReport[];
  topUsersByWatchTime: TopUserByWatchTime[];
}

export interface ContentReportsData {
  topWatchedVideos: TopWatchedVideo[];
  mostLikedStories: MostLikedStory[];
  popularAudio: PopularAudio[];
}

export interface RevenueReportsData {
  revenueByPlan: RevenueByPlan[];
  revenueByMonth: RevenueByMonth[];
  revenueByCountry: RevenueByCountry[];
}

export interface AdReportsData {
  adRevenue: AdRevenue[];
  coinsEarnedThroughAds: CoinsEarnedThroughAds[];
}

export interface EngagementReportsData {
  engagement: EngagementReport[];
}

export interface ReportsParams {
  startDate?: string;
  endDate?: string;
  limit?: number;
  page?: number;
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

