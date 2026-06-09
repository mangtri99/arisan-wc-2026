<script setup lang="ts">
defineProps<{ step: string }>()
</script>

<template>
  <header class="mx-auto w-full max-w-5xl px-5 pt-8 sm:pt-12">
    <div class="flex items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <img src="/wc2026.webp" alt="FIFA World Cup 2026" class="h-12 w-auto shrink-0" />
        <div>
          <p class="eyebrow">FIFA World Cup · USA · Canada · Mexico</p>
          <h1 class="font-display text-2xl uppercase leading-none tracking-wide text-chalk sm:text-3xl">
            Arisan Piala Dunia 2026
          </h1>
        </div>
      </div>
      <div class="hidden items-center gap-2 rounded-full border border-pitch-line bg-pitch-panel px-3 py-1.5 sm:flex">
        <span class="h-2 w-2 animate-shine rounded-full bg-whistle"></span>
        <span class="text-xs font-semibold uppercase tracking-widest text-chalk-dim">{{ step }}</span>
      </div>
    </div>
  </header>
</template>
