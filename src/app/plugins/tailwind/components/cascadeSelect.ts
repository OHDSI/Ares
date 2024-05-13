export default {
  root: ({ props, state, parent }) => ({
    class: [
      // Display and Position
      "inline-flex",
      "relative",

      // Shape
      { "rounded-md": parent.instance.$name !== "InputGroup" },
      {
        "first:rounded-l-md rounded-none last:rounded-r-md":
          parent.instance.$name == "InputGroup",
      },
      {
        "border-0 border-y border-l last:border-r":
          parent.instance.$name == "InputGroup",
      },
      {
        "first:ml-0 ml-[-1px]":
          parent.instance.$name == "InputGroup" && !props.showButtons,
      },

      // Color and Background
      "bg-surface-0 dark:bg-surface-800",

      "border border-surface-300",
      { "dark:border-surface-700": parent.instance.$name != "InputGroup" },
      { "dark:border-surface-600": parent.instance.$name == "InputGroup" },
      { "border-surface-300 dark:border-surface-600": !props.invalid },

      // Invalid State
      { "border-red-500 dark:border-red-400": props.invalid },

      // Transitions
      "transition-all",
      "duration-200",

      // States
      {
        "hover:border-primary-500 dark:hover:border-primary-300":
          !props.invalid,
      },
      {
        "outline-none outline-offset-0 ring ring-primary-400/50 dark:ring-primary-300/50":
          state.focused,
      },

      // Misc
      "cursor-pointer",
      "select-none",
      {
        "opacity-60": props.disabled,
        "pointer-events-none": props.disabled,
        "cursor-default": props.disabled,
      },
    ],
  }),
  label: ({ props }) => ({
    class: [
      //Font
      "leading-[normal]",

      // Flex & Alignment
      " flex flex-auto",

      // Sizing and Spacing
      "w-[1%]",
      "p-3",

      //Shape
      "rounded-none",

      // Color and Background
      "bg-transparent",
      "border-0",
      {
        "text-surface-800 dark:text-white/80": props.modelValue,
        "text-surface-400 dark:text-surface-500": !props.modelValue,
      },
      "placeholder:text-surface-400 dark:placeholder:text-surface-500",

      // Transitions
      "transition",
      "duration-200",

      // States
      "focus:outline-none focus:shadow-none",

      // Misc
      "relative",
      "cursor-pointer",
      "overflow-hidden overflow-ellipsis",
      "whitespace-nowrap",
      "appearance-none",
    ],
  }),
  dropdownbutton: {
    class: [
      // Flexbox
      "flex items-center justify-center",
      "shrink-0",

      // Color and Background
      "bg-transparent",
      "text-surface-500",

      // Size
      "w-12",

      // Shape
      "rounded-tr-md",
      "rounded-br-md",
    ],
  },
  panel: {
    class: [
      // Position
      "absolute top-0 left-0",

      // Shape
      "border-0 dark:border",
      "rounded-md",
      "shadow-md",

      // Color
      "bg-surface-0 dark:bg-surface-800",
      "text-surface-800 dark:text-white/80",
      "dark:border-surface-800",
    ],
  },
  wrapper: {
    class: [
      // Sizing
      "max-h-[200px]",

      // Misc
      "overflow-auto",
    ],
  },
  list: {
    class: "py-0 px-0 list-none m-1",
  },
  item: ({ context }) => ({
    class: [
      // Font
      "font-normal",
      "leading-none",

      // Shape
      "rounded",

      // Spacing
      "my-2 mx-1",
      "py-1 px-2",

      //  Colors
      {
        "text-surface-700 dark:text-white/80":
          !context.focused && !context.active,
        "bg-primary-100 dark:bg-surface-600/60 text-surface-700 dark:text-white/80":
          context.focused && !context.active,
        "bg-surface-100 dark:bg-surface-700 text-primary-700 dark:text-white/80":
          (context.focused && context.active) ||
          context.active ||
          (!context.focused && context.active),
      },

      // Hover States
      {
        "hover:bg-primary-200 dark:hover:bg-surface-600/80": !context.active,
        "hover:text-surface-700 hover:bg-primary-200 dark:hover:text-white dark:hover:bg-surface-600/80":
          context.active,
      },

      // Transitions
      "transition-shadow",
      "duration-200",

      // Misc
      "cursor-pointer",
      "overflow-hidden",
      "whitespace-nowrap",
    ],
  }),
  content: {
    class: [
      "relative",

      // Flexbox
      "flex",
      "items-center",

      // Spacing
      // "py-3",
      // "px-5",

      // Misc
      "no-underline",
      "overflow-hidden",
      "cursor-pointer",
      "select-none",
    ],
  },
  groupicon: {
    class: [
      // Alignment
      "ml-auto",
    ],
  },
  sublist: {
    class: [
      // Size
      "w-full",

      // Spacing
      "list-none",
      "p-1",
      "m-1",

      // Shape
      "shadow-none sm:shadow-md",
      "border-0",

      // Position
      "static sm:absolute",
      "z-10",

      // Color
      "bg-surface-0 dark:bg-surface-800",
    ],
  },
  separator: {
    class: "border-t border-surface-200 dark:border-surface-600 my-1",
  },
  transition: {
    enterFromClass: "opacity-0 scale-y-[0.8]",
    enterActiveClass:
      "transition-[transform,opacity] duration-[120ms] ease-[cubic-bezier(0,0,0.2,1)]",
    leaveActiveClass: "transition-opacity duration-100 ease-linear",
    leaveToClass: "opacity-0",
  },
};
