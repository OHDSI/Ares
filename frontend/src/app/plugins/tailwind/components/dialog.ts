export default {
  root: ({ state }) => ({
    class: [
      // Shape
      "rounded-lg",
      "shadow-xl",
      "border",
      "border-surface-200",
      "dark:border-surface-700",

      // Size
      "max-h-[90vh]",
      "m-0",

      // Colors
      "bg-surface-0",
      "dark:bg-surface-800",

      // Transitions
      "transform",
      "scale-100",

      // Maximized State
      {
        "transition-none": state.maximized,
        "transform-none": state.maximized,
        "!w-screen": state.maximized,
        "!h-screen": state.maximized,
        "!max-h-full": state.maximized,
        "!top-0": state.maximized,
        "!left-0": state.maximized,
      },
    ],
  }),
  header: {
    class: [
      "flex items-center justify-between",
      "shrink-0",
      "px-5",
      "py-4",
      "border-b",
      "border-surface-200",
      "dark:border-surface-700",
      "rounded-tl-lg",
      "rounded-tr-lg",
      "bg-surface-0",
      "dark:bg-surface-800",
    ],
  },
  title: {
    class: ["font-semibold text-sm tracking-wide"],
  },
  icons: {
    class: ["flex items-center"],
  },
  closeButton: {
    class: [
      "relative",
      "flex items-center justify-center",
      "w-7 h-7",
      "border-0",
      "rounded-md",
      "bg-transparent",
      "text-surface-400 dark:text-surface-400",
      "hover:text-surface-600 dark:hover:text-surface-200",
      "hover:bg-surface-100 dark:hover:bg-surface-700",
      "transition duration-150 ease-in-out",
      "cursor-pointer",
      "overflow-hidden",
      "focus:outline-none",
    ],
  },
  maximizablebutton: {
    class: [
      "relative",

      // Flexbox and Alignment
      "flex items-center justify-center",

      // Size and Spacing
      "mr-2",
      "last:mr-0",
      "w-8 h-8",

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
      "w-4",
      "h-4",
    ],
  },
  maximizableicon: {
    class: [
      // Display
      "inline-block",

      // Size
      "w-4",
      "h-4",
    ],
  },
  content: ({ state, instance }) => ({
    class: [
      "h-full",
      "overflow-y-auto",
      {
        grow: state.maximized,
        "rounded-bl-lg": !instance.$slots.footer,
        "rounded-br-lg": !instance.$slots.footer,
      },
      "bg-surface-0 dark:bg-surface-800",
      "text-surface-700 dark:text-surface-0/80",
    ],
  }),
  footer: {
    class: [
      "flex items-center justify-between",
      "shrink-0",
      "gap-2",
      "px-5",
      "py-3",
      "border-t",
      "border-surface-200",
      "dark:border-surface-700",
      "rounded-bl-lg",
      "rounded-br-lg",
      "bg-surface-0 dark:bg-surface-800",
      "text-surface-700 dark:text-surface-0/80",
    ],
  },
  mask: ({ props, state }) => ({
    class: [
      // Transitions
      "transition",
      "duration-200",
      { "p-5": !state.maximized },

      // Background and Effects
      { "bg-black/40": props.modal, "backdrop-blur-sm": props.modal },
    ],
  }),
  transition: ({ props }) => {
    return props.position === "top"
      ? {
          enterFromClass:
            "opacity-0 scale-75 translate-x-0 -translate-y-full translate-z-0",
          enterActiveClass: "transition-all duration-200 ease-out",
          leaveActiveClass: "transition-all duration-200 ease-out",
          leaveToClass:
            "opacity-0 scale-75 translate-x-0 -translate-y-full translate-z-0",
        }
      : props.position === "bottom"
        ? {
            enterFromClass: "opacity-0 scale-75 translate-y-full",
            enterActiveClass: "transition-all duration-200 ease-out",
            leaveActiveClass: "transition-all duration-200 ease-out",
            leaveToClass:
              "opacity-0 scale-75 translate-x-0 translate-y-full translate-z-0",
          }
        : props.position === "left" ||
            props.position === "topleft" ||
            props.position === "bottomleft"
          ? {
              enterFromClass:
                "opacity-0 scale-75 -translate-x-full translate-y-0 translate-z-0",
              enterActiveClass: "transition-all duration-200 ease-out",
              leaveActiveClass: "transition-all duration-200 ease-out",
              leaveToClass:
                "opacity-0 scale-75  -translate-x-full translate-y-0 translate-z-0",
            }
          : props.position === "right" ||
              props.position === "topright" ||
              props.position === "bottomright"
            ? {
                enterFromClass:
                  "opacity-0 scale-75 translate-x-full translate-y-0 translate-z-0",
                enterActiveClass: "transition-all duration-200 ease-out",
                leaveActiveClass: "transition-all duration-200 ease-out",
                leaveToClass:
                  "opacity-0 scale-75 opacity-0 scale-75 translate-x-full translate-y-0 translate-z-0",
              }
            : {
                enterFromClass: "opacity-0 scale-75",
                enterActiveClass: "transition-all duration-200 ease-out",
                leaveActiveClass: "transition-all duration-200 ease-out",
                leaveToClass: "opacity-0 scale-75",
              };
  },
};
