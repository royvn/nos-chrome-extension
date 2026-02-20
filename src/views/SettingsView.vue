<script setup>
import { ref, computed } from "vue";
import { FEEDS } from "../feed.js";

const props = defineProps({
  currentFeedUrl: {
    type: String,
    required: true,
  },
  maxItems: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(["update:feed-url", "update:max-items", "back"]);

const hasChanged = ref(false);

const feedGroups = computed(() => {
  const groups = [...new Set(FEEDS.map((f) => f.group))];
  return groups.map((group) => ({
    label: group,
    feeds: FEEDS.filter((f) => f.group === group),
  }));
});

function onFeedChange(url) {
  hasChanged.value = true;
  emit("update:feed-url", url);
}

function onMaxItemsChange(value) {
  hasChanged.value = true;
  emit("update:max-items", Number(value));
}
</script>

<template>
  <div>
    <div
      class="sticky top-0 z-10 flex items-center gap-0.5 px-3 py-2 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shadow-sm"
    >
      <button
        type="button"
        class="icon-btn"
        title="Terug"
        aria-label="Terug naar nieuws"
        @click="$emit('back')"
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
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <h1 class="m-0 text-[15px] font-semibold">Instellingen</h1>
    </div>

    <div class="px-3 py-3">
      <div
        class="flex flex-col gap-1.5 py-3 border-b border-gray-100 dark:border-gray-700"
      >
        <label for="feed-select" class="font-medium text-sm">Nieuwsfeed</label>
        <select
          id="feed-select"
          class="w-full rounded border border-gray-200 dark:border-gray-600 px-2 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-gray-100 cursor-pointer focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-500"
          :value="currentFeedUrl"
          @change="onFeedChange($event.target.value)"
        >
          <optgroup
            v-for="group in feedGroups"
            :key="group.label"
            :label="group.label"
          >
            <option
              v-for="feed in group.feeds"
              :key="feed.url"
              :value="feed.url"
            >
              {{ feed.label }}
            </option>
          </optgroup>
        </select>
      </div>

      <div
        class="flex flex-col gap-1.5 py-3 border-b border-gray-100 dark:border-gray-700"
      >
        <label for="max-items" class="font-medium text-sm"
          >Aantal artikelen</label
        >
        <div class="flex items-center gap-3">
          <input
            id="max-items"
            type="range"
            min="1"
            max="10"
            step="1"
            class="flex-1 accent-gray-800"
            :value="maxItems"
            @input="onMaxItemsChange($event.target.value)"
          />
          <span class="text-sm font-semibold min-w-6 text-center">{{
            maxItems
          }}</span>
        </div>
      </div>

      <Transition name="slide-up">
        <button
          v-if="hasChanged"
          type="button"
          class="mt-3 w-full flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors duration-150 cursor-pointer border-0"
          @click="$emit('back')"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Bekijk aangepaste feed
        </button>
      </Transition>
    </div>
  </div>
</template>
