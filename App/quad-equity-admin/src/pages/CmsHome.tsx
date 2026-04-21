import { Link } from "react-router";
import PageMeta from "@components/common/PageMeta";
import PageBreadcrumb from "@components/common/PageBreadCrumb";

/**
 * Minimal home for Quad Equity CMS-only admin (replaces full Termly dashboard).
 */
const CmsHome: React.FC = () => {
  return (
    <>
      <PageMeta title="Quad Equity CMS" />
      <PageBreadcrumb pageTitle="CMS overview" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
        <Link
          to="/cms-management/category"
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-[#c9a962]/55 dark:border-gray-800 dark:bg-white/[0.03]"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            CMS categories
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Placement, slugs, and category metadata
          </p>
        </Link>
        <Link
          to="/cms-management/Page"
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-[#c9a962]/55 dark:border-gray-800 dark:bg-white/[0.03]"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Static pages
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Templates, content blocks, and SEO
          </p>
        </Link>
      </div>
    </>
  );
};

export default CmsHome;
