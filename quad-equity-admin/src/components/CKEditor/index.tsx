import React from "react";
import {
  HtmlEditor,
  Image,
  Inject,
  Link,
  QuickToolbar,
  RichTextEditorComponent,
  Toolbar,
} from "@syncfusion/ej2-react-richtexteditor";

import "@syncfusion/ej2-base/styles/tailwind3.css";
import "@syncfusion/ej2-icons/styles/tailwind3.css";
import "@syncfusion/ej2-buttons/styles/tailwind3.css";
import "@syncfusion/ej2-splitbuttons/styles/tailwind3.css";
import "@syncfusion/ej2-inputs/styles/tailwind3.css";
import "@syncfusion/ej2-lists/styles/tailwind3.css";
import "@syncfusion/ej2-navigations/styles/tailwind3.css";
import "@syncfusion/ej2-popups/styles/tailwind3.css";
import "@syncfusion/ej2-richtexteditor/styles/tailwind3.css";

interface MyEditorProps {
  keyName: string;
  value: string;
  setValue: (key: string, value: string) => void;
}

const toolbarSettings = {
  items: [
    "Bold",
    "Italic",
    "Underline",
    "StrikeThrough",
    "|",
    "FontName",
    "FontSize",
    "FontColor",
    "BackgroundColor",
    "|",
    "Formats",
    "Alignments",
    "|",
    "OrderedList",
    "UnorderedList",
    "Outdent",
    "Indent",
    "|",
    "CreateLink",
    "Image",
    "|",
    "ClearFormat",
    "|",
    "SourceCode",
    "FullScreen",
    "|",
    "Undo",
    "Redo",
  ],
};

const quickToolbarSettings = {
  image: [
    "Replace",
    "Align",
    "Caption",
    "Remove",
    "InsertLink",
    "OpenImageLink",
    "-",
    "EditImageLink",
    "RemoveImageLink",
    "Display",
    "AltText",
    "Dimension",
  ],
  link: ["Open", "Edit", "UnLink"],
};

const MyEditor: React.FC<MyEditorProps> = ({ keyName, value, setValue }) => {
  // Ensure value is always a string (Syncfusion requires string, not object)
  const stringValue = React.useMemo(() => {
    if (typeof value === 'string') {
      return value;
    }
    if (typeof value === 'object' && value !== null) {
      // If it's an object, try to extract a string value
      const firstValue = Object.values(value)[0];
      return typeof firstValue === 'string' ? firstValue : String(value || '');
    }
    return String(value || '');
  }, [value]);

  const handleChange = (args: { value: string }) => {
    setValue(keyName, args.value);
  };

  return (
    <div className="editor-container">
      <RichTextEditorComponent
        key={keyName}
        value={stringValue}
        toolbarSettings={toolbarSettings}
        quickToolbarSettings={quickToolbarSettings}
        change={handleChange}
      >
        <Inject services={[Toolbar, Image, Link, HtmlEditor, QuickToolbar]} />
      </RichTextEditorComponent>
    </div>
  );
};

export default MyEditor;
