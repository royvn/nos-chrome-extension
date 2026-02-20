const FEED_URL = "https://feeds.nos.nl/nosnieuwsalgemeen";
const MAX_ITEMS = 6;

const articlesEl = document.getElementById("articles");
const statusEl = document.getElementById("status");
const refreshBtn = document.getElementById("refresh");

function setStatus(message, isError = false) {
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.className = isError ? "status error" : "status";
  statusEl.hidden = false;
}

function clearStatus() {
  if (statusEl) {
    statusEl.hidden = true;
    statusEl.textContent = "";
  }
}

function formatDate(pubDateStr) {
  if (!pubDateStr || !pubDateStr.trim()) return "";
  try {
    const date = new Date(pubDateStr.trim());
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString("nl-NL", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function parseFeed(xmlString) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, "text/xml");
  const parseError = doc.querySelector("parsererror");
  if (parseError) {
    throw new Error("Feed kon niet worden gelezen.");
  }
  const items = doc.querySelectorAll("item");
  const result = [];
  const limit = Math.min(MAX_ITEMS, items.length);
  for (let i = 0; i < limit; i++) {
    const item = items[i];
    const title = item.querySelector("title")?.textContent?.trim() ?? "";
    const link =
      item.querySelector("link")?.textContent?.trim() ||
      item.querySelector("guid")?.textContent?.trim() ||
      "";
    const enclosure = item.querySelector('enclosure[type="image/jpeg"]');
    const imageUrl = enclosure?.getAttribute("url") ?? "";
    const pubDate = item.querySelector("pubDate")?.textContent ?? "";
    result.push({ title, link, imageUrl, pubDate });
  }
  return result;
}

function renderArticles(items) {
  clearStatus();
  articlesEl.innerHTML = "";
  if (!items.length) {
    setStatus("Geen artikelen gevonden.");
    return;
  }
  const list = document.createElement("ul");
  list.className = "article-list";
  for (const article of items) {
    const li = document.createElement("li");
    li.className = "article-item";
    const a = document.createElement("a");
    a.href = article.link;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.className = "article-link";
    if (article.imageUrl) {
      const img = document.createElement("img");
      img.src = article.imageUrl;
      img.alt = "";
      img.className = "article-image";
      a.appendChild(img);
    }
    const titleSpan = document.createElement("span");
    titleSpan.className = "article-title";
    titleSpan.textContent = article.title;
    a.appendChild(titleSpan);
    const dateStr = formatDate(article.pubDate);
    if (dateStr) {
      const dateSpan = document.createElement("span");
      dateSpan.className = "article-date";
      dateSpan.textContent = dateStr;
      a.appendChild(dateSpan);
    }
    li.appendChild(a);
    list.appendChild(li);
  }
  articlesEl.appendChild(list);
}

const REFRESH_BTN_LABEL = "Vernieuwen";
const REFRESH_BTN_LOADING_LABEL = "Laden…";

function setRefreshButtonLoading(loading) {
  refreshBtn.disabled = loading;
  refreshBtn.setAttribute("aria-busy", loading ? "true" : "false");
  refreshBtn.classList.toggle("loading", loading);
  refreshBtn.textContent = loading
    ? REFRESH_BTN_LOADING_LABEL
    : REFRESH_BTN_LABEL;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const MIN_LOADING_MS = 1000;

async function loadFeed(isRefresh = false) {
  if (!isRefresh) {
    setStatus("Laden…");
  }
  setRefreshButtonLoading(true);
  try {
    const [response] = await Promise.all([
      fetch(FEED_URL),
      delay(MIN_LOADING_MS),
    ]);
    if (!response.ok) {
      throw new Error(`Fout: ${response.status}`);
    }
    const xml = await response.text();
    const items = parseFeed(xml);
    renderArticles(items);
  } catch (err) {
    setStatus(err.message || "Kon feed niet ophalen.", true);
    articlesEl.innerHTML = "";
  } finally {
    setRefreshButtonLoading(false);
  }
}

refreshBtn.addEventListener("click", (e) => {
  e.preventDefault();
  if (refreshBtn.disabled || refreshBtn.classList.contains("loading")) return;
  loadFeed(true);
});

loadFeed();
