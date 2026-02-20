<script setup>
defineProps({
  article: {
    type: Object,
    required: true,
  },
});

function formatDate(pubDateStr) {
  if (!pubDateStr?.trim()) return "";
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
</script>

<template>
  <li class="border-b border-gray-100 dark:border-gray-700 last:border-b-0">
    <a
      :href="article.link"
      target="_blank"
      rel="noopener noreferrer"
      class="flex items-center gap-2.5 text-inherit no-underline py-2 group"
    >
      <img
        :src="article.imageUrl || ''"
        alt=""
        class="shrink-0 w-16 h-16 object-cover rounded bg-gray-100 dark:bg-gray-700"
      />
      <div class="flex flex-col gap-0.5 min-w-0">
        <span class="block font-medium text-[13px] leading-snug group-hover:underline">
          {{ article.title }}
        </span>
        <span
          v-if="formatDate(article.pubDate)"
          class="block text-[11px] text-gray-500 dark:text-gray-400 mt-0.5"
        >
          {{ formatDate(article.pubDate) }}
        </span>
      </div>
    </a>
  </li>
</template>
