import { useSelector } from "react-redux";
import { RootState } from "store";

const HeaderCell: React.FC<React.HTMLAttributes<HTMLTableCellElement>> = (
  props
) => {
  const { theme } = useSelector((state: RootState) => state.theme);
  const isLight = theme === "light";
  return (
    <th
      {...props}
      style={{
        fontSize: "14px",
        height: "40px",
        border: "1px solid var(--color-brand-800)",
        backgroundColor: isLight
          ? "var(--color-brand-900)"
          : "var(--color-brand-950)",
        color: "var(--color-brand-25)",
        whiteSpace: "nowrap",
        ...props.style,
      }}
    />
  );
};

export default HeaderCell;
