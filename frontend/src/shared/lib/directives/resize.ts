const resize = {
  beforeMount: (el, binding) => {
    const onResizeCallback = binding.value;
    el.resizeEvent = () => {
      const width = document.documentElement.clientWidth;
      const height = document.documentElement.clientHeight;
      onResizeCallback({ width, height });
    };
    window.addEventListener("resize", el.resizeEvent);
  },
  unmounted: (el) => {
    window.removeEventListener("resize", el.resizeEvent);
  },
};

export default resize;
