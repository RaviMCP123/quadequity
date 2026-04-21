import React, { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";

interface DraggableRowProps {
  index: number;
  moveRow: (dragIndex: number, hoverIndex: number) => void;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  [key: string]: unknown;
}

interface DragItem {
  index: number;
  type: string;
}

const type = "DraggableBodyRow";

const DraggableRow: React.FC<DraggableRowProps> = ({
  index,
  moveRow,
  className,
  style,
  ...restProps
}) => {
  const ref = useRef<HTMLTableRowElement>(null);
  
  const [{ isOver, dropClassName }, drop] = useDrop<
    DragItem,
    void,
    { isOver: boolean; dropClassName: string }
  >({
    accept: type,
    collect: (monitor) => {
      const { index: dragIndex } = monitor.getItem() || {};
      if (dragIndex === index) {
        return { isOver: false, dropClassName: "" };
      }
      return {
        isOver: monitor.isOver(),
        dropClassName:
          dragIndex < index ? " drop-over-downward" : " drop-over-upward",
      };
    },
    drop: (item: DragItem) => {
      moveRow(item.index, index);
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drop(drag(ref));

  return (
    <tr
      ref={ref}
      className={`${className || ""}${isOver ? dropClassName : ""}`}
      style={{ cursor: "move", opacity: isDragging ? 0.5 : 1, ...style }}
      {...restProps}
    />
  );
};

export default DraggableRow;
