import React, { useState } from "react";
import { Tabs, Upload } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import CKEditor from "@components/CKEditor";
import { Language } from "interface/common";
import { PageTemplate } from "@config/pageTemplates";
import type { UploadFile } from "antd/es/upload/interface";
import showToast from "@utils/toast";

const MAX_SIZE_MB = 5;

interface TemplateEditorProps {
  template: PageTemplate;
  languageList: Language[];
  activeLang: string;
  content: Record<string, any>;
  onContentChange: (key: string, value: any, lang?: string) => void;
  imageFiles: Record<string, UploadFile[]>;
  onImageChange: (key: string, files: UploadFile[]) => void;
}

const TemplateEditor: React.FC<TemplateEditorProps> = ({
  template,
  languageList,
  activeLang,
  content,
  onContentChange,
  imageFiles,
  onImageChange,
}) => {
  const getContentValue = (key: string, lang?: string): string => {
    const fieldContent = content?.[key];
    if (!fieldContent) return "";
    
    if (lang && typeof fieldContent === "object" && !Array.isArray(fieldContent) && fieldContent !== null) {
      const langValue = fieldContent[lang];
      return typeof langValue === "string" ? langValue : "";
    }
    if (typeof fieldContent === "string") {
      return fieldContent;
    }
    // If it's an object but no lang specified, try to get first value or return empty
    if (typeof fieldContent === "object" && !Array.isArray(fieldContent) && fieldContent !== null) {
      const firstValue = Object.values(fieldContent)[0];
      return typeof firstValue === "string" ? firstValue : "";
    }
    return "";
  };

  const renderTemplateHTML = (lang: string) => {
    if (template.key === "HOW_IT_WORKS_V1") {
      return (
        <div className="template-preview bg-white dark:bg-gray-900">
          {/* Banner Section */}
          <section className="banner-section banner-how-it-works bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16 mb-8">
            <div className="container mx-auto px-4">
              <div className="banner-content text-center">
                <h1 className="text-4xl font-bold mb-4">
                  <input
                    type="text"
                    className="bg-transparent border-b-2 border-white/50 focus:border-white outline-none text-center w-full max-w-2xl mx-auto"
                    value={getContentValue("bannerTitle", lang)}
                    onChange={(e) => onContentChange("bannerTitle", { ...content.bannerTitle, [lang]: e.target.value }, lang)}
                    placeholder="A Clear and Structured Process"
                  />
                </h1>
                <div className="mt-4 max-w-2xl mx-auto">
                  <CKEditor
                    keyName={`bannerDescription-${lang}`}
                    value={String(getContentValue("bannerDescription", lang) || "")}
                    setValue={(_key, value) => {
                      const current = content.bannerDescription || {};
                      onContentChange("bannerDescription", { ...current, [lang]: value }, lang);
                    }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Overview Section */}
          <section className="section-container py-12 mb-8">
            <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="section-content">
                  <h2 className="text-3xl font-bold mb-4 text-gray-800 dark:text-white">
                    <input
                      type="text"
                      className="bg-transparent border-b-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 outline-none w-full"
                      value={getContentValue("overviewTitle", lang)}
                      onChange={(e) => onContentChange("overviewTitle", { ...content.overviewTitle, [lang]: e.target.value }, lang)}
                      placeholder="Designed for Simplicity"
                    />
                  </h2>
                  <div className="mt-4">
                    <CKEditor
                      keyName={`overviewDescription-${lang}`}
                      value={String(getContentValue("overviewDescription", lang) || "")}
                      setValue={(_key, value) => {
                        const current = content.overviewDescription || {};
                        onContentChange("overviewDescription", { ...current, [lang]: value }, lang);
                      }}
                    />
                  </div>
                </div>
                <div className="section-img-right">
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                    <Upload
                      listType="picture-card"
                      maxCount={1}
                      accept="image/*"
                      fileList={imageFiles["overviewImage"] || []}
                      beforeUpload={(file) => {
                        if (file.size && file.size > MAX_SIZE_MB * 1024 * 1024) {
                          showToast(`Image must be smaller than ${MAX_SIZE_MB}MB!`, "error");
                          return Upload.LIST_IGNORE;
                        }
                        return false;
                      }}
                      onChange={(info) => {
                        onImageChange("overviewImage", info.fileList);
                      }}
                    >
                      {(imageFiles["overviewImage"]?.length || 0) < 1 && (
                        <div>
                          <PlusOutlined />
                          <div style={{ marginTop: 8 }}>Upload Image</div>
                        </div>
                      )}
                    </Upload>
                    {imageFiles["overviewImage"]?.[0]?.url && (
                      <img
                        src={imageFiles["overviewImage"][0].url}
                        alt="Overview"
                        className="w-full h-auto rounded-lg mt-2"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Step 1 */}
          <section className="section-container py-12 mb-8 bg-gray-50 dark:bg-gray-800">
            <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="section-img-left">
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                    <Upload
                      listType="picture-card"
                      maxCount={1}
                      accept="image/*"
                      fileList={imageFiles["step1Image"] || []}
                      beforeUpload={(file) => {
                        if (file.size && file.size > MAX_SIZE_MB * 1024 * 1024) {
                          showToast(`Image must be smaller than ${MAX_SIZE_MB}MB!`, "error");
                          return Upload.LIST_IGNORE;
                        }
                        return false;
                      }}
                      onChange={(info) => {
                        onImageChange("step1Image", info.fileList);
                      }}
                    >
                      {(imageFiles["step1Image"]?.length || 0) < 1 && (
                        <div>
                          <PlusOutlined />
                          <div style={{ marginTop: 8 }}>Upload Image</div>
                        </div>
                      )}
                    </Upload>
                    {imageFiles["step1Image"]?.[0]?.url && (
                      <img
                        src={imageFiles["step1Image"][0].url}
                        alt="Step 1"
                        className="w-full h-auto rounded-lg mt-2"
                      />
                    )}
                  </div>
                </div>
                <div className="section-content">
                  <h2 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white">
                    <input
                      type="text"
                      className="bg-transparent border-b-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 outline-none w-full"
                      value={getContentValue("step1Title", lang)}
                      onChange={(e) => onContentChange("step1Title", { ...content.step1Title, [lang]: e.target.value }, lang)}
                      placeholder="Step 1 – School Registration"
                    />
                  </h2>
                  <h4 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">
                    <input
                      type="text"
                      className="bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-blue-500 outline-none w-full"
                      value={getContentValue("step1Subtitle", lang)}
                      onChange={(e) => onContentChange("step1Subtitle", { ...content.step1Subtitle, [lang]: e.target.value }, lang)}
                      placeholder="Initial Registration"
                    />
                  </h4>
                  <div className="mt-4">
                    <CKEditor
                      keyName={`step1Description-${lang}`}
                      value={String(getContentValue("step1Description", lang) || "")}
                      setValue={(_key, value) => {
                        const current = content.step1Description || {};
                        onContentChange("step1Description", { ...current, [lang]: value }, lang);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Step 2 */}
          <section className="section-container py-12 mb-8">
            <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="section-content">
                  <h2 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white">
                    <input
                      type="text"
                      className="bg-transparent border-b-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 outline-none w-full"
                      value={getContentValue("step2Title", lang)}
                      onChange={(e) => onContentChange("step2Title", { ...content.step2Title, [lang]: e.target.value }, lang)}
                      placeholder="Step 2 – Structured Alignment"
                    />
                  </h2>
                  <h4 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">
                    <input
                      type="text"
                      className="bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-blue-500 outline-none w-full"
                      value={getContentValue("step2Subtitle", lang)}
                      onChange={(e) => onContentChange("step2Subtitle", { ...content.step2Subtitle, [lang]: e.target.value }, lang)}
                      placeholder="Alignment & Structuring"
                    />
                  </h4>
                  <div className="mt-4">
                    <CKEditor
                      keyName={`step2Description-${lang}`}
                      value={String(getContentValue("step2Description", lang) || "")}
                      setValue={(_key, value) => {
                        const current = content.step2Description || {};
                        onContentChange("step2Description", { ...current, [lang]: value }, lang);
                      }}
                    />
                  </div>
                </div>
                <div className="section-img-right">
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                    <Upload
                      listType="picture-card"
                      maxCount={1}
                      accept="image/*"
                      fileList={imageFiles["step2Image"] || []}
                      beforeUpload={(file) => {
                        if (file.size && file.size > MAX_SIZE_MB * 1024 * 1024) {
                          showToast(`Image must be smaller than ${MAX_SIZE_MB}MB!`, "error");
                          return Upload.LIST_IGNORE;
                        }
                        return false;
                      }}
                      onChange={(info) => {
                        onImageChange("step2Image", info.fileList);
                      }}
                    >
                      {(imageFiles["step2Image"]?.length || 0) < 1 && (
                        <div>
                          <PlusOutlined />
                          <div style={{ marginTop: 8 }}>Upload Image</div>
                        </div>
                      )}
                    </Upload>
                    {imageFiles["step2Image"]?.[0]?.url && (
                      <img
                        src={imageFiles["step2Image"][0].url}
                        alt="Step 2"
                        className="w-full h-auto rounded-lg mt-2"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Step 3 */}
          <section className="section-container py-12 mb-8 bg-gray-50 dark:bg-gray-800">
            <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="section-img-left">
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                    <Upload
                      listType="picture-card"
                      maxCount={1}
                      accept="image/*"
                      fileList={imageFiles["step3Image"] || []}
                      beforeUpload={(file) => {
                        if (file.size && file.size > MAX_SIZE_MB * 1024 * 1024) {
                          showToast(`Image must be smaller than ${MAX_SIZE_MB}MB!`, "error");
                          return Upload.LIST_IGNORE;
                        }
                        return false;
                      }}
                      onChange={(info) => {
                        onImageChange("step3Image", info.fileList);
                      }}
                    >
                      {(imageFiles["step3Image"]?.length || 0) < 1 && (
                        <div>
                          <PlusOutlined />
                          <div style={{ marginTop: 8 }}>Upload Image</div>
                        </div>
                      )}
                    </Upload>
                    {imageFiles["step3Image"]?.[0]?.url && (
                      <img
                        src={imageFiles["step3Image"][0].url}
                        alt="Step 3"
                        className="w-full h-auto rounded-lg mt-2"
                      />
                    )}
                  </div>
                </div>
                <div className="section-content">
                  <h2 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white">
                    <input
                      type="text"
                      className="bg-transparent border-b-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 outline-none w-full"
                      value={getContentValue("step3Title", lang)}
                      onChange={(e) => onContentChange("step3Title", { ...content.step3Title, [lang]: e.target.value }, lang)}
                      placeholder="Step 3 – Implementation"
                    />
                  </h2>
                  <h4 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">
                    <input
                      type="text"
                      className="bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-blue-500 outline-none w-full"
                      value={getContentValue("step3Subtitle", lang)}
                      onChange={(e) => onContentChange("step3Subtitle", { ...content.step3Subtitle, [lang]: e.target.value }, lang)}
                      placeholder="School & Family Onboarding"
                    />
                  </h4>
                  <div className="mt-4">
                    <CKEditor
                      keyName={`step3Description-${lang}`}
                      value={String(getContentValue("step3Description", lang) || "")}
                      setValue={(_key, value) => {
                        const current = content.step3Description || {};
                        onContentChange("step3Description", { ...current, [lang]: value }, lang);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Step 4 */}
          <section className="section-container py-12 mb-8">
            <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="section-content">
                  <h2 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white">
                    <input
                      type="text"
                      className="bg-transparent border-b-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 outline-none w-full"
                      value={getContentValue("step4Title", lang)}
                      onChange={(e) => onContentChange("step4Title", { ...content.step4Title, [lang]: e.target.value }, lang)}
                      placeholder="Step 4 – Ongoing Support"
                    />
                  </h2>
                  <h4 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">
                    <input
                      type="text"
                      className="bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-blue-500 outline-none w-full"
                      value={getContentValue("step4Subtitle", lang)}
                      onChange={(e) => onContentChange("step4Subtitle", { ...content.step4Subtitle, [lang]: e.target.value }, lang)}
                      placeholder="Term Support & Oversight"
                    />
                  </h4>
                  <div className="mt-4">
                    <CKEditor
                      keyName={`step4Description-${lang}`}
                      value={String(getContentValue("step4Description", lang) || "")}
                      setValue={(_key, value) => {
                        const current = content.step4Description || {};
                        onContentChange("step4Description", { ...current, [lang]: value }, lang);
                      }}
                    />
                  </div>
                </div>
                <div className="section-img-right">
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                    <Upload
                      listType="picture-card"
                      maxCount={1}
                      accept="image/*"
                      fileList={imageFiles["step4Image"] || []}
                      beforeUpload={(file) => {
                        if (file.size && file.size > MAX_SIZE_MB * 1024 * 1024) {
                          showToast(`Image must be smaller than ${MAX_SIZE_MB}MB!`, "error");
                          return Upload.LIST_IGNORE;
                        }
                        return false;
                      }}
                      onChange={(info) => {
                        onImageChange("step4Image", info.fileList);
                      }}
                    >
                      {(imageFiles["step4Image"]?.length || 0) < 1 && (
                        <div>
                          <PlusOutlined />
                          <div style={{ marginTop: 8 }}>Upload Image</div>
                        </div>
                      )}
                    </Upload>
                    {imageFiles["step4Image"]?.[0]?.url && (
                      <img
                        src={imageFiles["step4Image"][0].url}
                        alt="Step 4"
                        className="w-full h-auto rounded-lg mt-2"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Closing Section */}
          <section className="section-container py-12 mb-8 bg-gray-50 dark:bg-gray-800">
            <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="section-img-left">
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                    <Upload
                      listType="picture-card"
                      maxCount={1}
                      accept="image/*"
                      fileList={imageFiles["closingImage"] || []}
                      beforeUpload={(file) => {
                        if (file.size && file.size > MAX_SIZE_MB * 1024 * 1024) {
                          showToast(`Image must be smaller than ${MAX_SIZE_MB}MB!`, "error");
                          return Upload.LIST_IGNORE;
                        }
                        return false;
                      }}
                      onChange={(info) => {
                        onImageChange("closingImage", info.fileList);
                      }}
                    >
                      {(imageFiles["closingImage"]?.length || 0) < 1 && (
                        <div>
                          <PlusOutlined />
                          <div style={{ marginTop: 8 }}>Upload Image</div>
                        </div>
                      )}
                    </Upload>
                    {imageFiles["closingImage"]?.[0]?.url && (
                      <img
                        src={imageFiles["closingImage"][0].url}
                        alt="Closing"
                        className="w-full h-auto rounded-lg mt-2"
                      />
                    )}
                  </div>
                </div>
                <div className="section-content">
                  <h2 className="text-3xl font-bold mb-4 text-gray-800 dark:text-white">
                    <input
                      type="text"
                      className="bg-transparent border-b-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 outline-none w-full"
                      value={getContentValue("closingTitle", lang)}
                      onChange={(e) => onContentChange("closingTitle", { ...content.closingTitle, [lang]: e.target.value }, lang)}
                      placeholder="Measured Transparent Structured"
                    />
                  </h2>
                  <div className="mt-4">
                    <CKEditor
                      keyName={`closingDescription-${lang}`}
                      value={String(getContentValue("closingDescription", lang) || "")}
                      setValue={(_key, value) => {
                        const current = content.closingDescription || {};
                        onContentChange("closingDescription", { ...current, [lang]: value }, lang);
                      }}
                    />
                  </div>
                  <div className="mt-6 flex gap-4">
                    <input
                      type="text"
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                      value={getContentValue("closingButtonText", lang)}
                      onChange={(e) => onContentChange("closingButtonText", { ...content.closingButtonText, [lang]: e.target.value }, lang)}
                      placeholder="Button Text"
                    />
                    <input
                      type="text"
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                      value={getContentValue("closingButtonLink", lang)}
                      onChange={(e) => onContentChange("closingButtonLink", { ...content.closingButtonLink, [lang]: e.target.value }, lang)}
                      placeholder="Button Link"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      );
    }
    return <div>Template not found</div>;
  };

  return (
    <div className="template-editor">
      <Tabs
        activeKey={activeLang}
        type="card"
        tabBarStyle={languageList.length === 1 ? { display: 'none' } : undefined}
        items={languageList.map((lang) => ({
          key: lang.code,
          label: <span className="tab-title">{lang.title}</span>,
          children: (
            <div className="overflow-auto max-h-[70vh]">
              {renderTemplateHTML(lang.code)}
            </div>
          ),
        }))}
      />
    </div>
  );
};

export default TemplateEditor;
