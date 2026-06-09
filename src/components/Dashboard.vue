<script setup lang="ts">
import { computed, ref } from 'vue'
import { usePoolStore } from '../stores/pool'
import { rupiah } from '../lib/format'
import { TEAM_BY_ID } from '../data/teams'
import { useDownloadImage } from '../lib/useDownloadImage'
import PlayerTicket from './PlayerTicket.vue'
import SettlePanel from './SettlePanel.vue'

const store = usePoolStore()
const emit = defineEmits<{ (e: 'redraw'): void }>()

const bankTeams = computed(() => store.bankTeamIds.map((id) => TEAM_BY_ID[id]))

const captureArea = ref<HTMLElement | null>(null)
const { downloading, downloadImage } = useDownloadImage()

function handleDownload() {
  if (captureArea.value) downloadImage(captureArea.value)
}
</script>

<template>
  <section class="mx-auto w-full max-w-5xl px-5 py-8">
    <!-- elemen khusus untuk di-capture, dirender di luar layar -->
    <div
      ref="captureArea"
      style="position:fixed;left:-9999px;top:0;width:800px;background:#06140E;padding:32px;"
    >
      <!-- header ringkasan -->
      <div style="border:1px solid #16352A;border-radius:16px;padding:20px 24px;margin-bottom:24px;display:flex;gap:40px;flex-wrap:wrap;">
        <div>
          <p style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.22em;color:#8DA496;margin:0 0 4px;">Total pot</p>
          <p style="font-size:28px;font-weight:700;color:#F2C84B;margin:0;font-variant-numeric:tabular-nums;">{{ rupiah(store.pot) }}</p>
        </div>
        <div>
          <p style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.22em;color:#8DA496;margin:0 0 4px;">Pemain</p>
          <p style="font-size:28px;font-weight:700;color:#EDF2EA;margin:0;">{{ store.pool.players.length }}</p>
        </div>
        <div>
          <p style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.22em;color:#8DA496;margin:0 0 4px;">Taruhan / orang</p>
          <p style="font-size:28px;font-weight:700;color:#EDF2EA;margin:0;font-variant-numeric:tabular-nums;">{{ rupiah(store.pool.betAmount) }}</p>
        </div>
        <div>
          <p style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.22em;color:#8DA496;margin:0 0 4px;">Seed</p>
          <p style="font-size:22px;font-weight:700;color:#8DA496;margin:0;letter-spacing:0.1em;">{{ store.pool.seed }}</p>
        </div>
      </div>

      <!-- tiket semua pemain dalam grid 2 kolom -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
        <div
          v-for="(p, i) in store.pool.players"
          :key="p.id"
          :style="{
            border: store.winner?.id === p.id ? '1px solid #F2C84B' : '1px solid #16352A',
            borderRadius: '16px',
            background: '#0C2018',
            padding: '16px',
            position: 'relative',
            overflow: 'hidden',
          }"
        >
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
            <div style="display:flex;align-items:center;gap:10px;">
              <span :style="{
                width:'28px', height:'28px', borderRadius:'50%',
                border: store.winner?.id === p.id ? '1px solid #F2C84B' : '1px solid #16352A',
                color: store.winner?.id === p.id ? '#F2C84B' : '#8DA496',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:'12px', fontWeight:'bold', flexShrink:'0',
              }">{{ i + 1 }}</span>
              <span style="font-size:16px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#EDF2EA;">{{ p.name }}</span>
            </div>
            <span v-if="store.winner?.id === p.id" style="background:#F2C84B;color:#06140E;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;padding:3px 8px;border-radius:999px;">🏆 Juara</span>
          </div>
          <div v-for="tid in p.teamIds" :key="tid" :style="{
            display:'flex', alignItems:'center', gap:'10px',
            padding:'6px 8px', borderRadius:'8px',
            background: store.pool.championTeamId === tid ? 'rgba(242,200,75,0.15)' : 'transparent',
            marginBottom:'4px',
          }">
            <span style="font-size:20px;line-height:1;">{{ TEAM_BY_ID[tid].flag }}</span>
            <span style="font-size:14px;font-weight:500;color:#EDF2EA;">{{ TEAM_BY_ID[tid].name }}</span>
            <span style="margin-left:auto;font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#8DA496;">Grup {{ TEAM_BY_ID[tid].group }}</span>
          </div>
        </div>
      </div>

      <!-- footer -->
      <p style="text-align:center;font-size:11px;color:#8DA496;margin-top:20px;letter-spacing:0.05em;">
        🏆 Arisan Piala Dunia 2026
      </p>
    </div>

    <!-- ringkasan pot -->
    <div class="panel mb-6 flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
      <div class="flex flex-wrap gap-x-10 gap-y-3">
        <div>
          <p class="eyebrow">Total pot</p>
          <p class="tnum font-display text-3xl text-gold">{{ rupiah(store.pot) }}</p>
        </div>
        <div>
          <p class="eyebrow">Pemain</p>
          <p class="tnum font-display text-3xl text-chalk">{{ store.pool.players.length }}</p>
        </div>
        <div>
          <p class="eyebrow">Taruhan / orang</p>
          <p class="tnum font-display text-3xl text-chalk">{{ rupiah(store.pool.betAmount) }}</p>
        </div>
        <div>
          <p class="eyebrow">Seed</p>
          <p class="tnum font-display text-3xl tracking-wider text-chalk-dim">{{ store.pool.seed }}</p>
        </div>
      </div>
      <div class="flex flex-wrap gap-3">
        <button
          class="btn-ghost"
          :disabled="downloading"
          @click="handleDownload"
        >
          <span v-if="downloading">⏳ Menyiapkan…</span>
          <span v-else>⬇️ Download Hasil</span>
        </button>
        <button class="btn-ghost" @click="emit('redraw')">Undi ulang</button>
      </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <!-- tiket pemain -->
      <div class="grid gap-4 sm:grid-cols-2">
        <PlayerTicket
          v-for="(p, i) in store.pool.players"
          :key="p.id"
          :player="p"
          :index="i"
          :champion-id="store.pool.championTeamId"
          :is-winner="store.winner?.id === p.id"
        />
      </div>

      <!-- panel juara + bank -->
      <div class="flex flex-col gap-6">
        <SettlePanel />

        <div v-if="bankTeams.length" class="panel p-5">
          <p class="eyebrow mb-3">🏦 Bank — {{ bankTeams.length }} negara tanpa pemilik</p>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="t in bankTeams"
              :key="t.id"
              class="flex items-center gap-1.5 rounded-full border border-pitch-line px-2.5 py-1 text-sm"
              :title="`Grup ${t.group}`"
            >
              <span>{{ t.flag }}</span>
              <span class="text-chalk-dim">{{ t.name }}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
