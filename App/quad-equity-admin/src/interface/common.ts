export interface Pagination {
  total: number;
  page: number;
  currentPage: number;
  limit: number;
}

export interface ThemeState {
  theme: string;
}

export interface HighlighterInterface {
  search: string[];
  text: string;
}

export interface TitleProps {
  title: string;
}

export interface ActionButtonProps {
  onEditAction?: () => void;
  onDeleteAction?: () => void;
  onViewAction?: () => void;
  onCopyAction?: () => void;
  onRiskAssessmentAction?: () => void;
  onAvailabilityAction?: () => void;
  isDelete?: boolean;
  isDeleteDisabled?: boolean;
  isEdit?: boolean;
  isView?: boolean;
  availability?: boolean;
  deleteTooltip?: string;
  deleteConfirmTitle?: string;
  showDeleteConfirm?: boolean;
}

export interface SwitchInterface {
  isChecked: boolean;
  onChange: (checked: boolean) => void;
}

export interface StatusInterface {
  id?: string;
  status: boolean;
}

export interface FindDetailsInterface {
  params: { id: string };
  onClose: () => void;
}

export interface FindDetailsInterface {
  params: { id: string };
  onClose: () => void;
}

export interface Language {
  code: string;   
  title: string;  
}
