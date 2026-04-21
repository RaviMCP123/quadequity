import { Helmet, HelmetProvider } from "@dr.pogodin/react-helmet";

const PageMeta = ({ title }: { title: string }) => {
  const appName = import.meta.env.VITE_APP_NAME || "";
  const pageTitle = appName ? `${appName} | ${title}` : title;
  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" />
    </Helmet>
  );
};

export const AppWrapper = ({ children }: { children: React.ReactNode }) => (
  <HelmetProvider>{children}</HelmetProvider>
);

export default PageMeta;
