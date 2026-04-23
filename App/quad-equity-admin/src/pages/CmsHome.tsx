import { Link } from "react-router";
import PageMeta from "@components/common/PageMeta";
import PageBreadcrumb from "@components/common/PageBreadCrumb";
import { useGetContactRequestsQuery } from "@services/contactRequestApi";

/**
 * Minimal home for Quad Equity CMS-only admin (replaces full Termly dashboard).
 */
const CmsHome: React.FC = () => {
  const { data: contactData } = useGetContactRequestsQuery({
    page: 1,
    limit: 1,
    sort: "createdAt",
    direction: "desc",
  });
  const contactTotal = contactData?.data?.pagination?.total ?? 0;

  return (
    <>
      <PageMeta title="Quad Equity CMS" />
      <PageBreadcrumb pageTitle="CMS overview" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
        <Link
          to="/cms-management/contact-requests"
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-[#c9a962]/55 dark:border-gray-800 dark:bg-white/[0.03]"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Contact requests
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Website contact form submissions
              </p>
            </div>
            <div className="rounded-full bg-[#c9a962]/10 px-3 py-1 text-sm font-semibold text-[#c9a962]">
              {contactTotal}
            </div>
          </div>
        </Link>
      </div>
    </>
  );
};

export default CmsHome;
