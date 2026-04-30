export default {
  root: {
    class: [
      //positioning

      "flex",
      "flex-col",
      "justify-between",
      "rounded-lg",
      "border-[1.5px] border-[var(--color-border)]",
      "shadow-[0_2px_8px_rgba(0,0,0,0.07)]",
      "bg-[var(--color-bg-surface)]",
      "text-surface-700 dark:text-surface-0/80",
    ],
  },
  header: {
    class: [
      "flex items-center justify-between",
      "rounded-tl-lg rounded-tr-lg p-2",
    ],
  },
  body: {
    class: "py-5",
  },
  title: {
    class: "text-lg uppercase font-normal tracking-wide md:px-4",
  },
  subtitle: {
    class: [
      //Spacing
      "mb-1 px-5 md:px-6",

      //Color
      "text-surface-600 dark:text-surface-0/60",
    ],
  },
  content: {
    class: "py-6 px-5 md:px-6",
  },
  footer: {
    class: ["rounded-bl-lg rounded-br-lg p-2 relative bottom-0"],
  },
};
