<script setup>
import { ref, computed, onMounted } from "vue";
import NewsView from "./components/NewsView.vue";
import SettingsView from "./components/SettingsView.vue";
import {
  FEEDS,
  DEFAULT_FEED_URL,
  STORAGE_KEY_MAX_ITEMS,
  STORAGE_KEY_FEED_URL,
  parseFeed,
} from "./feed.js";

const DEFAULT_MAX_ITEMS = 3;
const STORAGE_KEY_DARK = "darkMode";

const currentView = ref("news");
const currentFeedUrl = ref(DEFAULT_FEED_URL);
const maxItems = ref(DEFAULT_MAX_ITEMS);
const articles = ref([]);
const loading = ref(false);
const error = ref(null);
const isDark = ref(false);

function applyDark(value) {
  isDark.value = value;
  document.documentElement.classList.toggle("dark", value);
}

function toggleDark() {
  applyDark(!isDark.value);
  chrome.storage.local.set({ [STORAGE_KEY_DARK]: isDark.value });
}

const feedTitle = computed(() => {
  const feed = FEEDS.find((f) => f.url === currentFeedUrl.value);
  return feed ? `/ ${feed.group} ${feed.label}` : "";
});

async function loadFeed() {
  loading.value = true;
  error.value = null;
  try {
    const response = await fetch(currentFeedUrl.value);
    if (!response.ok) throw new Error(`Fout: ${response.status}`);
    const xml = await response.text();
    articles.value = parseFeed(xml, maxItems.value);
    const links = articles.value.map((a) => a.link).filter(Boolean);
    if (links.length && chrome?.runtime?.sendMessage) {
      chrome.runtime.sendMessage({ type: "clearBadge", links });
    }
  } catch (err) {
    error.value = err.message || "Kon feed niet ophalen.";
    articles.value = [];
  } finally {
    loading.value = false;
  }
}

function onFeedChange(url) {
  currentFeedUrl.value = url;
  chrome.storage.local.set({ [STORAGE_KEY_FEED_URL]: url });
  loadFeed();
}

function onMaxItemsChange(value) {
  maxItems.value = value;
  chrome.storage.local.set({ [STORAGE_KEY_MAX_ITEMS]: value });
  loadFeed();
}

onMounted(async () => {
  const result = await chrome.storage.local.get([
    STORAGE_KEY_MAX_ITEMS,
    STORAGE_KEY_FEED_URL,
    STORAGE_KEY_DARK,
  ]);
  if (typeof result[STORAGE_KEY_MAX_ITEMS] === "number") maxItems.value = result[STORAGE_KEY_MAX_ITEMS];
  if (typeof result[STORAGE_KEY_FEED_URL] === "string") currentFeedUrl.value = result[STORAGE_KEY_FEED_URL];
  if (typeof result[STORAGE_KEY_DARK] === "boolean") applyDark(result[STORAGE_KEY_DARK]);
  loadFeed();
});
</script>

<template>
  <NewsView
    v-if="currentView === 'news'"
    :articles="articles"
    :loading="loading"
    :error="error"
    :feed-title="feedTitle"
    :is-dark="isDark"
    @refresh="loadFeed"
    @open-settings="currentView = 'settings'"
    @toggle-dark="toggleDark"
  />
  <SettingsView
    v-else
    :current-feed-url="currentFeedUrl"
    :max-items="maxItems"
    @update:feed-url="onFeedChange"
    @update:max-items="onMaxItemsChange"
    @back="currentView = 'news'"
  />
</template>
