import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  size?: "sm" | "md";
  variant?: "primary" | "outline";
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  size = "md",
  variant = "primary",
  startIcon,
  endIcon,
  onClick,
  className = "",
  disabled = false,
}) => {
  const sizeClasses = {
    sm: "px-4 py-3 text-sm",
    md: "px-5 py-3.5 text-sm",
  };
  const variantClasses = {
    primary:
      "bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300 dark:bg-white dark:text-black dark:hover:bg-brand-600 dark:hover:text-white",
    outline:
      "bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 " +
      "dark:bg-white dark:text-black dark:ring-gray-300 dark:hover:bg-gray-100",
  };

  const isPrimary = variant === "primary";
  
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg transition relative overflow-hidden group transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none ${className} ${
        sizeClasses[size]
      } ${variantClasses[variant]} ${
        disabled ? 'cursor-not-allowed opacity-50' : ''
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      {isPrimary && (
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
      )}
      {startIcon && <span className={`flex items-center ${isPrimary ? 'relative z-10' : ''}`}>{startIcon}</span>}
      <span className={isPrimary ? 'relative z-10' : ''}>{children}</span>
      {endIcon && <span className={`flex items-center ${isPrimary ? 'relative z-10' : ''}`}>{endIcon}</span>}
    </button>
  );
};

export default Button;
