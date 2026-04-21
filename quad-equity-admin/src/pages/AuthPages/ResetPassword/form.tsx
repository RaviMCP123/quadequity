import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "store";
import { useForm, SubmitHandler } from "react-hook-form";
import { Form } from "react-bootstrap";
import { EyeCloseIcon, EyeIcon, ChevronLeftIcon } from "../../../icons";
import Label from "@components/form/Label";
import Message from "@components/form/input/ErrorMessage";
import Button from "@components/ui/button/Button";
import { updatePassword } from "@reducers/auth/authSlice";
import { FormValues } from "interface/login";

export default function ResetPasswordForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { requestBody } = useSelector((state: RootState) => state.authReducer);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>();

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const password = watch("password");

  const validatePassword = (value: string) => {
    const passwordCriteria =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return (
      passwordCriteria.test(value) ||
      "Password must be at least 8 characters long, contain uppercase and lowercase letters, a number, and a special character."
    );
  };

  const passwordRegister = register("password", {
    required: "Password is required.",
    validate: validatePassword,
  });

  const confirmPasswordRegister = register("confirmPassword", {
    required: "Confirm Password is required.",
    validate: (value) =>
      value === watch("password") ||
      "Passwords do not match.",
  });

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: "", color: "" };
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    if (strength <= 2) return { strength, label: "Weak", color: "bg-red-500" };
    if (strength <= 3) return { strength, label: "Medium", color: "bg-yellow-500" };
    return { strength, label: "Strong", color: "bg-green-500" };
  };

  const passwordStrength = password ? getPasswordStrength(password) : null;

  const onSubmit: SubmitHandler<FormValues> = async (data: FormValues) => {
    setIsLoading(true);
    data.username = requestBody?.username || "";
    try {
      await dispatch(updatePassword(data, navigate));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full">
      <div className="flex flex-col justify-center flex-1 w-full max-w-6xl mx-auto">
        <div className="mb-4 sm:mb-6 md:mb-8 text-center">
          <Link to="/" className="inline-block mb-3 sm:mb-4 md:mb-6 transition-transform hover:scale-105">
            <img 
              src="/images/logo/logo.png" 
              alt="Termly Logo" 
              className="h-10 sm:h-12 md:h-14 lg:h-16 dark:hidden mx-auto"
            />
            <img 
              src="/images/logo/logo.png" 
              alt="Termly Logo" 
              className="hidden h-10 sm:h-12 md:h-14 lg:h-16 dark:block mx-auto"
            />
          </Link>
          <div className="text-center">
            <h1 className="mb-1.5 sm:mb-2 md:mb-3 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Reset Password
            </h1>
            <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-600 dark:text-gray-400 px-2">
              Set a new password for your account
            </p>
          </div>
        </div>

        <div className="flex justify-center items-center">
          <div className="w-full max-w-lg p-4 sm:p-5 md:p-6 lg:p-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl sm:rounded-2xl md:rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0056d2] via-[#0056d2] to-[#0056d2]"></div>
            
            <Form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-4 sm:space-y-5 md:space-y-6">
                <div className="space-y-1.5 sm:space-y-2">
                  <Label className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1.5 sm:gap-2">
                    <span>New Password</span>
                    <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative group">
                    <div className={`absolute inset-y-0 left-0 flex items-center pl-3 sm:pl-4 pointer-events-none transition-all duration-300 ${
                      focusedField === "password" ? "text-[#0056d2] scale-110" : "text-gray-400"
                    }`}>
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                    <Form.Control
                      placeholder="Enter your new password"
                      type={showPassword ? "text" : "password"}
                      onFocus={() => setFocusedField("password")}
                      className={`h-11 sm:h-12 md:h-13 lg:h-14 pl-10 sm:pl-12 pr-11 sm:pr-14 w-full rounded-lg sm:rounded-xl border-2 appearance-none px-3 sm:px-4 py-2.5 sm:py-3 md:py-4 text-sm sm:text-base transition-all duration-300 placeholder:text-gray-400 focus:outline-none focus:ring-4 dark:bg-gray-900/50 dark:text-white dark:placeholder:text-gray-500 bg-gray-50/50 text-gray-900 border-gray-300 focus:border-[#0056d2] focus:ring-[#0056d2]/20 focus:bg-white dark:border-gray-600 dark:focus:border-[#0056d2] dark:focus:bg-gray-900/80 ${
                        errors.password
                          ? "border-red-400 focus:border-red-500 focus:ring-red-500/20 dark:border-red-500"
                          : ""
                      }`}
                      {...passwordRegister}
                      onBlur={(e) => {
                        passwordRegister.onBlur(e);
                        setFocusedField(null);
                      }}
                      isInvalid={!!errors.password}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-3 sm:right-4 md:right-5 top-1/2 text-gray-400 hover:text-[#0056d2] dark:hover:text-[#569ff7] transition-all duration-200 p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-current w-4 h-4 sm:w-5 sm:h-5" />
                      ) : (
                        <EyeCloseIcon className="fill-current w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                    </button>
                  </div>
                  {password && passwordStrength && !errors.password && (
                    <div className="space-y-1 sm:space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">Password strength:</span>
                        <span className={`font-semibold ${
                          passwordStrength.label === "Weak" ? "text-red-500" :
                          passwordStrength.label === "Medium" ? "text-yellow-500" : "text-green-500"
                        }`}>
                          {passwordStrength.label}
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${passwordStrength.color} transition-all duration-300`}
                          style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  <Message message={errors?.password?.message ?? ""} />
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <Label className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1.5 sm:gap-2">
                    <span>Confirm Password</span>
                    <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative group">
                    <div className={`absolute inset-y-0 left-0 flex items-center pl-3 sm:pl-4 pointer-events-none transition-all duration-300 ${
                      focusedField === "confirmPassword" ? "text-[#0056d2] scale-110" : "text-gray-400"
                    }`}>
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                    <Form.Control
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your new password"
                      onFocus={() => setFocusedField("confirmPassword")}
                      className={`h-11 sm:h-12 md:h-13 lg:h-14 pl-10 sm:pl-12 pr-11 sm:pr-14 w-full rounded-lg sm:rounded-xl border-2 appearance-none px-3 sm:px-4 py-2.5 sm:py-3 md:py-4 text-sm sm:text-base transition-all duration-300 placeholder:text-gray-400 focus:outline-none focus:ring-4 dark:bg-gray-900/50 dark:text-white dark:placeholder:text-gray-500 bg-gray-50/50 text-gray-900 border-gray-300 focus:border-[#0056d2] focus:ring-[#0056d2]/20 focus:bg-white dark:border-gray-600 dark:focus:border-[#0056d2] dark:focus:bg-gray-900/80 ${
                        errors.confirmPassword
                          ? "border-red-400 focus:border-red-500 focus:ring-red-500/20 dark:border-red-500"
                          : ""
                      }`}
                      {...confirmPasswordRegister}
                      onBlur={(e) => {
                        confirmPasswordRegister.onBlur(e);
                        setFocusedField(null);
                      }}
                      isInvalid={!!errors.confirmPassword}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-3 sm:right-4 md:right-5 top-1/2 text-gray-400 hover:text-[#0056d2] dark:hover:text-[#569ff7] transition-all duration-200 p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? (
                        <EyeIcon className="fill-current w-4 h-4 sm:w-5 sm:h-5" />
                      ) : (
                        <EyeCloseIcon className="fill-current w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                    </button>
                  </div>
                  <Message message={errors?.confirmPassword?.message ?? ""} />
                </div>

                <div className="pt-1 sm:pt-2">
                  <Button
                    className="w-full h-11 sm:h-12 md:h-13 lg:h-14 text-xs sm:text-sm md:text-base font-bold rounded-lg sm:rounded-xl bg-gradient-to-r from-[#0056d2] via-[#0056d2] to-[#0056d2] hover:from-[#0056D2] hover:via-[#0056d2] hover:to-[#0056D2] !text-white dark:!text-white shadow-lg hover:shadow-xl hover:shadow-[#0056d2]/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    size="md"
                    disabled={isLoading}
                  >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-3">
                      <svg
                        className="w-5 h-5 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Updating...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Update Password
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </span>
                  )}
                  </Button>
                </div>

                <div className="pt-3 sm:pt-4 text-center">
                  <Link
                    to="/signin"
                    className="inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold text-[#0056d2] hover:text-[#0056D2] dark:text-[#569ff7] dark:hover:text-[#e63946] transition-all duration-200 hover:underline"
                  >
                    <ChevronLeftIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    Back to Login
                  </Link>
                </div>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
