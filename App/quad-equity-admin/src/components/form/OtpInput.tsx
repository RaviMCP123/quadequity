import React, { useState, useRef, useEffect } from "react";

interface OtpInputProps {
  length: number;
  onComplete: (otp: string) => void;
  onChange?: (otp: string) => void;
}

const OtpInput: React.FC<OtpInputProps> = ({ length, onComplete, onChange }) => {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(""));
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value;

    setOtp(newOtp);
    const nextValue = newOtp.join("");
    onChange?.(nextValue);
    if (value && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
    if (newOtp.every((digit) => digit !== "")) {
      onComplete(nextValue);
    }
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleFocus = (index: number) => {
    inputsRef.current[index]?.select();
  };

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  return (
    <div className="flex justify-center gap-2 sm:gap-3">
      {otp.map((digit, index) => (
        <input
          key={index}
          type="text"
          inputMode="numeric"
          value={digit}
          onChange={(e) => handleChange(e.target.value, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onFocus={() => handleFocus(index)}
          maxLength={1}
          ref={(el) => { inputsRef.current[index] = el; }}
          className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-center text-xl sm:text-2xl font-bold rounded-xl border-2 border-brand-200 dark:border-brand-700 bg-brand-50/80 dark:bg-brand-950/50 text-brand-950 dark:text-white focus:outline-none focus:ring-4 focus:border-brand-500 focus:ring-brand-500/25 focus:bg-white dark:focus:bg-brand-950/80 dark:focus:border-brand-400 transition-all duration-200"
        />
      ))}
    </div>
  );
};

export default OtpInput;
