<script setup lang="ts">
import { TEAMS } from '../data/teams'

const props = defineProps<{ modelValue: string[] | null }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: string[] | null): void }>()

const groups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']

function isChecked(id: string): boolean {
  return props.modelValue === null || props.modelValue.includes(id)
}

function toggle(id: string) {
  const current = props.modelValue === null
    ? TEAMS.map((t) => t.id)
    : [...props.modelValue]
  const idx = current.indexOf(id)
  if (idx === -1) {
    current.push(id)
  } else {
    current.splice(idx, 1)
  }
  emit('update:modelValue', current.length === TEAMS.length ? null : current)
}

function selectAll() {
  emit('update:modelValue', null)
}

function clearAll() {
  emit('update:modelValue', [])
}

const selectedCount = () =>
  props.modelValue === null ? TEAMS.length : props.modelValue.length
</script>

<template>
  <div>
    <div class="mb-3 flex items-center gap-2">
      <button type="button" class="btn-ghost text-sm" @click="selectAll">Pilih Semua</button>
      <button type="button" class="btn-ghost text-sm" @click="clearAll">Hapus Semua</button>
      <span class="ml-auto text-sm text-chalk-dim">
        {{ selectedCount() }} / {{ TEAMS.length }}
      </span>
    </div>
    <div class="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3">
      <div v-for="group in groups" :key="group">
        <p class="mb-1.5 text-[0.65rem] font-semibold uppercase tracking-widest text-chalk-dim">
          Grup {{ group }}
        </p>
        <label
          v-for="team in TEAMS.filter((t) => t.group === group)"
          :key="team.id"
          class="flex cursor-pointer items-center gap-2 rounded py-0.5 text-sm"
          :class="isChecked(team.id) ? 'text-chalk' : 'text-chalk-dim'"
        >
          <input
            type="checkbox"
            :checked="isChecked(team.id)"
            class="accent-turf"
            @change="toggle(team.id)"
          />
          <span>{{ team.flag }}</span>
          <span class="truncate">{{ team.name }}</span>
        </label>
      </div>
    </div>
  </div>
</template>
