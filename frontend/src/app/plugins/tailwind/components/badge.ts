export default {
  root: ({ props }) => ({
    class: [
      // Font
      "font-bold",
      {
        "text-xs leading-[1.5rem]": props.size == null,
        "text-lg leading-[2.25rem]": props.size == "large",
        "text-2xl leading-[3rem]": props.size == "xlarge",
      },

      // Alignment
      "text-center inline-block",

      // Size
      "px-2",
      {
        "min-w-[1.5rem] h-[1.5rem]": props.size == null,
        "min-w-[2.25rem] h-[2.25rem]": props.size == "large",
        "min-w-[3rem] h-[3rem]": props.size == "xlarge",
      },

      // Shape
      "rounded-full",

      // Color
      "text-white",
      {
        "bg-primary-500 dark:bg-primary-400":
          props.severity == null || props.severity == "primary",
        "bg-surface-500 dark:bg-surface-400": props.severity == "secondary",
        "bg-green-500 dark:bg-green-400": props.severity == "success",
        "bg-blue-600 dark:bg-blue-500": props.severity == "info",
        "bg-orange-500 dark:bg-orange-400": props.severity == "warning",
        "bg-purple-500 dark:bg-purple-400": props.severity == "help",
        "bg-red-500 dark:bg-red-400": props.severity == "danger",
      },
    ],
  }),
};
