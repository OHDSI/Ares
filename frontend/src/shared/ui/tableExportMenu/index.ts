import TableExportMenu from "./TableExportMenu.vue";

export type ExportColumn = {
  field: string;
  header: string;
  format?: (v: unknown) => string;
};

export type ColDef = {
  key: string;
  label: string;
  align?: "start" | "end";
  format?: (v: unknown) => string;
  censored?: boolean;
};

export default TableExportMenu;
