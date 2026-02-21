export const STORAGE_KEY_LAST_SEEN = "lastSeenLinks";
export const STORAGE_KEY_MAX_ITEMS = "maxItems";
export const STORAGE_KEY_FEED_URL = "feedUrl";

export const FEEDS = [
  { group: "Nieuws", label: "Algemeen",        url: "https://feeds.nos.nl/nosnieuwsalgemeen" },
  { group: "Nieuws", label: "Binnenland",       url: "https://feeds.nos.nl/nosnieuwsbinnenland" },
  { group: "Nieuws", label: "Buitenland",       url: "https://feeds.nos.nl/nosnieuwsbuitenland" },
  { group: "Nieuws", label: "Politiek",         url: "https://feeds.nos.nl/nosnieuwspolitiek" },
  { group: "Nieuws", label: "Economie",         url: "https://feeds.nos.nl/nosnieuwseconomie" },
  { group: "Nieuws", label: "Opmerkelijk",      url: "https://feeds.nos.nl/nosnieuwsopmerkelijk" },
  { group: "Nieuws", label: "Koningshuis",      url: "https://feeds.nos.nl/nosnieuwskoningshuis" },
  { group: "Nieuws", label: "Cultuur & media",  url: "https://feeds.nos.nl/nosnieuwscultuurenmedia" },
  { group: "Nieuws", label: "Tech",             url: "https://feeds.nos.nl/nosnieuwstech" },
  { group: "Sport",  label: "Algemeen",         url: "https://feeds.nos.nl/nossportalgemeen" },
  { group: "Sport",  label: "Voetbal",          url: "https://feeds.nos.nl/nossportvoetbal" },
  { group: "Sport",  label: "Wielrennen",       url: "https://feeds.nos.nl/nossportwielrennen" },
  { group: "Sport",  label: "Schaatsen",        url: "https://feeds.nos.nl/nossportschaatsen" },
  { group: "Sport",  label: "Tennis",           url: "https://feeds.nos.nl/nossporttennis" },
  { group: "Sport",  label: "Formule 1",        url: "https://feeds.nos.nl/nossportformule1" },
];

export const DEFAULT_FEED_URL = FEEDS[0].url;

/**
 * Lightweight RSS link extraction without DOMParser (for use in service workers).
 * @param {string} xmlString
 * @param {number} maxItems
 * @returns {string[]}
 */
export function parseFeedLinksOnly(xmlString, maxItems) {
  const links = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let m;
  while ((m = itemRegex.exec(xmlString)) !== null && links.length < maxItems) {
    const block = m[1];
    const linkMatch =
      block.match(/<link[^>]*>([^<]+)</) ||
      block.match(/<link\s+href=["']([^"']+)["']/) ||
      block.match(/<guid[^>]*>([^<]+)</);
    if (linkMatch) {
      const url = linkMatch[1].trim();
      if (url) links.push(url);
    }
  }
  return links;
}

/**
 * @param {string} xmlString
 * @param {number} maxItems
 * @returns {{ title: string, link: string, imageUrl: string, pubDate: string }[]}
 */
export function parseFeed(xmlString, maxItems) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, "text/xml");
  if (doc.querySelector("parsererror")) {
    throw new Error("Feed kon niet worden gelezen.");
  }
  const items = doc.querySelectorAll("item");
  const result = [];
  const limit = Math.min(maxItems, items.length);
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
