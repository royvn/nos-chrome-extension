<script setup>
import ArticleItem from "../components/ArticleItem.vue";

defineProps({
  articles: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: null,
  },
  feedTitle: {
    type: String,
    default: "",
  },
  isDark: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["refresh", "open-settings", "toggle-dark"]);
</script>

<template>
  <div>
    <div
      class="sticky top-0 z-10 flex items-center justify-between gap-2 px-3 py-2 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shadow-sm"
    >
      <h1 class="m-0 text-[15px] font-semibold leading-tight">
        NOS
        <span class="text-gray-400 dark:text-gray-500 font-normal">{{
          feedTitle
        }}</span>
      </h1>
      <div class="flex items-center gap-1 shrink-0">
        <!-- Refresh -->
        <button
          type="button"
          :disabled="loading"
          :class="['icon-btn', { loading }]"
          title="Feed vernieuwen"
          aria-label="Feed vernieuwen"
          :aria-busy="loading"
          @click="$emit('refresh')"
        >
          <svg
            :class="{ 'animate-spin': loading }"
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M21 2v6h-6" />
            <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
            <path d="M3 22v-6h6" />
            <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
          </svg>
        </button>

        <!-- Dark mode toggle -->
        <button
          type="button"
          class="icon-btn"
          :title="isDark ? 'Lichte modus' : 'Donkere modus'"
          :aria-label="
            isDark ? 'Schakel naar lichte modus' : 'Schakel naar donkere modus'
          "
          @click="$emit('toggle-dark')"
        >
          <!-- Sun: shown in dark mode -->
          <svg
            v-if="isDark"
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
          <!-- Moon: shown in light mode -->
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </button>

        <!-- Settings -->
        <button
          type="button"
          class="icon-btn"
          title="Instellingen"
          aria-label="Instellingen"
          @click="$emit('open-settings')"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="3" />
            <path
              d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
            />
          </svg>
        </button>
      </div>
    </div>

    <div class="px-3 py-3">
      <p v-if="loading && !articles.length" class="status">Laden…</p>
      <p v-else-if="error" class="status error">{{ error }}</p>
      <p v-else-if="!articles.length" class="status">
        Geen artikelen gevonden.
      </p>
      <ul v-else class="list-none m-0 p-0" aria-live="polite">
        <ArticleItem
          v-for="article in articles"
          :key="article.link"
          :article="article"
        />
      </ul>
    </div>
  </div>
</template>
