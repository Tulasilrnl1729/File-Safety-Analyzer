chrome.downloads.onChanged.addListener(async (downloadDelta) => {
  if (downloadDelta.state && downloadDelta.state.current === "complete") {
    chrome.downloads.search({ id: downloadDelta.id }, async (results) => {
      if (results.length > 0) {
        let filePath = results[0].filename;
        analyzeFile(filePath);
      }
    });
  }
});

// Function to analyze the downloaded file
async function analyzeFile(filePath) {
  let fileHash = await getFileHash(filePath);
  let isMalicious = await checkVirusTotal(fileHash);

  if (isMalicious) {
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icon.png",
      title: "⚠️ Suspicious File Detected!",
      message: `The file ${filePath} may be malicious!`,
      priority: 2
    });
  }
}

// Function to calculate SHA-256 hash of the file
async function getFileHash(filePath) {
  const file = await fetch(`file://${filePath}`);
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Function to check VirusTotal API
async function checkVirusTotal(fileHash) {
  const apiKey = "your_api_key_here";  // Replace with your API key
  const response = await fetch(`https://www.virustotal.com/api/v3/files/${fileHash}`, {
    headers: { "x-apikey": apiKey }
  });
  const data = await response.json();
  return data.data && data.data.attributes.last_analysis_stats.malicious > 0;
}
