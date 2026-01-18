document.getElementById("scanImages").addEventListener("click", async () => {
  console.log("Popup: Scan button clicked");
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  console.log("Popup: Tab ID:", tab.id);

  showLoading();

  chrome.tabs.sendMessage(
    tab.id,
    {
      action: "scanPage",
    },
    (response) => {
      console.log("Popup: Message sent to content script");
    },
  );
});

document.getElementById("scanText").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id },
      function: getSelectedText,
    },
    (results) => {
      if (results && results[0] && results[0].result) {
        showLoading();
        analyzeText(results[0].result);
      } else {
        showError("No text selected. Please highlight text first.");
      }
    },
  );
});

function scanPageImages() {
  const images = document.querySelectorAll("img");
  chrome.runtime.sendMessage({
    action: "scanImages",
    images: Array.from(images)
      .slice(0, 5)
      .map((img) => ({
        src: img.src,
        alt: img.alt || "Image",
      })),
  });
}

function getSelectedText() {
  return window.getSelection().toString();
}

function analyzeText(text) {
  fetch("http://127.0.0.1:8000/detect-text", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `text=${encodeURIComponent(text)}`,
  })
    .then((res) => res.json())
    .then((data) => {
      displayTextResult(data);
    })
    .catch((err) => {
      showError("Backend not running. Start the server first.");
    });
}

function displayTextResult(data) {
  const confidence = (data.confidence * 100).toFixed(1);
  const isAI = data.is_ai_generated;

  const html = `
        <div class="space-y-3">
            <div class="flex items-center justify-between p-3 rounded-lg ${isAI ? "bg-red-900/30 border border-red-700" : "bg-green-900/30 border border-green-700"}">
                <span class="text-sm font-medium ${isAI ? "text-red-300" : "text-green-300"}">Status</span>
                <span class="text-sm font-bold ${isAI ? "text-red-400" : "text-green-400"}">${isAI ? "🤖 AI DETECTED" : "✅ HUMAN"}</span>
            </div>
            <div class="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <span class="text-sm font-medium text-slate-300">Confidence</span>
                <span class="text-sm font-bold text-white">${confidence}%</span>
            </div>
            <div class="p-3 bg-slate-700/50 rounded-lg">
                <span class="text-xs font-medium text-slate-400">Blockchain Hash</span>
                <p class="text-xs text-slate-300 mt-1 font-mono break-all">${data.blockchain_hash}</p>
            </div>
        </div>
    `;

  document.getElementById("resultsContent").innerHTML = html;
  document.getElementById("loading").classList.add("hidden");
  document.getElementById("results").classList.remove("hidden");
}

function displayImageResults(results) {
  let html = '<div class="space-y-2">';

  results.forEach((result, i) => {
    const confidence = (result.confidence * 100).toFixed(1);
    const isAI = result.is_ai;

    html += `
            <div class="p-3 rounded-lg ${isAI ? "bg-red-900/20 border border-red-700" : "bg-green-900/20 border border-green-700"}">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs font-medium text-slate-300">Image ${i + 1}</span>
                    <span class="text-xs font-bold ${isAI ? "text-red-400" : "text-green-400"}">${isAI ? "🤖 AI" : "✅ Human"}</span>
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-xs text-slate-400">Confidence:</span>
                    <span class="text-xs text-white font-semibold">${confidence}%</span>
                </div>
            </div>
        `;
  });

  html += "</div>";

  document.getElementById("resultsContent").innerHTML = html;
  document.getElementById("loading").classList.add("hidden");
  document.getElementById("results").classList.remove("hidden");
}

function showLoading() {
  document.getElementById("results").classList.add("hidden");
  document.getElementById("loading").classList.remove("hidden");
}

function showError(message) {
  const html = `
        <div class="p-4 bg-red-900/30 border border-red-700 rounded-lg">
            <p class="text-sm text-red-300">${message}</p>
        </div>
    `;
  document.getElementById("resultsContent").innerHTML = html;
  document.getElementById("loading").classList.add("hidden");
  document.getElementById("results").classList.remove("hidden");
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "imageResults") {
    displayImageResults(message.results);
  }
});
