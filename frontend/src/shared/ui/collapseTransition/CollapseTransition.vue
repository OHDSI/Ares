<template>
  <Transition :css="false" @enter="onEnter" @leave="onLeave">
    <slot />
  </Transition>
</template>

<script setup lang="ts">
function onEnter(el: HTMLElement, done: () => void) {
  const naturalHeight = el.scrollHeight;
  const { paddingTop, paddingBottom } = getComputedStyle(el);

  el.style.height = "0";
  el.style.paddingTop = "0";
  el.style.paddingBottom = "0";
  el.style.overflow = "hidden";
  void el.offsetHeight;

  el.style.transition =
    "height 300ms ease-out, padding-top 300ms ease-out, padding-bottom 300ms ease-out";
  el.style.height = `${naturalHeight}px`;
  el.style.paddingTop = paddingTop;
  el.style.paddingBottom = paddingBottom;

  el.addEventListener("transitionend", function h(e) {
    if (e.propertyName !== "height") return;
    el.removeEventListener("transitionend", h);
    el.style.height =
      el.style.paddingTop =
      el.style.paddingBottom =
      el.style.overflow =
      el.style.transition =
        "";
    done();
  });
}

function onLeave(el: HTMLElement, done: () => void) {
  el.style.height = `${el.scrollHeight}px`;
  el.style.overflow = "hidden";
  void el.offsetHeight;

  el.style.transition =
    "height 250ms ease-in-out, padding-top 250ms ease-in-out, padding-bottom 250ms ease-in-out";
  el.style.height = "0";
  el.style.paddingTop = "0";
  el.style.paddingBottom = "0";

  el.addEventListener("transitionend", function h(e) {
    if (e.propertyName !== "height") return;
    el.removeEventListener("transitionend", h);
    done();
  });
}
</script>
