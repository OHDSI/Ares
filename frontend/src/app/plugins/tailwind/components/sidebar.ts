export default {
  root: ({ props }) => ({
    class: [
      // Flexbox
      "flex flex-col",

      // Position
      "relative",
      {
        "!transition-transform !duration-500 !ease-out !transform !translate-y-0 !w-screen !h-screen !max-h-full !top-0 !left-0":
          props.position === "full",
      },

      // Size
      {
        "h-full w-1/3": props.position == "left" || props.position == "right",
        "w-full": props.position == "top" || props.position == "bottom",
      },

      // Shape
      "border-0 dark:border",
      "shadow-lg",

      // Colors
      "bg-surface-0 dark:bg-surface-900",
      "text-surface-700 dark:text-white/80",
      "dark:border-surface-700",

      // Transitions
      "transition-transform",
      "duration-300",

      // Misc
      "pointer-events-auto",
    ],
  }),
  header: {
    class: [
      // Flexbox and Alignment
      "flex items-center justify-between",
      "shrink-0",

      // Spacing
      "p-5",

      // Colors
      "bg-surface-0 dark:bg-surface-900",
      "text-surface-700 dark:text-surface-0/80",
    ],
  },
  title: {
    class: ["font-bold text-lg"],
  },
  icons: {
    class: ["flex items-center"],
  },
  closeButton: {
    class: [
      "relative",

      // Flexbox and Alignment
      "flex items-center justify-center",

      // Size and Spacing
      "mr-2",
      "last:mr-0",
      "w-10 h-10",

      // Shape
      "border-0",
      "rounded-full",

      // Colors
      "text-surface-500",
      "bg-transparent",

      // Transitions
      "transition duration-200 ease-in-out",

      // States
      "hover:text-surface-700 dark:hover:text-white/80",
      "hover:bg-surface-100 dark:hover:bg-surface-800/80",
      "focus:outline-none focus:outline-offset-0 focus:ring focus:ring-inset",
      "focus:ring-primary-400/50 dark:focus:ring-primary-300/50",

      // Misc
      "overflow-hidden",
    ],
  },
  closeButtonIcon: {
    class: [
      // Display
      "inline-block",

      // Size
      "w-16",
      "h-16",
    ],
  },
  content: {
    class: [
      // Spacing and Size
      "p-5",
      "pt-0",
      "h-full",
      "w-full",

      // Growth and Overflow
      "grow",
      "overflow-y-auto",
    ],
  },
  mask: ({ props }) => ({
    class: [
      // Transitions
      "transition",
      "duration-200",
      { "p-5": !props.position == "full" },

      // Background and Effects
      { "bg-black/40": props.modal, "backdrop-blur-sm": props.modal },
    ],
  }),
  transition: ({ props }) => {
    return props.position === "top"
      ? {
          enterFromClass: "translate-x-0 -translate-y-full translate-z-0",
          leaveToClass: "translate-x-0 -translate-y-full translate-z-0",
        }
      : props.position === "bottom"
      ? {
          enterFromClass: "translate-x-0 translate-y-full translate-z-0",
          leaveToClass: "translate-x-0 translate-y-full translate-z-0",
        }
      : props.position === "left"
      ? {
          enterFromClass: "-translate-x-full translate-y-0 translate-z-0",
          leaveToClass: "-translate-x-full translate-y-0 translate-z-0",
        }
      : props.position === "right"
      ? {
          enterFromClass: "translate-x-full translate-y-0 translate-z-0",
          leaveToClass: "translate-x-full translate-y-0 translate-z-0",
        }
      : props.position === "full"
      ? {
          enterFromClass: "scale-95 opacity-0",
          enterToClass: "scale-100 opacity-100",
          enterActiveClass: "transition-all duration-500 ease-out",
          leaveFromClass: "scale-100 opacity-100",
          leaveToClass: "scale-90 opacity-0",
          leaveActiveClass: "transition-all duration-500 ease-in",
        }
      : {
          enterFromClass: "opacity-0",
          enterActiveClass: "transition-opacity duration-400 ease-in",
          leaveActiveClass: "transition-opacity duration-400 ease-in",
          leaveToClass: "opacity-0",
        };
  },
};
