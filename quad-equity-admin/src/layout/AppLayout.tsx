import React, { Activity } from "react";
import { SidebarProvider } from "../context/SidebarContext.tsx";
import { useSidebar } from "../context/useSidebar";
import { Outlet } from "react-router";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import AppSidebar from "./AppSidebar";
import AppFooter from "./AppFooter";

const LayoutContent: React.FC = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  return (
    <div className="min-h-screen flex">
      <div
        className={`transition-all duration-300 ease-in-out hidden lg:block ${
          isExpanded || isHovered ? "w-[290px]" : "w-[90px]"
        }`}
      >
        <AppSidebar />
      </div>
      <Activity mode={isMobileOpen ? "visible" : "hidden"}>
        <div className="fixed inset-0 z-40">
          <AppSidebar />
          <Backdrop />
        </div>
      </Activity>
      <div className="flex-1 min-w-0">
        <AppHeader />
        <div className="p-3 sm:p-4 md:p-6 mx-auto max-w-screen-2xl pb-20 sm:pb-24 md:pb-20">
          <Outlet />
        </div>
        <AppFooter />
      </div>
    </div>
  );
};

const AppLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
};

export default AppLayout;
