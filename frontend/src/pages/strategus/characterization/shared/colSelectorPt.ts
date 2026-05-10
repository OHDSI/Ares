export const colSelectorPt = {
  root: {
    class: [
      "inline-flex relative cursor-pointer select-none",
      "rounded-md transition-all duration-200",
      "bg-white dark:bg-surface-800",
      "shadow-sm",
      "border border-surface-300 dark:border-surface-500",
      "hover:border-primary-400 dark:hover:border-primary-300",
    ].join(" "),
  },
  labelContainer: { class: "overflow-hidden flex flex-auto cursor-pointer" },
  label: {
    class: [
      "flex flex-wrap gap-1 items-center",
      "py-1.5 px-2.5 min-h-[2rem]",
      "text-sm text-surface-700 dark:text-white/80",
    ].join(" "),
  },
  token: {
    class: [
      "inline-flex items-center gap-1",
      "px-2 py-0.5 rounded",
      "text-xs font-medium",
      "bg-[var(--color-badge-bg)]",
      "text-[var(--color-text-muted)]",
      "border border-[var(--color-badge-border)]",
    ].join(" "),
  },
  removeTokenIcon: { class: "w-3 h-3 ml-0.5 opacity-50 hover:opacity-100" },
  trigger: { class: "hidden" },
} as const;
