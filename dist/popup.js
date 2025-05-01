"use strict";
const fallbackRatio = 0.5;
document.addEventListener("DOMContentLoaded", () => {
    var _a, _b;
    const slider = document.getElementById("poofSlider");
    const valueLabel = document.getElementById("poofValue");
    const msgLabel = document.getElementById("msgLabel");
    const updateSliderLabel = (sliderValue) => {
        valueLabel.textContent = sliderValue.toFixed(2);
    };
    (_a = document.getElementById("resetRatio")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => {
        saveToChromeStorage(fallbackRatio);
        updateSliderLabel(fallbackRatio);
        slider.value = fallbackRatio.toString();
    });
    chrome.storage.local.get("poofRatio", (res) => {
        var _a;
        const saved = (_a = res.poofRatio) !== null && _a !== void 0 ? _a : 0.5;
        slider.value = saved.toString();
        valueLabel.textContent = saved.toFixed(2);
    });
    //  update label
    slider.addEventListener("input", () => {
        updateSliderLabel(parseFloat(slider.value));
    });
    // save and reload
    (_b = document.getElementById("saveRatio")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", () => {
        const ratio = parseFloat(slider.value);
        if (ratio === 1) {
            msgLabel.hidden = false;
            msgLabel.textContent = "Warning! Million Poofs incoming";
        }
        else {
            msgLabel.hidden = true;
            msgLabel.textContent = "";
        }
        saveToChromeStorage(ratio);
    });
});
function saveToChromeStorage(ratio) {
    chrome.storage.local.set({ poofRatio: ratio }, () => {
        console.log("✅ Poof ratio saved:", ratio);
        // Reload DOM
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tab = tabs[0];
            if (tab === null || tab === void 0 ? void 0 : tab.id)
                chrome.tabs.reload(tab.id);
        });
    });
}
