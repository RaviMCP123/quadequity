import { useEffect } from "react";
import type { FilterValue, SorterResult } from "antd/es/table/interface";

type TableStatePayload<TFilter, TRecord> = {
  tableFilter: TFilter | null;
  filteredInfo: Record<string, FilterValue | null>;
  sortedInfo: SorterResult<TRecord>;
  filter: boolean;
};

type TableStateParams<TFilter, TRecord> = {
  storageKey: string;
  tableFilter: TFilter | null;
  setTableFilter: (value: TFilter | null) => void;
  filteredInfo: Record<string, FilterValue | null>;
  setFilteredInfo: (value: Record<string, FilterValue | null>) => void;
  sortedInfo: SorterResult<TRecord>;
  setSortedInfo: (value: SorterResult<TRecord>) => void;
  filter: boolean;
  setFilter: (value: boolean) => void;
};

const hasKeys = (value?: unknown) =>
  Boolean(value && typeof value === "object" && Object.keys(value).length > 0);

// Sanitize sortedInfo to only include serializable properties
const sanitizeSortedInfo = <TRecord>(
  sortedInfo: SorterResult<TRecord> | null
): SorterResult<TRecord> | null => {
  if (!sortedInfo || !sortedInfo.columnKey) return null;
  return {
    columnKey: sortedInfo.columnKey,
    order: sortedInfo.order || null,
    field: sortedInfo.field as string | undefined,
  } as SorterResult<TRecord>;
};

const useTableStatePersistence = <
  TFilter extends object,
  TRecord = unknown
>({
  storageKey,
  tableFilter,
  setTableFilter,
  filteredInfo,
  setFilteredInfo,
  sortedInfo,
  setSortedInfo,
  filter,
  setFilter,
}: TableStateParams<TFilter, TRecord>) => {
  // Restore from storage only when storageKey changes (e.g. mount). Do not
  // depend on setState functions to avoid infinite loops when callers pass
  // inline wrappers (React setState identity is stable).
  useEffect(() => {
    const savedState = sessionStorage.getItem(storageKey);
    if (!savedState) return;
    try {
      const parsed = JSON.parse(savedState) as TableStatePayload<TFilter, TRecord>;
      if (parsed?.tableFilter) {
        setTableFilter(parsed.tableFilter);
      }
      if (parsed?.filteredInfo) {
        setFilteredInfo(parsed.filteredInfo);
      }
      if (parsed?.sortedInfo && parsed.sortedInfo.columnKey) {
        setSortedInfo(parsed.sortedInfo as SorterResult<TRecord>);
      }
      if (parsed?.filter || parsed?.tableFilter || hasKeys(parsed?.filteredInfo)) {
        setFilter(true);
      }
    } catch {
      sessionStorage.removeItem(storageKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- setters are stable; omit to avoid consumer-driven loops
  }, [storageKey]);

  useEffect(() => {
    const hasState =
      filter || hasKeys(tableFilter || undefined) || hasKeys(filteredInfo) || hasKeys(sortedInfo);
    if (!hasState) return;
    const sanitizedSortedInfo = sanitizeSortedInfo(sortedInfo);
    const payload: TableStatePayload<TFilter, TRecord> = {
      tableFilter,
      filteredInfo,
      sortedInfo: sanitizedSortedInfo as SorterResult<TRecord>,
      filter,
    };
    sessionStorage.setItem(storageKey, JSON.stringify(payload));
  }, [storageKey, tableFilter, filteredInfo, sortedInfo, filter]);

  const persistState = () => {
    const sanitizedSortedInfo = sanitizeSortedInfo(sortedInfo);
    const payload: TableStatePayload<TFilter, TRecord> = {
      tableFilter,
      filteredInfo,
      sortedInfo: sanitizedSortedInfo as SorterResult<TRecord>,
      filter,
    };
    sessionStorage.setItem(storageKey, JSON.stringify(payload));
  };

  const clearState = () => {
    sessionStorage.removeItem(storageKey);
  };

  return { persistState, clearState };
};

export default useTableStatePersistence;
