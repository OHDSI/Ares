export default {
  root: ({ context }) => ({
    class: [
      "text-normal",
      "p-4",
      "border border-surface-300 dark:border-surface-600",
      "bg-surface-0 dark:bg-surface-800",
      "rounded-md",
      "focus:outline-none focus:outline-offset-0 focus:ring focus:ring-primary-400/50 dark:focus:ring-primary-300/50",
      {
        "hover:border-primary-500 dark:hover:border-primary-400":
          !context.disabled,
        "focus:outline-none focus:outline-offset-0 focus:ring focus:ring-primary-500/50 dark:focus:ring-primary-400/50":
          !context.disabled,
        "opacity-60 select-none pointer-events-none cursor-default":
          context.disabled,
      },
      "appearance-none",
      "transition-colors duration-200",
    ],
  }),
};
