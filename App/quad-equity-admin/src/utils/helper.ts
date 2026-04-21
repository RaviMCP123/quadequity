export const truncateText = (text: string, maxLength: number = 20): string => {
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};



