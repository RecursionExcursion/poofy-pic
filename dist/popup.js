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
const fallbackRatio = 0.5;
const MAX_BYTES = 4.7 * 1024 * 1024; //~5m bytes
//Keys
const poofRatio = "poofRatio";
const image = "image";
const mimeType = "mime";
const imageName = "imageName";
//Upload error messages
const maxImageSizeExceeded = "Max image size is 4.7mb";
const noFileSelected = "No file selected";
document.addEventListener("DOMContentLoaded", () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const slider = document.querySelector("#poofSlider");
    const valueLabel = document.querySelector("#poofValue");
    const msgLabel = document.querySelector("#msgLabel");
    const imageInput = document.querySelector("#imageInput");
    const alertBox = document.querySelector("#alertBox");
    const closeAlertBoxButton = document.querySelector("#closeAlertBoxButton");
    const chooseFileButton = document.querySelector("#chooseFileButton");
    const chooseFileLabel = document.querySelector("#chooseFileLabel");
    chooseFileButton.onclick = () => imageInput.click();
    closeAlertBoxButton.onclick = () => (alertBox.style.display = "none");
    imageInput.addEventListener("change", (e) => __awaiter(void 0, void 0, void 0, function* () {
        // const target = e.target as HTMLInputElement;
        const res = yield uploadImage(imageInput);
        if (res) {
            if (res.message == maxImageSizeExceeded) {
                alertBox.style.display = "block";
            }
            else {
                alert(res.message);
            }
        }
        else {
            const imageNameStore = yield queryChromeStorage(imageName);
            updateChooseImageLabel(imageNameStore[imageName]);
        }
    }));
    const updateSliderLabel = (sliderValue) => {
        valueLabel.textContent = sliderValue.toFixed(2);
    };
    const updateChooseImageLabel = (name) => {
        chooseFileLabel.textContent = name !== null && name !== void 0 ? name : "No image uploaded";
    };
    (_a = document.getElementById("resetRatio")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => {
        saveToChromeStorage(poofRatio, fallbackRatio, true);
        updateSliderLabel(fallbackRatio);
        slider.value = fallbackRatio.toString();
    });
    //set slider
    const poofRatioStore = yield queryChromeStorage(poofRatio);
    const saved = (_b = poofRatioStore[poofRatio]) !== null && _b !== void 0 ? _b : 0.5;
    slider.value = saved.toString();
    valueLabel.textContent = saved.toFixed(2);
    //  update label
    slider.addEventListener("input", () => {
        updateSliderLabel(parseFloat(slider.value));
    });
    //set input label
    const imageNameStore = yield queryChromeStorage(imageName);
    console.log(imageNameStore);
    updateChooseImageLabel(imageNameStore[imageName]);
    // chooseFileLabel.textContent =
    //   imageNameStore[imageName] ?? "No image uploaded";
    // save and reload
    (_c = document.getElementById("saveRatio")) === null || _c === void 0 ? void 0 : _c.addEventListener("click", () => {
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
}));
/*  */
function queryChromeStorage(key) {
    return chrome.storage.local.get(key);
}
function saveToChromeStorage(key, val, reloadDom) {
    return __awaiter(this, void 0, void 0, function* () {
        yield chrome.storage.local.set({ [key]: val });
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
function uploadImage(inputEl) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((response) => {
            var _a;
            const file = (_a = inputEl.files) === null || _a === void 0 ? void 0 : _a[0];
            if (!file) {
                alert();
                response(Error(noFileSelected));
                return;
            }
            const reader = new FileReader();
            reader.onload = () => __awaiter(this, void 0, void 0, function* () {
                const res = reader.result;
                const imgAsB64 = res.split(",")[1];
                if (MAX_BYTES < calculateBytes(imgAsB64)) {
                    response(Error(maxImageSizeExceeded));
                    return;
                }
                yield saveToChromeStorage(mimeType, file.type);
                yield saveToChromeStorage(imageName, file.name);
                yield saveToChromeStorage(image, imgAsB64, true);
                alert("Image uploaded");
                response(null);
            });
            reader.onerror = (error) => {
                console.error("Error reading file:", error);
            };
            reader.readAsDataURL(file);
        });
    });
}
