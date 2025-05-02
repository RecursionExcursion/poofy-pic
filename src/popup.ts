const fallbackRatio = 0.5;
const MAX_BYTES = 4.7 * 1024 * 1024; //~5m bytes

//Keys
const poofRatio = "poofRatio";
const image = "image";
const mimeType = "mime";

document.addEventListener("DOMContentLoaded", () => {
  const slider = document.querySelector("#poofSlider") as HTMLInputElement;
  const valueLabel = document.querySelector("#poofValue") as HTMLLabelElement;
  const msgLabel = document.querySelector("#msgLabel") as HTMLLabelElement;
  const imageInput = document.querySelector("#imageInput") as HTMLInputElement;
  const alertBox = document.querySelector("#alertBox") as HTMLDivElement;
  const closeAlertBoxButton = document.querySelector(
    "#closeAlertBoxButton"
  ) as HTMLButtonElement;

  closeAlertBoxButton.onclick = () => {
    alertBox.style.display = "none";
  };

  imageInput.addEventListener("change", (e: Event) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) {
      alert("No file selected.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const res = reader.result as string;
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

  const updateSliderLabel = (sliderValue: number) => {
    valueLabel!.textContent = sliderValue.toFixed(2);
  };

  document.getElementById("resetRatio")?.addEventListener("click", () => {
    saveToChromeStorage(poofRatio, fallbackRatio, true);
    updateSliderLabel(fallbackRatio);
    slider.value = fallbackRatio.toString();
  });

  chrome.storage.local.get(poofRatio, (res) => {
    const saved = res.poofRatio ?? 0.5;
    slider.value = saved.toString();
    valueLabel!.textContent = saved.toFixed(2);
  });

  //  update label
  slider.addEventListener("input", () => {
    updateSliderLabel(parseFloat(slider.value));
  });

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

function saveToChromeStorage(
  key: string,
  val: number | string,
  reloadDom?: boolean
) {
  chrome.storage.local.set({ [key]: val }, () => {
    if (reloadDom) {
      reloadDOM();
    }
  });
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

// Offer squoosh
// https://squoosh.app
