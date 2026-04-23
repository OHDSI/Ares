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
      {
        "border-0 dark:border dark:border-surface-700": props.modal,
        "shadow-[-4px_0_20px_rgba(0,0,0,0.10)] dark:shadow-[-4px_0_20px_rgba(0,0,0,0.4)]":
          props.modal,
      },

      // Colors
      "bg-surface-0 dark:bg-surface-900",
      "text-surface-700 dark:text-white/80",
      "dark:border-surface-700",

      // Transitions handled via passthrough transition key

      // Misc
      "pointer-events-auto",
    ],
  }),
  header: {
    class: [
      "flex items-center justify-between",
      "shrink-0",
      "px-5 py-4",
      "bg-surface-0 dark:bg-surface-900",
      "text-surface-700 dark:text-surface-0/80",
    ],
  },
  title: {
    class: ["text-xs font-semibold uppercase tracking-widest opacity-50"],
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
      "transition-all",
      "duration-300",
      "[transition-timing-function:cubic-bezier(0.16,1,0.3,1)]",
      { "p-5": !props.position == "full" },

      // Background and Effects
      {
        "bg-surface-200/75 dark:bg-black/80": props.modal,
        "border-none": props.modal,
      },
      // For Dark Mode
      // { "bg-gray-900/98": props.modal, "shadow-2xl": props.modal },
    ],
  }),
  transition: ({ props }) => {
    const enter =
      "transition-all duration-[450ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]";
    const leave = "transition-all duration-200 ease-in";
    return props.position === "top"
      ? {
          enterFromClass: "-translate-y-full opacity-0",
          enterActiveClass: enter,
          leaveActiveClass: leave,
          leaveToClass: "-translate-y-full opacity-0",
        }
      : props.position === "bottom"
      ? {
          enterFromClass: "translate-y-full opacity-0",
          enterActiveClass: enter,
          leaveActiveClass: leave,
          leaveToClass: "translate-y-full opacity-0",
        }
      : props.position === "left"
      ? {
          enterFromClass: "-translate-x-full opacity-0",
          enterActiveClass: enter,
          leaveActiveClass: leave,
          leaveToClass: "-translate-x-full opacity-0",
        }
      : props.position === "right"
      ? {
          enterFromClass: "translate-x-full opacity-0",
          enterActiveClass: enter,
          leaveActiveClass: leave,
          leaveToClass: "translate-x-full opacity-0",
        }
      : props.position === "full"
      ? {
          enterFromClass: "scale-95 opacity-0",
          enterActiveClass: enter,
          leaveActiveClass: leave,
          leaveToClass: "scale-95 opacity-0",
        }
      : {
          enterFromClass: "opacity-0",
          enterActiveClass: enter,
          leaveActiveClass: leave,
          leaveToClass: "opacity-0",
        };
  },
};
