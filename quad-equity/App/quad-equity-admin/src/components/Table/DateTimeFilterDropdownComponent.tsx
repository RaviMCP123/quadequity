import type { FilterDropdownProps } from "antd/es/table/interface";
import DateTimeFilterDropdown from "./DateTimeFilter";

const DateTimeFilterDropdownComponent: React.FC<FilterDropdownProps> = (props) => (
  <DateTimeFilterDropdown {...props} />
);

export default DateTimeFilterDropdownComponent;
