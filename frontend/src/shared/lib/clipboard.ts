export async function writeToClipboard(tsv: string, html: string) {
  try {
    await navigator.clipboard.write([
      new ClipboardItem({
        "text/plain": new Blob([tsv], { type: "text/plain" }),
        "text/html": new Blob([html], { type: "text/html" }),
      }),
    ]);
  } catch {
    try {
      await navigator.clipboard.writeText(tsv);
    } catch {
      const el = document.createElement("textarea");
      el.value = tsv;
      el.style.cssText = "position:fixed;opacity:0;top:0;left:0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
  }
}
