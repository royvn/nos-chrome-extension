import { DEFAULT_FEED_URL, STORAGE_KEY_LAST_SEEN, STORAGE_KEY_FEED_URL, parseFeed } from "./feed.js";

const BADGE_CHECK_MINUTES = 1;
const MAX_BADGE = 10;

function countNewLinks(currentLinks, lastSeen) {
  const seen = new Set(lastSeen || []);
  return currentLinks.filter((link) => !seen.has(link)).length;
}

async function checkFeedAndUpdateBadge() {
  try {
    const { [STORAGE_KEY_FEED_URL]: storedUrl } = await chrome.storage.local.get(STORAGE_KEY_FEED_URL);
    const feedUrl = storedUrl || DEFAULT_FEED_URL;
    const response = await fetch(feedUrl);
    if (!response.ok) return;
    const xml = await response.text();
    const currentLinks = parseFeed(xml, 6).map((item) => item.link).filter(Boolean);
    if (!currentLinks.length) return;

    const { [STORAGE_KEY_LAST_SEEN]: lastSeen } = await chrome.storage.local.get(STORAGE_KEY_LAST_SEEN);
    if (!lastSeen || lastSeen.length === 0) {
      await chrome.storage.local.set({ [STORAGE_KEY_LAST_SEEN]: currentLinks });
      return;
    }
    const newCount = countNewLinks(currentLinks, lastSeen);

    if (newCount > 0) {
      const badgeText = newCount > MAX_BADGE ? "10+" : String(newCount);
      await chrome.action.setBadgeText({ text: badgeText });
      await chrome.action.setBadgeBackgroundColor({ color: "#c00" });
    }
  } catch {
    // Negeer netwerkfouten bij achtergrondcheck
  }
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create("checkFeed", { periodInMinutes: BADGE_CHECK_MINUTES });
  checkFeedAndUpdateBadge();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "checkFeed") checkFeedAndUpdateBadge();
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "clearBadge" && Array.isArray(message.links)) {
    chrome.storage.local.set({ [STORAGE_KEY_LAST_SEEN]: message.links }).then(() => {
      chrome.action.setBadgeText({ text: "" });
      sendResponse({ ok: true });
    });
    return true;
  }
  sendResponse({ ok: false });
});
