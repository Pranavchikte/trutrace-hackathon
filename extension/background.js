// Create context menu on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "checkImage",
    title: "🇮🇳 Check if AI Generated",
    contexts: ["image"],
  });
});

// Handle context menu click
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "checkImage") {
    scanSingleImage(info.srcUrl, tab.id);
  }
});

// Handle messages from popup (for text scanning and bulk image scanning)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "scanImages") {
    scanImagesInBackground(message.images, sender.tab.id);
  }
  return true;
});

// Scan single image from context menu
async function scanSingleImage(imageUrl, tabId) {
  try {
    // Show loader
    chrome.tabs.sendMessage(tabId, { action: "showLoader" });

    console.log("Background: Scanning single image", imageUrl);

    const response = await fetch(imageUrl);
    const blob = await response.blob();

    const formData = new FormData();
    formData.append("file", blob, "image.jpg");

    const detectResponse = await fetch("http://127.0.0.1:8000/detect-image", {
      method: "POST",
      body: formData,
    });

    console.log("Background: Response", detectResponse.status);

    const confidence = parseFloat(
      detectResponse.headers.get("X-Confidence") || "0",
    );
    const isAi = detectResponse.headers.get("X-AI-Detection") === "true";

    const result = {
      url: imageUrl,
      is_ai: isAi,
      confidence: confidence,
    };

    // Hide loader and apply stamp
    chrome.tabs.sendMessage(tabId, {
      action: "applyStamp",
      result: result,
    });
  } catch (err) {
    console.error("Background: Error scanning image", err);
    chrome.tabs.sendMessage(tabId, { action: "hideLoader" });
  }
}

// Scan multiple images (from popup button)
async function scanImagesInBackground(images, tabId) {
  const results = [];

  for (const img of images) {
    try {
      console.log("Background: Fetching", img.src);

      const response = await fetch(img.src);
      const blob = await response.blob();

      const formData = new FormData();
      formData.append("file", blob, "image.jpg");

      const detectResponse = await fetch("http://127.0.0.1:8000/detect-image", {
        method: "POST",
        body: formData,
      });

      const confidence = parseFloat(
        detectResponse.headers.get("X-Confidence") || "0",
      );
      const isAi = detectResponse.headers.get("X-AI-Detection") === "true";

      results.push({
        url: img.src,
        is_ai: isAi,
        confidence: confidence,
      });
    } catch (err) {
      console.error("Background: Error", err);
    }
  }

  console.log("Background: Final results", results);

  chrome.runtime.sendMessage({
    action: "imageResults",
    results: results,
  });

  chrome.tabs.sendMessage(tabId, {
    action: "applyOverlays",
    results: results,
  });
}
