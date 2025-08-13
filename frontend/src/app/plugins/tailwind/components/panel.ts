export default {
  root: {
    class: [
      //positioning

      "flex",
      "flex-col",
      "justify-between",
      //Shape
      "rounded-lg",
      "shadow-md",

      //Color
      "bg-surface-0 dark:bg-surface-800",
      "text-surface-700 dark:text-surface-0/80",
    ],
  },
  header: {
    class: [
      "flex items-center justify-between",
      "rounded-tl-lg rounded-tr-lg bg-gray-100 dark:text-white text-black dark:border-surface-700 dark:bg-surface-700 p-2",
    ],
  },
  body: {
    class: "py-5",
  },
  title: {
    class: "text-lg uppercase font-medium md:px-4",
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
    class: [
      "rounded-bl-lg rounded-br-lg bg-gray-100 dark:text-white text-black dark:border-surface-700 dark:bg-surface-700 p-2 relative bottom-0",
    ],
  },
};
