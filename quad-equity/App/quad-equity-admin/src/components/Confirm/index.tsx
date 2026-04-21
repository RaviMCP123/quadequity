import { useRef, useEffect } from "react";
import { Button } from "react-bootstrap";

interface GreetingProps {
  message: string;
  isOpen: boolean;
  setConfirmOpen: (confirmOpen: boolean) => void;
  handleClickAction: () => void;
}

const Index: React.FC<GreetingProps> = ({
  message,
  setConfirmOpen,
  isOpen,
  handleClickAction,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setConfirmOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, setConfirmOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center overflow-y-auto modal z-99999"
      ref={modalRef}
    >
      <div className="fixed inset-0 h-full w-full bg-gray-400/50 backdrop-blur-[32px]"></div>
      <div className="relative w-full rounded-3xl bg-white  dark:bg-gray-900  max-w-[507px] p-6 lg:p-10">
        <div>
          <div className="text-center">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90 sm:text-title-sm">
              Confirmation Action
            </h4>
            <p className="text-sm leading-6 text-gray-500 dark:text-gray-400">
              {message}
            </p>
            <div className="flex items-center justify-center w-full gap-3 mt-8">
              <Button
                className="inline-flex items-center justify-center gap-2 rounded-lg transition  px-4 py-3 text-sm bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300"
                onClick={() => setConfirmOpen(false)}
              >
                Close
              </Button>
              <Button
                className="inline-flex items-center justify-center gap-2 rounded-lg transition px-4 py-3 text-sm bg-brand-500 text-brand-950 shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300"
                onClick={() => handleClickAction()}
              >
                Yes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
