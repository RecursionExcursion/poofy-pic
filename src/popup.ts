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

document.addEventListener("DOMContentLoaded", async () => {
  const slider = document.querySelector("#poofSlider") as HTMLInputElement;
  const valueLabel = document.querySelector("#poofValue") as HTMLLabelElement;
  const msgLabel = document.querySelector("#msgLabel") as HTMLLabelElement;
  const imageInput = document.querySelector("#imageInput") as HTMLInputElement;
  const alertBox = document.querySelector("#alertBox") as HTMLDivElement;
  const closeAlertBoxButton = document.querySelector(
    "#closeAlertBoxButton"
  ) as HTMLButtonElement;

  const chooseFileButton = document.querySelector(
    "#chooseFileButton"
  ) as HTMLButtonElement;
  const chooseFileLabel = document.querySelector(
    "#chooseFileLabel"
  ) as HTMLLabelElement;

  chooseFileButton.onclick = () => imageInput.click();
  closeAlertBoxButton.onclick = () => (alertBox.style.display = "none");

  imageInput.addEventListener("change", async (e: Event) => {
    // const target = e.target as HTMLInputElement;
    const res = await uploadImage(imageInput);
    if (res) {
      if (res.message == maxImageSizeExceeded) {
        alertBox.style.display = "block";
      } else {
        alert(res.message);
      }
    } else {
      const imageNameStore = await queryChromeStorage(imageName);
      updateChooseImageLabel(imageNameStore[imageName]);
    }
  });

  const updateSliderLabel = (sliderValue: number) => {
    valueLabel!.textContent = sliderValue.toFixed(2);
  };

  const updateChooseImageLabel = (name?: string) => {
    chooseFileLabel.textContent = name ?? "No image uploaded";
  };

  document.getElementById("resetRatio")?.addEventListener("click", () => {
    saveToChromeStorage(poofRatio, fallbackRatio, true);
    updateSliderLabel(fallbackRatio);
    slider.value = fallbackRatio.toString();
  });

  //set slider
  const poofRatioStore = await queryChromeStorage(poofRatio);
  const saved = poofRatioStore[poofRatio] ?? 0.5;
  slider.value = saved.toString();
  valueLabel!.textContent = saved.toFixed(2);
  //  update label
  slider.addEventListener("input", () => {
    updateSliderLabel(parseFloat(slider.value));
  });

  //set input label
  const imageNameStore = await queryChromeStorage(imageName);
  console.log(imageNameStore);

  updateChooseImageLabel(imageNameStore[imageName]);
  // chooseFileLabel.textContent =
  //   imageNameStore[imageName] ?? "No image uploaded";

  // save and reload
  document.getElementById("saveRatio")?.addEventListener("click", () => {
    const ratio = parseFloat(slider.value);

    if (ratio === 1) {
      msgLabel!.hidden = false;
      msgLabel!.textContent = "Warning! Million Poofs incoming";
    } else {
      msgLabel!.hidden = true;
      msgLabel!.textContent = "";
    }

    saveToChromeStorage(poofRatio, ratio, true);
  });
});

/*  */

function queryChromeStorage(key: string) {
  return chrome.storage.local.get(key);
}

async function saveToChromeStorage(
  key: string,
  val: number | string,
  reloadDom?: boolean
) {
  await chrome.storage.local.set({ [key]: val });
  if (reloadDom) {
    reloadDOM();
  }
}

function reloadDOM() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (tab?.id) chrome.tabs.reload(tab.id);
  });
}

function calculateBytes(str: string) {
  return new Blob([str]).size;
}

async function uploadImage(inputEl: HTMLInputElement): Promise<Error | null> {
  return new Promise((response) => {
    const file = inputEl.files?.[0];
    if (!file) {
      alert();
      response(Error(noFileSelected));
      return;
    }

    const reader = new FileReader();

    reader.onload = async () => {
      const res = reader.result as string;
      const imgAsB64 = res.split(",")[1];

      if (MAX_BYTES < calculateBytes(imgAsB64)) {
        response(Error(maxImageSizeExceeded));
        return;
      }
      await saveToChromeStorage(mimeType, file.type);
      await saveToChromeStorage(imageName, file.name);
      await saveToChromeStorage(image, imgAsB64, true);
      alert("Image uploaded");
      response(null);
    };

    reader.onerror = (error) => {
      console.error("Error reading file:", error);
    };

    reader.readAsDataURL(file);
  });
}
