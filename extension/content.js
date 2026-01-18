// Inject stamp styles into page
const stampStyles = document.createElement("style");
stampStyles.textContent = `
  .trutrace-stamp {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-15deg) scale(0);
    width: 150px;
    height: 150px;
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-family: Arial, sans-serif;
    font-weight: bold;
    text-align: center;
    z-index: 999999;
    pointer-events: none;
    animation: stampAppear 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
    box-shadow: 0 10px 40px rgba(0,0,0,0.4);
  }
  
  .trutrace-stamp.ai {
    background: rgba(220, 38, 38, 0.95);
    border: 6px solid #fff;
    color: white;
  }
  
  .trutrace-stamp.human {
    background: rgba(22, 163, 74, 0.95);
    border: 6px solid #fff;
    color: white;
  }
  
  .stamp-emoji {
    font-size: 36px;
    margin-bottom: 4px;
  }
  
  .stamp-text {
    font-size: 16px;
    line-height: 1.2;
  }
  
  .stamp-subtext {
    font-size: 11px;
    margin-top: 2px;
    opacity: 0.9;
  }
  
  @keyframes stampAppear {
    0% {
      transform: translate(-50%, -50%) rotate(-15deg) scale(0);
      opacity: 0;
    }
    50% {
      transform: translate(-50%, -50%) rotate(-15deg) scale(1.1);
    }
    100% {
      transform: translate(-50%, -50%) rotate(-15deg) scale(1);
      opacity: 1;
    }
  }
  
  .trutrace-loader {
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(15, 23, 42, 0.95);
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.3);
    z-index: 9999999;
    font-family: Arial, sans-serif;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .loader-spinner {
    width: 20px;
    height: 20px;
    border: 3px solid rgba(255,255,255,0.3);
    border-top-color: #ef4444;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(stampStyles);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "scanPage") {
    const images = document.querySelectorAll("img");
    const imageData = Array.from(images)
      .slice(0, 5)
      .map((img) => ({
        src: img.src,
        alt: img.alt || "Image",
      }));

    chrome.runtime.sendMessage({
      action: "scanImages",
      images: imageData,
    });
  }

  if (message.action === "showLoader") {
    showLoader();
  }

  if (message.action === "hideLoader") {
    hideLoader();
  }

  if (message.action === "applyStamp") {
    applyStamp(message.result);
  }

  if (message.action === "applyOverlays") {
    applyBharatMarkOverlays(message.results);
  }
});

let currentLoader = null;

function showLoader() {
  hideLoader(); // Remove existing

  currentLoader = document.createElement("div");
  currentLoader.className = "trutrace-loader";
  currentLoader.innerHTML = `
    <div class="loader-spinner"></div>
    <span>Checking image...</span>
  `;
  document.body.appendChild(currentLoader);
}

function hideLoader() {
  if (currentLoader) {
    currentLoader.remove();
    currentLoader = null;
  }
}

function applyStamp(result) {
  hideLoader();

  const img = document.querySelector(`img[src="${result.url}"]`);
  if (!img) {
    showNotification("❌ Image not found on page");
    return;
  }

  // Wrap image if needed
  let wrapper = img.parentElement;
  if (
    wrapper.style.position !== "relative" ||
    !wrapper.classList.contains("trutrace-wrapper")
  ) {
    wrapper = document.createElement("div");
    wrapper.className = "trutrace-wrapper";
    wrapper.style.position = "relative";
    wrapper.style.display = "inline-block";
    wrapper.style.maxWidth = "100%";

    img.parentNode.insertBefore(wrapper, img);
    wrapper.appendChild(img);
  }

  // Create stamp image
  const stamp = document.createElement("img");
  const stampUrl = result.is_ai
    ? chrome.runtime.getURL("stamp-fake.png")
    : chrome.runtime.getURL("stamp-real.png");

  stamp.src = stampUrl;
  stamp.style.position = "absolute";
  stamp.style.top = "50%";
  stamp.style.left = "50%";
  stamp.style.transform = "translate(-50%, -50%) rotate(-15deg) scale(0)";
  stamp.style.width = "180px";
  stamp.style.height = "180px";
  stamp.style.zIndex = "999999";
  stamp.style.pointerEvents = "none";
  stamp.style.filter = "drop-shadow(0 10px 40px rgba(0,0,0,0.5))";
  stamp.style.animation =
    "stampAppear 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards";

  wrapper.appendChild(stamp);

  // Show notification
  const message = result.is_ai
    ? "🤖 Most likely AI-generated"
    : "✅ Most likely human-created";
  showNotification(message);

  console.log("Applied stamp:", result.is_ai ? "AI" : "Human");
}

function applyBharatMarkOverlays(results) {
  results.forEach((result) => {
    applyStamp(result);
  });
}

function showNotification(message) {
  const notification = document.createElement("div");
  notification.style.position = "fixed";
  notification.style.top = "20px";
  notification.style.right = "20px";
  notification.style.backgroundColor = "#0f172a";
  notification.style.color = "white";
  notification.style.padding = "16px 24px";
  notification.style.borderRadius = "8px";
  notification.style.boxShadow = "0 10px 25px rgba(0,0,0,0.3)";
  notification.style.zIndex = "9999999";
  notification.style.fontFamily = "Arial, sans-serif";
  notification.style.fontWeight = "bold";
  notification.style.fontSize = "14px";
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.transition = "opacity 0.5s";
    notification.style.opacity = "0";
    setTimeout(() => notification.remove(), 500);
  }, 3000);
}
