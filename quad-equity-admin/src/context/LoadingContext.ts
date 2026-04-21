import { createContext } from "react";

interface LoadingContextProps {
  loading: boolean;
  showLoading: () => void;
  hideLoading: () => void;
}

export const LoadingContext = createContext<LoadingContextProps | undefined>(
  undefined
);
