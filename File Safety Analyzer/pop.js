chrome.storage.local.get("lastAlert", (data) => {
    if (data.lastAlert) {
        document.getElementById("status").textContent = data.lastAlert;
    }
});
