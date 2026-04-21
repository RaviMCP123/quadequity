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
          className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-center text-xl sm:text-2xl font-bold rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:border-[#0056d2] focus:ring-[#0056d2]/20 focus:bg-white dark:focus:bg-gray-900/80 dark:focus:border-[#0056d2] transition-all duration-200"
        />
      ))}
    </div>
  );
};

export default OtpInput;
