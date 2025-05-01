let poofyLinks: string[] = [];

fetch(chrome.runtime.getURL("assets/image_manifest.json"))
  .then((res) => res.json())
  .then((images) => {
    poofyLinks = images;
    initPoofing();
  });

function initPoofing() {
  chrome.storage.local.get("poofRatio", (res) => {
    const poofRatio = res.poofRatio ?? 0.5;

    console.log({ poofRatio });

    const poofed = new WeakSet();

    function poof(img: HTMLImageElement) {
      if (poofed.has(img)) return;

      if (poofRatio > Math.random()) {
        const r = Math.floor(Math.random() * poofyLinks.length);
        const newSrc = chrome.runtime.getURL(`assets/${poofyLinks[r]}`);
        img.src = newSrc;

        poofed.add(img);

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
