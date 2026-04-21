import { FC } from "react";
import Page from "@pages/Page";
import CmsCategory from "@pages/CmsCategory";
import CmsHome from "@pages/CmsHome";
import UserProfiles from "@pages/UserProfile";
import ContactRequestPage from "@pages/ContactRequest";

interface RouteConfig {
  path: string;
  title: string;
  component: FC;
}

/** Quad Equity CMS manager only — same paths as reference `admin` CMS section. */
const mainRoute: RouteConfig[] = [
  { path: "/", component: CmsHome, title: "CMS" },
  { path: "/dashboard", component: CmsHome, title: "CMS" },
  {
    path: "/cms-management/Page",
    component: Page,
    title: "Pages",
  },
  {
    path: "/cms-management/category",
    component: CmsCategory,
    title: "CMS Categories",
  },
  {
    path: "/cms-management/contact-requests",
    component: ContactRequestPage,
    title: "Contact Requests",
  },
  {
    path: "/profile",
    component: UserProfiles,
    title: "Profile",
  },
];

export default mainRoute;
