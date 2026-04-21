import { Activity } from "react";
import { useSidebar } from "../context/useSidebar";

const Backdrop: React.FC = () => {
  const { isMobileOpen, toggleMobileSidebar } = useSidebar();

  return (
    <Activity mode={isMobileOpen ? "visible" : "hidden"}>
    <div
      className="fixed inset-0 z-40 bg-gray-900/50 lg:hidden"
      onClick={toggleMobileSidebar}
    />
    </Activity>
  );
};

export default Backdrop;
