async function initPoofing() {
  const { image: b64 } = await chrome.storage.local.get("image");
  const { mime: mimeType } = await chrome.storage.local.get("mime");
  // const b64 = imagRes.image as string;
  // const mimeType = mimeRes.mime as string;
  if (!b64 || !mimeType) {
    alert("no content");
    return;
  }

  const base64WithMime = `data:${mimeType};base64,${b64}`;

  chrome.storage.local.get("poofRatio", (res) => {
    const poofRatio = res.poofRatio ?? 0.5;

    const poofedSet = new WeakSet();

    function poof(img: HTMLImageElement) {
      if (poofedSet.has(img)) return;

      if (poofRatio > Math.random()) {
        const newSrc = base64WithMime;
        img.src = newSrc;

        poofedSet.add(img);

        //if the site tries to change it, overwrite it again
        new MutationObserver(() => {
          if (img.src !== newSrc) {
            img.src = newSrc;
          }
        }).observe(img, {
          attributes: true,
          attributeFilter: ["src"],
        });
      }
    }

    // initial pass for any already-rendered images
    document.querySelectorAll("img").forEach(poof);

    // watch DOM for newly added images, infinite scrolling
    new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType !== Node.ELEMENT_NODE) continue;
          const el = node as Element;

          if (el.tagName === "IMG") {
            poof(el as HTMLImageElement);
          } else {
            el.querySelectorAll?.("img").forEach(poof);
          }
        }
      }
    }).observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}

initPoofing();
