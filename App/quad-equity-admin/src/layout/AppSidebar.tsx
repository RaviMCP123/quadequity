import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { Tooltip } from "antd";
import { useTranslation } from "react-i18next";
import { useSidebar } from "../context/useSidebar";

type NavItem = {
  name: string;
  icon: string;
  path?: string;
};

/** Quad Equity CMS-only sidebar — same visual pattern as reference admin. */
const getNavItems = (t: (key: string) => string): NavItem[] => [
  { icon: "home.png", name: t("sidebar.dashboard"), path: "/dashboard" },
  {
    icon: "content-management-system.png",
    name: t("sidebar.cmsCategories"),
    path: "/cms-management/category",
  },
  { icon: "page.png", name: t("sidebar.staticPages"), path: "/cms-management/Page" },
  {
    icon: "enquire.png",
    name: t("sidebar.contactRequests"),
    path: "/cms-management/contact-requests",
  },
];

const AppSidebar: React.FC = () => {
  const { t } = useTranslation();
  const { isExpanded, isMobileOpen, isHovered } = useSidebar();
  const location = useLocation();
  const pathArray = location.pathname.split("/").filter(Boolean);
  const pathString = `/${pathArray[0]}`;
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isActive = useCallback(
    (path: string) => location.pathname === path || pathString === path,
    [location.pathname, pathString]
  );
  const isCollapsed = !isExpanded && !isHovered && !isMobileOpen;
  const navItems = getNavItems(t);

  const renderMenuItems = (items: NavItem[]) => (
    <ul className="flex flex-col gap-4">
      {items.map((nav) => {
        if (!nav.path) return null;

        const linkElement = (
          <Link
            to={nav.path}
            className={`menu-item group ${
              isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
            }`}
          >
            <span
              className={`menu-item-icon-size ${
                isActive(nav.path)
                  ? "menu-item-icon-active"
                  : "menu-item-icon-inactive"
              }`}
            >
              <img
                src={`/images/icons/${
                  isActive(nav.path) ? "active-" : "inactive-"
                }${nav.icon}`}
                alt={nav.name}
                style={
                  !isActive(nav.path) && nav.icon === "content-management-system.png"
                    ? { filter: "brightness(0) invert(1)" }
                    : undefined
                }
              />
            </span>

            {(isExpanded || isHovered || isMobileOpen) && (
              <span
                className={`menu-item-text ${
                  isActive(nav.path)
                    ? "text-[#c9a962] dark:text-[#f2efe8]"
                    : "text-white"
                }`}
              >
                {nav.name}
              </span>
            )}
          </Link>
        );

        return (
          <li key={nav.name}>
            {isCollapsed ? (
              <Tooltip placement="right" title={nav.name} color="#0e1a2b">
                {linkElement}
              </Tooltip>
            ) : (
              linkElement
            )}
          </li>
        );
      })}
    </ul>
  );

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      setIsScrolling(true);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 1000);
    };

    scrollContainer.addEventListener("scroll", handleScroll);
    return () => {
      scrollContainer.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-[#0e1a2b] dark:bg-[#080f18] dark:border-gray-800 
      text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
    >
      <div
        className={`pt-2 pb-4 sm:pb-6 lg:pb-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/" className="inline-flex items-center p-1">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                className="h-8 sm:h-10 md:h-12 dark:hidden"
                src="/images/logo/logo.png"
                alt="Logo"
              />
              <img
                className="hidden h-8 sm:h-10 md:h-12 dark:block"
                src="/images/logo/logo.png"
                alt="Logo"
              />
            </>
          ) : (
            <img
              src="/images/icons/quad_logo.png"
              alt="Collapsed Logo"
              className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
            />
          )}
        </Link>
      </div>

      <div
        ref={scrollContainerRef}
        className={`flex flex-col overflow-y-auto duration-300 ease-linear sidebar-scrollbar ${
          isScrolling ? "scrolling" : ""
        }`}
      >
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>{renderMenuItems(navItems)}</div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
