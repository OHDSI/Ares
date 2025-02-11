export interface DataTableHeader {
  key: string;
  title: string;
  colspan?: number;
  rowspan?: number;
  fixed?: boolean;
  align?: string;
  width?: number;
  minWidth?: string;
  maxWidth?: string;
  sortable?: boolean;
  show?: boolean;
  default?: boolean | undefined;
}
