import React from "react";
import { Form } from "react-bootstrap";
import { Upload } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import CKEditor from "@components/CKEditor";
import Label from "@components/form/Label";
import { Language } from "interface/common";
import { PageTemplate } from "@config/pageTemplates";
import type { UploadFile } from "antd/es/upload/interface";
import showToast from "@utils/toast";

const MAX_SIZE_MB = 5;

interface SimpleTemplateEditorProps {
  template: PageTemplate;
  languageList: Language[];
  activeLang: string;
  content: Record<string, any>;
  onContentChange: (key: string, value: any, lang?: string) => void;
  imageFiles?: Record<string, UploadFile[]>;
  onImageChange?: (key: string, files: UploadFile[]) => void;
  /** Optional: enables page dropdown only when field has selectPageForRedirect (home template section links). */
  allPages?: Array<{
    id?: string;
    _id?: string;
    slug?: string;
    customSlug?: string;
    title?: string | Record<string, string>;
  }>;
  /** Exclude this page id from redirect targets (current edited page). */
  excludePageId?: string;
}

const SimpleTemplateEditor: React.FC<SimpleTemplateEditorProps> = ({
  template,
  languageList,
  activeLang,
  content,
  onContentChange,
  imageFiles = {},
  onImageChange,
  allPages,
  excludePageId,
}) => {
  const getRawContentValue = (key: string): any => content?.[key];

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
    if (typeof fieldContent === "object" && !Array.isArray(fieldContent) && fieldContent !== null) {
      const firstValue = Object.values(fieldContent)[0];
      return typeof firstValue === "string" ? firstValue : "";
    }
    return "";
  };

  const setFieldValue = (field: any, lang: string, nextValue: string) => {
    const currentField = content[field.key] || {};
    if (field.multilingual === false) {
      onContentChange(field.key, nextValue);
      return;
    }
    onContentChange(field.key, { ...currentField, [lang]: nextValue }, lang);
  };

  const isFieldVisible = (field: any): boolean => {
    if (!field.showWhen) return true;
    const dependentRaw = getRawContentValue(field.showWhen.key);
    if (dependentRaw == null) return false;
    const dependentValue =
      typeof dependentRaw === "string"
        ? dependentRaw
        : typeof dependentRaw === "object" && dependentRaw !== null
          ? (dependentRaw[activeLang] ??
              Object.values(dependentRaw)[0] ??
              "")
          : "";
    return String(dependentValue).toLowerCase() === String(field.showWhen.equals).toLowerCase();
  };

  const handleImageChange = (key: string, fileList: UploadFile[]) => {
    if (onImageChange) {
      onImageChange(key, fileList);
    }
  };

  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      showToast("Invalid file type. Please select a JPEG, PNG, or JPG image.", "error");
      return Upload.LIST_IGNORE;
    }
    const isLt5M = file.size / 1024 / 1024 < MAX_SIZE_MB;
    if (!isLt5M) {
      showToast(`Image must be smaller than ${MAX_SIZE_MB}MB!`, "error");
      return Upload.LIST_IGNORE;
    }
    return false; // Prevent auto upload - file will be handled manually
  };

  const renderField = (field: any, lang: string) => {
    if (!isFieldVisible(field)) {
      return null;
    }

    const value = getContentValue(field.key, lang);

    switch (field.type) {
      case "text":
        return (
          <Form.Group key={`${field.key}-${lang}`} className="mb-4">
            <Label>
              {field.label}
              {field.required && <span className="text-error-500">*</span>}
            </Label>
            <Form.Control
              type="text"
              className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm"
              value={value}
              onChange={(e) => {
                setFieldValue(field, lang, e.target.value);
              }}
              placeholder={field.placeholder || ""}
            />
          </Form.Group>
        );

      case "richText":
        return (
          <Form.Group key={`${field.key}-${lang}`} className="mb-4">
            <Label>
              {field.label}
              {field.required && <span className="text-error-500">*</span>}
            </Label>
            <CKEditor
              keyName={`${field.key}-${lang}`}
              value={String(value || "")}
              setValue={(_key, editorValue) => {
                setFieldValue(field, lang, editorValue);
              }}
            />
          </Form.Group>
        );

      case "image":
        const imageFileList = imageFiles[field.key] || [];
        return (
          <Form.Group key={`${field.key}-${lang}`} className="mb-4">
            <Label>
              {field.label}
              {field.required && <span className="text-error-500">*</span>}
            </Label>
            <Upload
              listType="picture-card"
              fileList={imageFileList}
              beforeUpload={beforeUpload}
              onChange={({ fileList }) => handleImageChange(field.key, fileList)}
              maxCount={1}
            >
              {imageFileList.length < 1 && (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </Form.Group>
        );

      case "link": {
        const showPagePicker =
          Boolean(field.selectPageForRedirect) && Array.isArray(allPages);

        if (showPagePicker) {
          const primaryLang = languageList[0]?.code || "en";
          const selectValue = (() => {
            if (!value) return "";
            const match = allPages!.find((page) => {
              const pageSlug = page.slug || page.customSlug || "";
              return value === `/${pageSlug}`;
            });
            return match ? value : "";
          })();

          return (
            <Form.Group key={`${field.key}-${lang}`} className="mb-4">
              <Label>
                {field.label}
                {field.required && <span className="text-error-500">*</span>}
              </Label>
              <div className="mb-2">
                <Form.Control
                  as="select"
                  className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700"
                  value={selectValue}
                  onChange={(e) => {
                    setFieldValue(field, lang, e.target.value || "");
                  }}
                >
                  <option value="">Select a page</option>
                  {allPages!
                    .filter((page) => {
                      const pid = page.id || page._id;
                      return pid !== excludePageId;
                    })
                    .map((page) => {
                      const pageTitle =
                        typeof page.title === "string"
                          ? page.title
                          : (page.title?.[primaryLang] ||
                              Object.values(page.title || {})[0] ||
                              "Untitled");
                      const pageSlug = page.slug || page.customSlug || "";
                      return (
                        <option
                          key={page.id || page._id || pageSlug}
                          value={pageSlug ? `/${pageSlug}` : ""}
                        >
                          {pageTitle} {pageSlug ? `(${pageSlug})` : ""}
                        </option>
                      );
                    })}
                </Form.Control>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Or enter a custom URL or path below (e.g. external link).
              </p>
              <Form.Control
                type="text"
                className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700"
                value={value}
                onChange={(e) => {
                  setFieldValue(field, lang, e.target.value);
                }}
                placeholder={field.placeholder || ""}
              />
            </Form.Group>
          );
        }

        return (
          <Form.Group key={`${field.key}-${lang}`} className="mb-4">
            <Label>
              {field.label}
              {field.required && <span className="text-error-500">*</span>}
            </Label>
            <Form.Control
              type="text"
              className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm"
              value={value}
              onChange={(e) => {
                setFieldValue(field, lang, e.target.value);
              }}
              placeholder={field.placeholder || ""}
            />
          </Form.Group>
        );
      }

      case "select":
        return (
          <Form.Group key={`${field.key}-${lang}`} className="mb-4">
            <Label>
              {field.label}
              {field.required && <span className="text-error-500">*</span>}
            </Label>
            <Form.Control
              as="select"
              className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm"
              value={value || field.options?.[0]?.value || ""}
              onChange={(e) => {
                setFieldValue(field, lang, e.target.value);
              }}
            >
              {(field.options || []).map((option: { label: string; value: string }) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        );

      default:
        return null;
    }
  };

  // Group fields by section for better organization
  const groupFieldsBySection = () => {
    const sections: Record<string, any[]> = {
      banner: [],
      overview: [],
      steps: [],
      closing: [],
    };

    // Always show all template fields, even if content is empty
    template.fields.forEach((field) => {
      if (field.key.startsWith("banner")) {
        sections.banner.push(field);
      } else if (field.key.startsWith("overview")) {
        sections.overview.push(field);
      } else if (field.key.startsWith("step")) {
        sections.steps.push(field);
      } else if (field.key.startsWith("closing")) {
        sections.closing.push(field);
      } else {
        sections.overview.push(field);
      }
    });

    return sections;
  };

  const sections = groupFieldsBySection();
  
  // Ensure we always render all fields from the template
  // This ensures fields are visible even when adding a new page with no content

  return (
    <div className="simple-template-editor p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="space-y-6">
        {/* Banner Section */}
        {sections.banner.length > 0 && (
          <div className="section bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Banner Section</h3>
            {languageList.map((lang) => (
              <div key={lang.code} className={lang.code !== activeLang ? "hidden" : ""}>
                {sections.banner.map((field) => renderField(field, lang.code))}
              </div>
            ))}
          </div>
        )}

        {/* Overview Section */}
        {sections.overview.length > 0 && (
          <div className="section bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Overview Section</h3>
            {languageList.map((lang) => (
              <div key={lang.code} className={lang.code !== activeLang ? "hidden" : ""}>
                {sections.overview.map((field) => renderField(field, lang.code))}
              </div>
            ))}
          </div>
        )}

        {/* Steps Section */}
        {sections.steps.length > 0 && (
          <div className="section bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Steps</h3>
            {languageList.map((lang) => (
              <div key={lang.code} className={lang.code !== activeLang ? "hidden" : ""}>
                {sections.steps
                  .sort((a, b) => {
                    // Sort steps by number (step1, step2, step3, step4)
                    const aMatch = a.key.match(/step(\d+)/);
                    const bMatch = b.key.match(/step(\d+)/);
                    const aNum = aMatch ? parseInt(aMatch[1]) : 0;
                    const bNum = bMatch ? parseInt(bMatch[1]) : 0;
                    return aNum - bNum;
                  })
                  .map((field) => renderField(field, lang.code))}
              </div>
            ))}
          </div>
        )}

        {/* Closing Section */}
        {sections.closing.length > 0 && (
          <div className="section bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Closing Section</h3>
            {languageList.map((lang) => (
              <div key={lang.code} className={lang.code !== activeLang ? "hidden" : ""}>
                {sections.closing.map((field) => renderField(field, lang.code))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleTemplateEditor;
