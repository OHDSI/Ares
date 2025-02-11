export default {
  root: ({ state }) => ({
    class: [
      // Shape
      "rounded-md",
      "shadow-lg",
      "border-0",

      // Size
      "max-h-[90vh]",
      "m-0",

      // Color
      "dark:border",
      "dark:border-surface-700",

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
      // Flexbox and Alignment
      "shrink-0",
      "text-center",

      // Spacing
      "p-3",

      // Shape
      "border-t-0",
      "rounded-tl-md",
      "rounded-tr-md",

      // Colors
      "bg-primary-500 dark:bg-primary-400",
      "text-white dark:text-surface-0/80",
    ],
  },
  title: {
    class: ["font-bold text-lg text-center uppercase"],
  },
  icons: {
    class: ["flex items-center"],
  },
  closeButton: {
    class: ["hidden"],
    // class: [
    //   "relative",
    //
    //   // Flexbox and Alignment
    //   "flex items-center justify-center",
    //
    //   // Size and Spacing
    //   "mr-2",
    //   "last:mr-0",
    //   "w-8 h-8",
    //
    //   // Shape
    //   "border-0",
    //   "rounded-full",
    //
    //   // Colors
    //   "text-surface-500",
    //   "bg-transparent",
    //
    //   // Transitions
    //   "transition duration-200 ease-in-out",
    //
    //   // States
    //   "hover:text-surface-700 dark:hover:text-white/80",
    //   "hover:bg-surface-100 dark:hover:bg-surface-800/80",
    //   "focus:outline-none focus:outline-offset-0 focus:ring focus:ring-inset",
    //   "focus:ring-primary-400/50 dark:focus:ring-primary-300/50",
    //
    //   // Misc
    //   "overflow-hidden",
    // ],
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
      // Spacing
      "h-full",
      "p-1",

      // Shape
      {
        grow: state.maximized,
        "rounded-bl-md": !instance.$slots.footer,
        "rounded-br-md": !instance.$slots.footer,
      },

      // Colors
      "bg-surface-0 dark:bg-surface-800",
      "text-surface-700 dark:text-surface-0/80",

      // Misc
      "overflow-y-auto",
    ],
  }),
  footer: {
    class: [
      // Flexbox and Alignment
      "flex items-center justify-end",
      "shrink-0",
      "text-right",
      "gap-2",

      // Spacing
      "px-6",
      "pb-6",

      // Shape
      "border-t-0",
      "rounded-b-md",

      // Colors
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
