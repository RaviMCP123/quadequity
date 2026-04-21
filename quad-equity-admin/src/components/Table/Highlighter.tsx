import React from 'react';
import Highlighter from 'react-highlight-words';
import { HighlighterInterface } from '../../interface/common';

const HighlighterFilter: React.FC<HighlighterInterface> = ({
  search,
  text,
}) => {
  const str = String(text ?? "");
  if (search.length === 0) {
    return <>{str}</>;
  }
  return (
    <Highlighter
      highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
      searchWords={search}
      autoEscape
      textToHighlight={str}
    />
  );
};

export default HighlighterFilter;
