import { useSelector } from "react-redux";
import { RootState } from "store";

const BodyCell: React.FC<React.HTMLAttributes<HTMLTableCellElement>> = (
  props
) => {
  const { theme } = useSelector((state: RootState) => state.theme);
  return (
    <td
      {...props}
      style={{
        fontSize: "13px",
        border: `0.1px solid ${
          theme === "light" ? "var(--color-brand-200)" : "#ffffff34"
        }`,
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
        color: theme === "light" ? "#000" : "#fff",
        backgroundColor: theme === "light" ? "#fff" : "#171f2f",
        ...props.style,
      }}
    />
  );
};

export default BodyCell;
