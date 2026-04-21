import React from "react";
import packageJson from "../../package.json";
import { useSidebar } from "../context/useSidebar";

const AppFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const appName = "Quad Equity";
  const version = packageJson.version;
  const { isExpanded, isHovered } = useSidebar();

  return (
    <footer 
      className={`fixed bottom-0 right-0 z-40 py-3 px-3 sm:py-4 sm:px-4 md:px-6 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-all duration-300 ease-in-out ${
        isExpanded || isHovered ? "lg:left-[290px]" : "lg:left-[90px]"
      } left-0`}
    >
      <div className="mx-auto max-w-screen-2xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
          <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 text-center sm:text-left">
            © {currentYear}{" "}
            <span className="text-brand-600 dark:text-brand-400 font-semibold">{appName}</span>. All
            rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
              v{version}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;

