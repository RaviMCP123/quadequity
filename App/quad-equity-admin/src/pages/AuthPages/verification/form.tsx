import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "store";
import { useForm, SubmitHandler } from "react-hook-form";
import { Form } from "react-bootstrap";
import { ChevronLeftIcon } from "../../../icons";
import Button from "@components/ui/button/Button";
import OtpInput from "@components/form/OtpInput";
import { verifyOtp, resendOtp } from "@reducers/auth/authSlice";
import { FormValues } from "interface/login";

export default function VerificationForm() {
  const [otp, setOtp] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(300); // 5 minutes in seconds
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const { handleSubmit } = useForm<FormValues>();
  const { requestBody } = useSelector((state: RootState) => state.authReducer);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsExpired(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleResendOtp = () => {
    dispatch(resendOtp(requestBody));
    setTimeLeft(300);
    setIsExpired(false);
    setOtp("");
  };

  const onSubmit: SubmitHandler<FormValues> = async () => {
    setIsLoading(true);
    const request = { otp: otp, username: requestBody?.username };
    try {
      await dispatch(verifyOtp(request, navigate));
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = (enteredOtp: string) => {
    setOtp(enteredOtp);
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
              Verify Your Account
            </h1>
            <p className="text-xs sm:text-sm md:text-base lg:text-lg text-brand-800/80 dark:text-brand-200/90 px-2 font-[family-name:var(--font-display)]">
              Enter the 6-digit code sent to your registered email
            </p>
          </div>
        </div>

        <div className="flex justify-center items-center">
          <div className="w-full max-w-lg p-4 sm:p-5 md:p-6 lg:p-8 bg-white/92 dark:bg-brand-900/90 backdrop-blur-xl rounded-xl sm:rounded-2xl md:rounded-3xl shadow-2xl border border-brand-200/70 dark:border-brand-800/60 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-500 via-brand-600 to-brand-800"></div>
            
            <Form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-4 sm:space-y-5 md:space-y-6">
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="block text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2">
                    <span>Verification Code</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="flex justify-center px-2">
                    <OtpInput length={6} onComplete={handleComplete} onChange={setOtp} />
                  </div>
                  {!isExpired && timeLeft > 0 && (
                    <div className="flex items-center justify-center gap-2 pt-2">
                      <svg
                        className="w-4 h-4 text-gray-500 dark:text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        Code expires in: <span className="font-semibold text-brand-700 dark:text-brand-400">{formatTime(timeLeft)}</span>
                      </span>
                    </div>
                  )}
                  {isExpired && (
                    <div className="flex items-center justify-center gap-2 pt-2">
                      <svg
                        className="w-4 h-4 text-red-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-xs sm:text-sm text-red-500 font-medium">
                        OTP has expired. Please request a new code.
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-center pt-1 sm:pt-2 px-2">
                  <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center">
                    Didn't receive a code?{" "}
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={!isExpired && timeLeft > 0}
                      className={`font-semibold transition-all duration-200 hover:underline ${
                        !isExpired && timeLeft > 0
                          ? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                          : "text-brand-700 hover:text-brand-800 dark:text-brand-400 dark:hover:text-brand-300"
                      }`}
                    >
                      Resend
                    </button>
                  </span>
                </div>

                <div className="pt-1 sm:pt-2">
                  <Button
                    className="w-full h-11 sm:h-12 md:h-13 lg:h-14 text-xs sm:text-sm md:text-base font-bold rounded-lg sm:rounded-xl bg-gradient-to-r from-brand-500 via-brand-600 to-brand-700 hover:from-brand-600 hover:via-brand-700 hover:to-brand-800 !text-brand-950 dark:!text-brand-950 shadow-lg hover:shadow-xl hover:shadow-brand-500/35 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    size="md"
                    disabled={isLoading || otp.length !== 6 || isExpired}
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
                      Verifying...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Verify OTP
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
