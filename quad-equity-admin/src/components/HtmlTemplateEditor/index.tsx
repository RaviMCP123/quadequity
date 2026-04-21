import React, { useState, useEffect, useRef } from "react";
import { Tabs, Upload, Button } from "antd";
import { PlusOutlined, EditOutlined } from "@ant-design/icons";
import CKEditor from "@components/CKEditor";
import { Language } from "interface/common";
import { PageTemplate } from "@config/pageTemplates";
import type { UploadFile } from "antd/es/upload/interface";
import showToast from "@utils/toast";

const MAX_SIZE_MB = 5;

interface HtmlTemplateEditorProps {
  template: PageTemplate;
  languageList: Language[];
  activeLang: string;
  content: Record<string, any>;
  onContentChange: (key: string, value: any, lang?: string) => void;
  imageFiles: Record<string, UploadFile[]>;
  onImageChange: (key: string, files: UploadFile[]) => void;
}

const HtmlTemplateEditor: React.FC<HtmlTemplateEditorProps> = ({
  template,
  languageList,
  activeLang,
  content,
  onContentChange,
  imageFiles,
  onImageChange,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [htmlContent, setHtmlContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentLang, setCurrentLang] = useState(activeLang);
  const [editingField, setEditingField] = useState<string | null>(null);
  const originalHtmlRef = useRef<string>("");
  const pendingUpdatesRef = useRef<Map<string, string>>(new Map()); // Track pending content updates
  const iframeInitializedRef = useRef<boolean>(false); // Track if iframe has been initialized
  const initialSrcDocRef = useRef<string>(""); // Store initial srcDoc to prevent reloads

  // Load the actual HTML template file
  useEffect(() => {
    const loadTemplate = async () => {
      try {
        setIsLoading(true);
        let templatePath = "";

        if (template.key === "HOW_IT_WORKS_V1") {
          templatePath = "/how-it-works.html";
        }

        if (templatePath) {
          try {
            const response = await fetch(templatePath, {
              cache: 'no-cache'
            });
            if (response.ok) {
              let html = await response.text();

              // Strip header & footer for editing view (we only want inner page content)
              // Keep <head> so CSS/JS still load
              html = html
                // remove header block
                .replace(/<header[\s\S]*?<\/header>/i, "")
                // remove footer block
                .replace(/<footer[\s\S]*?<\/footer>/i, "")
                // remove scroll-top button if present
                .replace(/<button[^>]*class="scroll__top[\s\S]*?<\/button>/i, "")
                // remove preloader if present
                .replace(/<div[^>]*id="preloader"[\s\S]*?<\/div>/i, "")
                // Remove scripts that might access removed elements (header, footer, etc.)
                .replace(/<script[^>]*src="[^"]*main\.js"[^>]*><\/script>/gi, "")
                .replace(/<script[^>]*src="[^"]*ajax-form\.js"[^>]*><\/script>/gi, "")
                // Also remove any inline scripts that might reference removed elements
                .replace(/<script[^>]*>[\s\S]*?addEventListener[\s\S]*?<\/script>/gi, (match) => {
                  // Only remove if it contains references to header/footer/preloader
                  if (match.match(/header|footer|preloader|scroll__top/i)) {
                    return "";
                  }
                  return match;
                });

              // Add base tag to ensure relative paths work correctly
              if (!html.includes('<base')) {
                html = html.replace('<head>', '<head><base href="/">');
              }
              
              // Replace relative asset paths to absolute paths for iframe
              // This ensures CSS, JS, and images load correctly
              html = html.replace(/href="assets\//g, 'href="/assets/');
              html = html.replace(/src="assets\//g, 'src="/assets/');
              html = html.replace(/url\(assets\//g, 'url(/assets/');
              
              originalHtmlRef.current = html;
              const initialHtml = replaceContentInHtml(html, currentLang);
              initialSrcDocRef.current = initialHtml;
              setHtmlContent(html);
              setIsLoading(false);
              iframeInitializedRef.current = false; // Reset when template changes
              return;
            }
          } catch (fetchError) {
            console.error("Error loading template:", fetchError);
          }
        }
        
        setHtmlContent("<html><body><h1>Template file not found</h1></body></html>");
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading template:", error);
        setIsLoading(false);
      }
    };

    loadTemplate();
  }, [template.key]);

  // Listen for content updates from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'CMS_CONTENT_UPDATE') {
        const { key, value, lang } = event.data;
        // Ensure value is a string
        const stringValue = typeof value === 'string' ? value : String(value || '');
        
        // Store the update immediately in ref so updateIframeContent can use it
        pendingUpdatesRef.current.set(key, stringValue);
        
        // Get current content and clean it to ensure all values are strings
        let current = content[key];
        const cleanedCurrent: Record<string, string> = {};
        
        if (current && typeof current === 'object' && !Array.isArray(current)) {
          // Clean the current object to ensure all values are strings, not objects
          Object.entries(current).forEach(([langCode, val]) => {
            if (typeof val === 'string') {
              // Already a string, use it (but skip if it's "[object Object]")
              if (val !== '[object Object]') {
                cleanedCurrent[langCode] = val;
              }
            } else if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
              // Nested object, extract the actual string value
              const actualValue = Object.values(val)[0];
              if (typeof actualValue === 'string' && actualValue !== '[object Object]') {
                cleanedCurrent[langCode] = actualValue;
              } else if (typeof actualValue === 'string') {
                // Even if it's "[object Object]", try to extract further
                const deeperValue = typeof actualValue === 'object' ? Object.values(actualValue)[0] : actualValue;
                if (typeof deeperValue === 'string' && deeperValue !== '[object Object]') {
                  cleanedCurrent[langCode] = deeperValue;
                }
              }
            }
          });
        }
        
        // Update with the new value (always use the new stringValue for the current language)
        cleanedCurrent[lang] = stringValue;
        onContentChange(key, cleanedCurrent, lang);
        
        // Immediately update the iframe element with the new value
        if (iframeRef.current) {
          const iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
          if (iframeDoc && iframeDoc.readyState === 'complete') {
            const element = iframeDoc.querySelector(`[data-cms-key="${key}"]`) as HTMLElement;
            if (element && element.tagName !== 'IMG') {
              // Don't update if element is currently focused
              if (iframeDoc.activeElement !== element && !element.contains(iframeDoc.activeElement)) {
                element.innerHTML = stringValue || '';
                element.setAttribute('data-original-value', stringValue || '');
              }
            }
          }
        }
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [content, onContentChange]);

  // Update HTML when content or language changes
  useEffect(() => {
    if (htmlContent && iframeRef.current && !isLoading && originalHtmlRef.current) {
      // Small delay to avoid conflicts with blur events
      const timeoutId = setTimeout(() => {
        const updatedHtml = replaceContentInHtml(originalHtmlRef.current, currentLang);
        updateIframeContent(updatedHtml);
      }, 200);
      
      return () => clearTimeout(timeoutId);
    }
  }, [htmlContent, content, currentLang, imageFiles, isLoading]);

  const getContentValue = (key: string, lang: string): string => {
    // Check pending updates first (these are the most recent values)
    if (pendingUpdatesRef.current.has(key)) {
      const pendingValue = pendingUpdatesRef.current.get(key);
      // Clear from pending once we've used it (content prop will have it now)
      if (content?.[key] && typeof content[key] === 'object' && content[key][lang] === pendingValue) {
        pendingUpdatesRef.current.delete(key);
      }
      return typeof pendingValue === 'string' ? pendingValue : String(pendingValue || "");
    }
    
    const fieldContent = content?.[key];
    if (!fieldContent) return "";
    
    // Helper function to extract string value from nested objects
    const extractStringValue = (val: any): string => {
      if (val === null || val === undefined) return "";
      if (typeof val === "string") return val;
      if (typeof val === "number" || typeof val === "boolean") return String(val);
      if (Array.isArray(val)) return "";
      
      // If it's an object, try to extract the value
      if (typeof val === "object") {
        // Check if it has the current language key
        if (val[lang] !== undefined) {
          return extractStringValue(val[lang]);
        }
        // Check if it has any string value directly
        const keys = Object.keys(val);
        if (keys.length > 0) {
          // Try first key (might be a language code)
          const firstValue = val[keys[0]];
          if (typeof firstValue === "string") {
            return firstValue;
          }
          // If first value is also an object, recurse (handle double nesting)
          if (typeof firstValue === "object" && firstValue !== null) {
            return extractStringValue(firstValue);
          }
        }
        // If all else fails, return empty to avoid "object object"
        return "";
      }
      
      return "";
    };
    
    // If it's an object (multilingual), extract the value for the current language
    if (typeof fieldContent === "object" && !Array.isArray(fieldContent) && fieldContent !== null) {
      return extractStringValue(fieldContent);
    }
    
    // If it's already a string, return it
    if (typeof fieldContent === "string") {
      return fieldContent;
    }
    
    // Convert any other type to string
    return String(fieldContent || "");
  };

  const replaceContentInHtml = (html: string, lang: string): string => {
    let updatedHtml = html;
    
    // Replace text content for all elements with data-cms-key
    const cmsKeyRegex = /data-cms-key="([^"]+)"/g;
    const matches = [...html.matchAll(cmsKeyRegex)];
    
    matches.forEach((match) => {
      const key = match[1];
      const value = getContentValue(key, lang);
      
      // Always replace, even if value is empty
      // Find the element and replace its inner content (excluding images)
      const elementRegex = new RegExp(
        `(<(?!img)[^>]*data-cms-key="${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*>)(.*?)(</[^>]+>)`,
        'gis'
      );
      
      updatedHtml = updatedHtml.replace(elementRegex, (fullMatch, openTag, oldContent, closeTag) => {
        // Store original value in data attribute for comparison during editing
        const escapedValue = (value || '').replace(/"/g, '&quot;');
        return `${openTag.replace('>', ` data-original-value="${escapedValue}">`)}${value || ''}${closeTag}`;
      });
    });
    
    // Replace image sources
    Object.keys(imageFiles).forEach((key) => {
      const file = imageFiles[key]?.[0];
      if (file?.url) {
        const imgRegex = new RegExp(
          `(<img[^>]*data-cms-key="${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*src=")([^"]*)(")`,
          'gi'
        );
        updatedHtml = updatedHtml.replace(imgRegex, (match, before, oldSrc, after) => {
          return `${before}${file.url}${after}`;
        });
      }
    });
    
    return updatedHtml;
  };

  const updateIframeContent = (html: string) => {
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (iframeDoc && iframeDoc.readyState === 'complete' && iframeDoc.body) {
        // If document is already loaded, update only the changed elements
        // This preserves editable state and is faster
        Object.keys(content).forEach((key) => {
          const value = getContentValue(key, currentLang);
          
          // Find the element in the iframe document
          const element = iframeDoc.querySelector(`[data-cms-key="${key}"]`) as HTMLElement;
          if (element && element.tagName !== 'IMG') {
            // Don't update if element is currently being edited (has focus)
            if (iframeDoc.activeElement === element || element.contains(iframeDoc.activeElement)) {
              return; // Skip updating this element while it's being edited
            }
            
            // Get the current content from the element
            const currentContent = element.innerHTML || element.textContent || '';
            const savedValue = element.getAttribute('data-original-value') || '';
            
            // Update if the value from content state differs from what's saved in the element
            // This ensures we update when content state changes, even if value is empty
            if (savedValue !== value) {
              element.innerHTML = value || '';
              // Update the data attribute to match the new value
              element.setAttribute('data-original-value', value || '');
            }
          }
        });
        
        // Also update images
        Object.keys(imageFiles).forEach((key) => {
          const file = imageFiles[key]?.[0];
          if (file?.url) {
            const img = iframeDoc.querySelector(`img[data-cms-key="${key}"]`) as HTMLImageElement;
            if (img && img.src !== file.url) {
              img.src = file.url;
            }
          }
        });
      } else if (iframeDoc) {
        // Document not ready yet, write full HTML
        // Add error handler before writing
        if (iframeDoc.defaultView) {
          // Suppress console warnings about sandbox attributes
          const originalWarn = iframeDoc.defaultView.console?.warn;
          if (iframeDoc.defaultView.console && originalWarn) {
            iframeDoc.defaultView.console.warn = function(...args: any[]) {
              const message = args.join(' ');
              // Suppress sandbox warning - it's safe in this context
              if (message.includes('sandbox') && message.includes('allow-scripts') && message.includes('allow-same-origin')) {
                return; // Suppress this specific warning
              }
              // Show other warnings
              originalWarn.apply(iframeDoc.defaultView.console, args);
            };
          }
          
          iframeDoc.defaultView.addEventListener('error', (e: ErrorEvent) => {
            // Suppress errors about null elements (from removed header/footer)
            if (e.message && (
              e.message.includes('Cannot read properties of null') ||
              e.message.includes('addEventListener') ||
              e.message.includes('querySelector')
            )) {
              e.preventDefault();
              e.stopPropagation();
              return false;
            }
          }, true);
        }
        
        iframeDoc.open();
        iframeDoc.write(html);
        iframeDoc.close();
        
        // Wait for resources to load
        const checkReady = () => {
          if (iframeDoc.readyState === 'complete') {
            setTimeout(() => {
              setupEditableElements(iframeDoc);
            }, 1500);
          } else {
            setTimeout(checkReady, 100);
          }
        };
        
        iframe.onload = () => {
          setTimeout(() => {
            setupEditableElements(iframeDoc);
            // Add error handling for scripts trying to access removed elements
            if (iframeDoc.defaultView) {
              // Override console.error to catch script errors
              const originalError = iframeDoc.defaultView.console?.error;
              if (iframeDoc.defaultView.console) {
                iframeDoc.defaultView.console.error = function(...args: any[]) {
                  // Ignore errors about null elements (from removed header/footer)
                  const errorMsg = args.join(' ');
                  if (!errorMsg.includes('Cannot read properties of null') && 
                      !errorMsg.includes('addEventListener')) {
                    if (originalError) {
                      originalError.apply(iframeDoc.defaultView.console, args);
                    }
                  }
                };
              }
            }
          }, 1500);
        };
        
        checkReady();
      }
    }
  };

  const setupEditableElements = (doc: Document) => {
    // Setup text elements with edit buttons
    const editableElements = doc.querySelectorAll('[data-cms-key]');
    editableElements.forEach((el) => {
      const element = el as HTMLElement;
      const key = element.getAttribute('data-cms-key');
      
      // Skip images (handled separately)
      if (element.tagName === 'IMG') {
        return;
      }
      
      if (key) {
        // Create edit button
        const editBtn = doc.createElement('button');
        editBtn.className = 'cms-edit-btn';
        editBtn.innerHTML = '✏️ Edit';
        editBtn.style.cssText = `
          position: absolute;
          top: 0;
          right: 0;
          background: #007bff;
          color: white;
          border: none;
          padding: 4px 8px;
          border-radius: 0 4px 0 4px;
          font-size: 11px;
          cursor: pointer;
          z-index: 10000;
          display: none;
          white-space: nowrap;
          pointer-events: auto;
          margin: 0;
          line-height: 1;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          visibility: hidden;
        `;
        
        // Ensure element has relative positioning so button overlays correctly
        if (element.style.position !== 'absolute' && element.style.position !== 'fixed') {
          const computedPosition = doc.defaultView?.getComputedStyle(element)?.position || 'static';
          if (computedPosition === 'static') {
            element.style.position = 'relative';
            element.style.zIndex = '1';
          }
        }
        
        // Wrap element in relative container if not already
        let container = element.parentElement;
        const wasWrapped = container?.classList.contains('cms-editable-wrapper');
        
        if (!container || !container.classList.contains('cms-editable-wrapper')) {
          // Create wrapper container
          container = doc.createElement('div');
          container.className = 'cms-editable-wrapper';
          
          // Match the element's display type for proper wrapping
          const elementDisplay = doc.defaultView?.getComputedStyle(element)?.display || 'block';
          // Get current element dimensions to preserve layout
          const elementHeight = element.offsetHeight || element.scrollHeight;
          const elementWidth = element.offsetWidth || element.scrollWidth;
          if (elementDisplay === 'inline' || elementDisplay === 'inline-block') {
            // For inline elements, use inline-block to wrap tightly
            container.style.cssText = `position: relative; display: inline-block; width: 100%; vertical-align: top; pointer-events: auto; min-height: ${elementHeight}px;`;
          } else {
            // For block elements, use block to match
            container.style.cssText = `position: relative; display: block; width: 100%; pointer-events: auto; min-height: ${elementHeight}px;`;
          }
          
          // Insert container before element, then move element into container
          const parent = element.parentNode;
          if (parent) {
            parent.insertBefore(container, element);
            container.appendChild(element);
          }
        }
        
        // Remove existing button if any (check both container and element parent)
        const existingBtn = container.querySelector('.cms-edit-btn') || element.parentElement?.querySelector('.cms-edit-btn');
        if (existingBtn) {
          existingBtn.remove();
        }
        
        // Ensure element is the first child in the container (for proper DOM order)
        // The button will be appended after, but since it's absolutely positioned, it will overlay
        if (container.firstChild !== element && container.contains(element)) {
          // Move element to be first child
          const otherChildren = Array.from(container.children).filter(child => child !== element && !child.classList.contains('cms-edit-btn'));
          container.insertBefore(element, container.firstChild);
        }
        
        // Append edit button to container LAST - it will overlay the element via absolute positioning
        // Since button is absolutely positioned with z-index, it will appear on top of the element
        container.appendChild(editBtn);
        
        // Show button on hover - LOCK container height to prevent ANY layout shift
        container.addEventListener('mouseenter', () => {
          // Lock container height BEFORE any changes to prevent shift
          const currentHeight = container.offsetHeight;
          container.style.height = currentHeight + 'px';
          container.style.overflow = 'visible'; // Allow button to show outside if needed
          
          // Show button (absolutely positioned, won't affect layout)
          editBtn.style.visibility = 'visible';
          editBtn.style.display = 'block';
          
          // Use box-shadow inset (doesn't affect layout dimensions)
          element.style.boxShadow = 'inset 0 0 0 2px #007bff';
          element.style.backgroundColor = 'rgba(0, 123, 255, 0.05)';
        });
        
        container.addEventListener('mouseleave', () => {
          // Restore container to auto height
          container.style.height = '';
          container.style.overflow = '';
          
          editBtn.style.visibility = 'hidden';
          editBtn.style.display = 'none';
          element.style.boxShadow = 'none';
          element.style.backgroundColor = 'transparent';
        });
        
        // Make element directly editable
        element.setAttribute('contenteditable', 'true');
        element.style.cursor = 'text';
        // Ensure element can receive pointer events and is selectable
        element.style.pointerEvents = 'auto';
        element.style.userSelect = 'text';
        element.style.webkitUserSelect = 'text';
        // Ensure container doesn't block pointer events
        container.style.pointerEvents = 'auto';
        
        // Store original value from data attribute if not already set
        if (!element.getAttribute('data-original-value')) {
          const originalValue = getContentValue(key, currentLang);
          element.setAttribute('data-original-value', originalValue);
        }
        
        // Handle direct editing
        element.addEventListener('focus', () => {
          // Use box-shadow instead of outline to avoid layout shift
          element.style.boxShadow = 'inset 0 0 0 2px #007bff';
          element.style.backgroundColor = 'rgba(0, 123, 255, 0.05)';
          // Show edit button
          editBtn.style.visibility = 'visible';
          editBtn.style.display = 'block';
        });
        
        element.addEventListener('blur', (e) => {
          // Small delay to ensure content is captured before updating
          setTimeout(() => {
            element.style.boxShadow = 'none';
            element.style.backgroundColor = 'transparent';
            editBtn.style.visibility = 'hidden';
            editBtn.style.display = 'none';
            
            // Save changes - get the original value from data attribute
            const originalValue = element.getAttribute('data-original-value') || '';
            // Get the current content from the element
            // For contenteditable elements, we need to preserve HTML if it exists
            let newValue = '';
            
            // Get the raw innerHTML first
            const rawHTML = element.innerHTML || '';
            const rawText = (element.textContent || element.innerText || '').trim();
            
            // Check if the element has HTML content (not just plain text)
            if (rawHTML && rawHTML.trim() !== '' && rawHTML !== rawText) {
              // Has HTML structure, preserve it (but trim whitespace)
              newValue = rawHTML.trim();
            } else if (rawText !== '') {
              // Plain text content - if original had HTML, wrap it; otherwise keep as plain text
              if (originalValue && originalValue.includes('<') && originalValue.includes('>')) {
                // Original had HTML structure, wrap plain text in paragraph tags
                newValue = `<p>${rawText}</p>`;
              } else {
                // Keep as plain text
                newValue = rawText;
              }
            } else {
              // Empty content - preserve empty state but don't send empty string
              // Use a single space or minimal HTML to indicate empty but not null
              newValue = originalValue && originalValue.includes('<') ? '<p></p>' : '';
            }
            
            // Only save if value has actually changed (allow empty values too)
            // Compare trimmed values to detect actual changes
            const trimmedNewValue = newValue.trim();
            const trimmedOriginalValue = originalValue.trim();
            
            if (trimmedNewValue !== trimmedOriginalValue) {
              // Value has changed - always send it, even if it's empty (user might want to clear the field)
              // Update the data attribute with new value immediately (before updating innerHTML)
              element.setAttribute('data-original-value', String(newValue));
              
              // Update the element's innerHTML immediately to reflect the change
              // This ensures the visual update happens even if updateIframeContent skips it due to focus
              element.innerHTML = newValue;
              
              // Use postMessage to communicate with parent
              if (window.parent) {
                window.parent.postMessage({
                  type: 'CMS_CONTENT_UPDATE',
                  key: key,
                  value: String(newValue), // Ensure it's always a string (even if empty)
                  lang: currentLang
                }, '*');
              }
            }
          }, 100); // Small delay to ensure blur event completes
        });
        
        // Handle edit button click for rich text editing
        editBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          setEditingField(key);
        });
        
        // Also allow direct click to edit
        element.addEventListener('click', (e) => {
          // Only if not already focused
          if (doc.activeElement !== element) {
            element.focus();
          }
        });
      }
    });
    
    // Setup image editing
    const imageElements = doc.querySelectorAll('img[data-cms-key]');
    imageElements.forEach((img) => {
      const image = img as HTMLImageElement;
      const key = image.getAttribute('data-cms-key');
      
      if (key) {
        // Check if already wrapped
        if (image.parentElement?.classList.contains('cms-image-wrapper')) {
          return;
        }
        
        image.style.cursor = 'pointer';
        image.style.transition = 'opacity 0.2s, transform 0.2s';
        image.style.border = '2px dashed rgba(0, 123, 255, 0.3)';
        
        // Wrap image in container
        const container = doc.createElement('div');
        container.className = 'cms-image-wrapper';
        container.style.cssText = 'position: relative; display: inline-block; width: 100%;';
        
        image.parentNode?.insertBefore(container, image);
        container.appendChild(image);
        
        // Create overlay
        const overlay = doc.createElement('div');
        overlay.className = 'cms-image-overlay';
        overlay.innerHTML = '<div style="text-align: center;"><div style="font-size: 24px; margin-bottom: 8px;">📷</div><div>Click to Change Image</div></div>';
        overlay.style.cssText = `
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 123, 255, 0.8);
          display: none;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 16px;
          font-weight: bold;
          border-radius: 4px;
          cursor: pointer;
          z-index: 10;
        `;
        
        container.appendChild(overlay);
        
        // Show overlay on hover
        container.addEventListener('mouseenter', () => {
          overlay.style.display = 'flex';
          image.style.opacity = '0.6';
          image.style.transform = 'scale(1.02)';
          image.style.borderColor = '#007bff';
        });
        
        container.addEventListener('mouseleave', () => {
          overlay.style.display = 'none';
          image.style.opacity = '1';
          image.style.transform = 'scale(1)';
          image.style.borderColor = 'rgba(0, 123, 255, 0.3)';
        });
        
        // Handle click
        const handleImageClick = (e: Event) => {
          e.preventDefault();
          e.stopPropagation();
          
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.style.display = 'none';
          document.body.appendChild(input);
          
          input.onchange = (e: Event) => {
            const target = e.target as HTMLInputElement;
            const file = target.files?.[0];
            if (file) {
              if (file.size > MAX_SIZE_MB * 1024 * 1024) {
                showToast(`Image must be smaller than ${MAX_SIZE_MB}MB!`, "error");
                document.body.removeChild(input);
                return;
              }
              
              const reader = new FileReader();
              reader.onload = (event) => {
                const url = event.target?.result as string;
                const uploadFile: UploadFile = {
                  uid: `-${Date.now()}`,
                  name: file.name,
                  status: 'done',
                  url: url,
                  originFileObj: file,
                };
                onImageChange(key, [uploadFile]);
                showToast('Image uploaded successfully!', "success");
                image.src = url;
                image.style.borderColor = '#28a745';
                setTimeout(() => {
                  image.style.borderColor = 'rgba(0, 123, 255, 0.3)';
                }, 2000);
              };
              reader.onerror = () => {
                showToast('Error reading image file', "error");
              };
              reader.readAsDataURL(file);
              document.body.removeChild(input);
            }
          };
          
          input.click();
        };
        
        overlay.addEventListener('click', handleImageClick);
        image.addEventListener('click', handleImageClick);
      }
    });
  };

  // Update iframe when HTML content is loaded
  useEffect(() => {
    if (htmlContent && !isLoading && originalHtmlRef.current) {
      const updatedHtml = replaceContentInHtml(originalHtmlRef.current, currentLang);
      updateIframeContent(updatedHtml);
    }
  }, [htmlContent, isLoading, currentLang]);

  // Get field type from template config
  const getFieldType = (key: string): "text" | "richText" => {
    const field = template.fields.find(f => f.key === key);
    return field?.type === "richText" ? "richText" : "text";
  };

  return (
    <div className="html-template-editor flex flex-col h-full">
      {languageList.length > 1 && (
        <div className="mb-4 flex items-center justify-end">
          <Tabs
            activeKey={currentLang}
            type="card"
            size="small"
            onChange={(key) => setCurrentLang(key)}
            items={languageList.map((lang) => ({
              key: lang.code,
              label: lang.title,
            }))}
          />
        </div>
      )}
      
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Template Preview */}
        <div className="flex-1 border rounded-lg overflow-hidden bg-white flex flex-col min-h-0" style={{ height: 'calc(95vh - 200px)', minHeight: '600px' }}>
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading template...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Note: allow-same-origin + allow-scripts is required for iframe content editing.
                  This is safe as the iframe only loads local template files. */}
              <iframe
                ref={iframeRef}
                srcDoc={iframeInitializedRef.current ? initialSrcDocRef.current : (initialSrcDocRef.current || replaceContentInHtml(originalHtmlRef.current || htmlContent, currentLang))}
                style={{ width: '100%', height: '100%', border: 'none', flex: 1, minHeight: '600px' }}
                title="Template Preview"
                sandbox="allow-same-origin allow-scripts allow-forms"
                className="w-full h-full"
                onLoad={() => {
                  if (iframeRef.current && !iframeInitializedRef.current) {
                    const iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
                    if (iframeDoc) {
                      iframeInitializedRef.current = true;
                      // Store the initial srcDoc to prevent reloads
                      if (!initialSrcDocRef.current) {
                        initialSrcDocRef.current = replaceContentInHtml(originalHtmlRef.current || htmlContent, currentLang);
                      }
                      setTimeout(() => {
                        setupEditableElements(iframeDoc);
                      }, 1500);
                    }
                  }
                }}
              />
            </>
          )}
        </div>

        {/* CKEditor Panel for Editing */}
        {editingField && (
          <div className="w-96 border rounded-lg bg-white dark:bg-gray-900 p-4 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Edit: {template.fields.find(f => f.key === editingField)?.label || editingField}
              </h3>
              <Button
                size="small"
                onClick={() => setEditingField(null)}
                className="flex items-center"
              >
                ✕ Close
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {/* Always use CKEditor for rich text editing (bold, font size, etc.) */}
              <CKEditor
                keyName={`${editingField}-${currentLang}`}
                value={getContentValue(editingField, currentLang)}
                setValue={(_key, value) => {
                  // Ensure value is a string
                  const stringValue = typeof value === 'string' ? value : String(value || '');
                  const current = content[editingField] || {};
                  // Ensure current is an object with string values
                  const cleanedCurrent: Record<string, string> = {};
                  if (typeof current === 'object' && current !== null && !Array.isArray(current)) {
                    Object.entries(current).forEach(([langCode, val]) => {
                      if (typeof val === 'string') {
                        cleanedCurrent[langCode] = val;
                      } else if (typeof val === 'object' && val !== null) {
                        // Handle double nesting
                        const actualValue = Object.values(val)[0];
                        cleanedCurrent[langCode] = typeof actualValue === 'string' ? actualValue : String(actualValue || '');
                      } else {
                        cleanedCurrent[langCode] = String(val || '');
                      }
                    });
                  }
                  onContentChange(editingField, { ...cleanedCurrent, [currentLang]: stringValue }, currentLang);
                }}
              />
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <Button
                type="primary"
                onClick={() => setEditingField(null)}
                className="w-full"
              >
                Save & Close
              </Button>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <strong>How to edit:</strong> Hover over any text element and click the "Edit" button to open CKEditor. 
          Click on images to upload new ones. Changes are saved automatically.
        </p>
      </div>
    </div>
  );
};

export default HtmlTemplateEditor;
