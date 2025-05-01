document.addEventListener("DOMContentLoaded", () => {
  const slider = document.getElementById("poofSlider") as HTMLInputElement;
  const valueLabel = document.getElementById("poofValue");
  const msgLabel = document.getElementById("msgLabel") as HTMLLabelElement;

  const updateSliderLabel = (sliderValue: number) => {
    valueLabel!.textContent = sliderValue.toFixed(2);
  };

  document.getElementById("resetRatio")?.addEventListener("click", () => {
    const ratio = 0.5;
    saveToChromeStorage(ratio);
    updateSliderLabel(ratio);
    slider.value = ratio.toString();
  });

  chrome.storage.local.get("poofRatio", (res) => {
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

    saveToChromeStorage(ratio);
  });
});

function saveToChromeStorage(ratio: number) {
  chrome.storage.local.set({ poofRatio: ratio }, () => {
    console.log("✅ Poof ratio saved:", ratio);

    // Reload DOM
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (tab?.id) chrome.tabs.reload(tab.id);
    });
  });
}
