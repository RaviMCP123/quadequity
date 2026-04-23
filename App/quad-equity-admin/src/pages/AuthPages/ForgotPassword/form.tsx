import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { AppDispatch } from "store";
import { useForm, SubmitHandler } from "react-hook-form";
import { Form } from "react-bootstrap";
import { ChevronLeftIcon } from "../../../icons";
import Label from "@components/form/Label";
import Message from "@components/form/input/ErrorMessage";
import Button from "@components/ui/button/Button";
import { forgotPassword } from "@reducers/auth/authSlice";
import { FormValues } from "interface/login";

export default function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>();

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  useEffect(() => {
    reset({ username: "" });
  }, [reset]);

  const usernameRegister = register("username", {
    required: "Email is required.",
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: "Please enter a valid email address.",
    },
    maxLength: {
      value: 50,
      message: "Email should not exceed 50 characters.",
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data: FormValues) => {
    setIsLoading(true);
    try {
      await dispatch(forgotPassword(data, navigate));
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
              alt="Quad Equity" 
              className="h-10 sm:h-12 md:h-14 lg:h-16 dark:hidden mx-auto"
              style={{ filter: "brightness(0)" }}
            />
            <img 
              src="/images/logo/logo.png" 
              alt="Quad Equity" 
              className="hidden h-10 sm:h-12 md:h-14 lg:h-16 dark:block mx-auto"
            />
          </Link>
          <div className="text-center">
            <h1 className="mb-1.5 sm:mb-2 md:mb-3 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-brand-950 dark:text-white">
              Forgot Password
            </h1>
            <p className="text-xs sm:text-sm md:text-base lg:text-lg text-brand-800/80 dark:text-brand-200/90 px-2 font-[family-name:var(--font-display)]">
              Enter your email address and we'll send you an OTP to reset your password
            </p>
          </div>
        </div>

        <div className="flex justify-center items-center">
          <div className="w-full max-w-lg p-4 sm:p-5 md:p-6 lg:p-8 bg-white/92 dark:bg-brand-900/90 backdrop-blur-xl rounded-xl sm:rounded-2xl md:rounded-3xl shadow-2xl border border-brand-200/70 dark:border-brand-800/60 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-500 via-brand-600 to-brand-800"></div>
            
            <Form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
              <div className="space-y-4 sm:space-y-5 md:space-y-6">
                <div className="space-y-1.5 sm:space-y-2">
                  <Label className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1.5 sm:gap-2">
                    <span>Email Address</span>
                    <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative group">
                    <div className={`absolute inset-y-0 left-0 flex items-center pl-3 sm:pl-4 pointer-events-none transition-all duration-300 ${
                      focusedField === "email" ? "text-brand-600 scale-110 dark:text-brand-400" : "text-gray-400"
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
                          d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                        />
                      </svg>
                    </div>
                    <Form.Control
                      type="email"
                      placeholder="name@company.com"
                      autoComplete="off"
                      spellCheck={false}
                      onFocus={() => setFocusedField("email")}
                      className={`h-11 sm:h-12 md:h-13 lg:h-14 pl-10 sm:pl-12 w-full rounded-lg sm:rounded-xl border-2 appearance-none px-3 sm:px-4 py-2.5 sm:py-3 md:py-4 text-sm sm:text-base transition-all duration-300 placeholder:text-gray-400 focus:outline-none focus:ring-4 dark:bg-brand-950/50 dark:text-white dark:placeholder:text-brand-400/70 bg-brand-50/80 text-brand-950 border-brand-200 focus:border-brand-500 focus:ring-brand-500/25 focus:bg-white dark:border-brand-700 dark:focus:border-brand-400 dark:focus:bg-brand-950/80 ${
                        errors.username
                          ? "border-red-400 focus:border-red-500 focus:ring-red-500/20 dark:border-red-500"
                          : ""
                      }`}
                      {...usernameRegister}
                      onBlur={(e) => {
                        usernameRegister.onBlur(e);
                        setFocusedField(null);
                      }}
                      isInvalid={!!errors.username}
                    />
                  </div>
                  <Message message={errors?.username?.message ?? ""} />
                </div>

                <div className="pt-1 sm:pt-2">
                  <Button
                    className="w-full h-11 sm:h-12 md:h-13 lg:h-14 text-xs sm:text-sm md:text-base font-bold rounded-lg sm:rounded-xl bg-gradient-to-r from-brand-500 via-brand-600 to-brand-700 hover:from-brand-600 hover:via-brand-700 hover:to-brand-800 !text-brand-950 dark:!text-brand-950 shadow-lg hover:shadow-xl hover:shadow-brand-500/35 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
                      Sending...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Send Password Reset OTP
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
                    className="inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold text-brand-700 hover:text-brand-800 dark:text-brand-400 dark:hover:text-brand-300 transition-all duration-200 hover:underline"
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
