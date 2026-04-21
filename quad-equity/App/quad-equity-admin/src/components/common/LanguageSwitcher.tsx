import React from "react";
import { Select } from "antd";
import { useTranslation } from "react-i18next";

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const languages = [
    { value: "en", label: "English" },
  ];

  const handleChange = (value: string) => {
    i18n.changeLanguage(value);
  };

  return (
    <Select
      value={i18n.language}
      onChange={handleChange}
      options={languages}
      className="min-w-[120px]"
      size="small"
    />
  );
};

export default LanguageSwitcher;

