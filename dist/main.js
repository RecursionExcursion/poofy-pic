"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function initPoofing() {
    return __awaiter(this, void 0, void 0, function* () {
        const { image: b64 } = yield chrome.storage.local.get("image");
        const { mime: mimeType } = yield chrome.storage.local.get("mime");
        // const b64 = imagRes.image as string;
        // const mimeType = mimeRes.mime as string;
        if (!b64 || !mimeType) {
            alert("no content");
            return;
        }
        const base64WithMime = `data:${mimeType};base64,${b64}`;
        chrome.storage.local.get("poofRatio", (res) => {
            var _a;
            const poofRatio = (_a = res.poofRatio) !== null && _a !== void 0 ? _a : 0.5;
            const poofedSet = new WeakSet();
            function poof(img) {
                if (poofedSet.has(img))
                    return;
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
                var _a;
                for (const mutation of mutations) {
                    for (const node of mutation.addedNodes) {
                        if (node.nodeType !== Node.ELEMENT_NODE)
                            continue;
                        const el = node;
                        if (el.tagName === "IMG") {
                            poof(el);
                        }
                        else {
                            (_a = el.querySelectorAll) === null || _a === void 0 ? void 0 : _a.call(el, "img").forEach(poof);
                        }
                    }
                }
            }).observe(document.body, {
                childList: true,
                subtree: true,
            });
        });
    });
}
initPoofing();
