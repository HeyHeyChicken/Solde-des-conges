chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "AssystemSoldesDesConges1",
    title: "Accéder à mes congés",
    type: "normal"
  });
});

chrome.contextMenus.onClicked.addListener((info) => {
  chrome.tabs.create({
    url: "https://hive-dashboard.assystem.com/"
  });
});
