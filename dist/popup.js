"use strict";
const fallbackRatio = 0.5;
const MAX_BYTES = 4.7 * 1024 * 1024; //~5m bytes
//Keys
const poofRatio = "poofRatio";
const image = "image";
const mimeType = "mime";
document.addEventListener("DOMContentLoaded", () => {
    var _a, _b;
    const slider = document.querySelector("#poofSlider");
    const valueLabel = document.querySelector("#poofValue");
    const msgLabel = document.querySelector("#msgLabel");
    const imageInput = document.querySelector("#imageInput");
    const alertBox = document.querySelector("#alertBox");
    const closeAlertBoxButton = document.querySelector("#closeAlertBoxButton");
    closeAlertBoxButton.onclick = () => {
        alertBox.style.display = "none";
    };
    imageInput.addEventListener("change", (e) => {
        var _a;
        const target = e.target;
        const file = (_a = target.files) === null || _a === void 0 ? void 0 : _a[0];
        if (!file) {
            alert("No file selected.");
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            const res = reader.result;
            const imgAsB64 = res.split(",")[1];
            if (MAX_BYTES < calculateBytes(imgAsB64)) {
                // alert("Max image size is 4.7mb");
                alertBox.style.display = "block";
                return;
            }
            saveToChromeStorage(mimeType, file.type);
            saveToChromeStorage(image, imgAsB64, true);
            alert("Image uploaded");
        };
        reader.onerror = (error) => {
            console.error("Error reading file:", error);
        };
        reader.readAsDataURL(file);
    });
    const updateSliderLabel = (sliderValue) => {
        valueLabel.textContent = sliderValue.toFixed(2);
    };
    (_a = document.getElementById("resetRatio")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => {
        saveToChromeStorage(poofRatio, fallbackRatio, true);
        updateSliderLabel(fallbackRatio);
        slider.value = fallbackRatio.toString();
    });
    chrome.storage.local.get(poofRatio, (res) => {
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
        saveToChromeStorage(poofRatio, ratio, true);
    });
});
function saveToChromeStorage(key, val, reloadDom) {
    chrome.storage.local.set({ [key]: val }, () => {
        if (reloadDom) {
            reloadDOM();
        }
    });
}
function reloadDOM() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        if (tab === null || tab === void 0 ? void 0 : tab.id)
            chrome.tabs.reload(tab.id);
    });
}
function calculateBytes(str) {
    return new Blob([str]).size;
}
// Offer squoosh
// https://squoosh.app
