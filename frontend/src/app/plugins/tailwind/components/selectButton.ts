export default {
  root: ({ props }) => ({
    class: [
      "inline-flex select-none align-bottom",
      "bg-black/[0.04] dark:bg-white/[0.06]",
      "rounded-md p-1 gap-0.5",
      {
        "ring-1 ring-red-500 dark:ring-red-400": props.invalid,
      },
    ],
  }),
  button: ({ context }) => ({
    class: [
      "inline-flex items-center justify-center cursor-pointer select-none",
      "px-3 py-1.5",
      "rounded",
      "border-0 outline-none",
      "transition-all duration-150",
      {
        "bg-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200":
          !context.active && !context.disabled,
        "bg-white dark:bg-surface-700 text-slate-700 dark:text-slate-200 shadow-sm":
          context.active,
        "opacity-50 cursor-default pointer-events-none": context.disabled,
      },
    ],
  }),
  label: ({ context }) => ({
    class: [
      "pointer-events-none",
      {
        "font-semibold": context.active,
        "font-medium": !context.active,
      },
    ],
  }),
};
