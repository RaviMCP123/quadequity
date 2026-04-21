import { Link } from "react-router";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface BreadcrumbProps {
  pageTitle: string;
  subTitle?: string;
  subTitleUrl?: string;
  subPageTitle?: string;
}

const PageBreadcrumb: React.FC<BreadcrumbProps> = ({
  pageTitle,
  subTitle,
  subTitleUrl,
  subPageTitle,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    if (subTitleUrl) {
      navigate(`/${subTitleUrl}`);
      return;
    }
    navigate("/");
  };
  return (
    <div className="sticky top-[72px] lg:top-[74px] z-30 -mx-4 px-4 py-3 sm:py-4 md:-mx-6 md:px-6 bg-brand-50 dark:bg-brand-950 border-b border-brand-100 dark:border-brand-900 transition-all duration-200 mb-6 flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-between gap-2 sm:gap-3">
        <h2
          className="text-lg sm:text-xl font-normal text-brand-900 dark:text-brand-100 tracking-tight font-[family-name:var(--font-display)]"
          x-text="pageName"
        >
          {subPageTitle ?? pageTitle}
        </h2>
        <div className="flex items-center gap-2">
          <nav>
          {!subTitle && (
            <ol className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
              <li>
                <Link
                  className="inline-flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm text-gray-500 dark:text-gray-400"
                  to="/"
                >
                  {t("common.home")}
                  <svg
                    className="stroke-current w-3 h-3 sm:w-4 sm:h-4"
                    viewBox="0 0 17 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M6.0765 12.667L10.2432 8.50033L6.0765 4.33366"
                      stroke=""
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
              </li>
              <li className="text-xs sm:text-sm text-gray-800 dark:text-white/90">
                {pageTitle}
              </li>
            </ol>
          )}
          {subTitle && (
            <ol className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
              <li>
                <Link
                  className="inline-flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm text-gray-500 dark:text-gray-400"
                  to="/"
                >
                  {t("common.home")}
                  <svg
                    className="stroke-current w-3 h-3 sm:w-4 sm:h-4"
                    viewBox="0 0 17 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M6.0765 12.667L10.2432 8.50033L6.0765 4.33366"
                      stroke=""
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
              </li>
              <li>
                <Link
                  className="inline-flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm text-gray-500 dark:text-gray-400"
                  to={`/${subTitleUrl}`}
                >
                  {subTitle}
                  <svg
                    className="stroke-current w-3 h-3 sm:w-4 sm:h-4"
                    viewBox="0 0 17 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M6.0765 12.667L10.2432 8.50033L6.0765 4.33366"
                      stroke=""
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
              </li>
              <li className="text-xs sm:text-sm text-gray-800 dark:text-white/90">
                {pageTitle}
              </li>
            </ol>
          )}
          </nav>
          {subTitle && (
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1 rounded-md bg-gradient-to-r from-[#0056d2] via-[#0056d2] to-[#0056d2] px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
              aria-label="Go back"
            >
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10.5 3.5L6 8l4.5 4.5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Back
            </button>
          )}
        </div>
    </div>
  );
};

export default PageBreadcrumb;
