import React, { useState, useEffect } from "react";

export const ScrollToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    const scrollTop =
      window.scrollY ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;
    if (scrollTop > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
    if (document.documentElement.scrollTop > 0) {
      document.documentElement.scrollTop = 0;
    }
    if (document.body.scrollTop > 0) {
      document.body.scrollTop = 0;
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility, { passive: true });
    toggleVisibility();
    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  return (
    <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-[9999]">
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0056d2] text-white shadow-lg transition-all duration-300 hover:bg-[#0056d2]/90 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#0056d2] focus:ring-offset-2"
          aria-label="Scroll to top"
          type="button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 15l7-7 7 7"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default ScrollToTop;
