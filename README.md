# 🏆 Arisan Piala Dunia 2026

Undian acak negara peserta Piala Dunia 2026 buat taruhan seru bareng teman. Masukkan daftar nama, sistem membagikan negara secara acak & unik, set taruhan, lalu pemegang negara juara mengambil seluruh pot (**winner-takes-all**).

Dibuat dengan **Vue 3 + Vite + TypeScript + Tailwind CSS + Pinia**. Tanpa backend — semua jalan di browser dan tersimpan di `localStorage`.

## Fitur

- Input daftar pemain (satu nama per baris).
- Jumlah negara per orang **tetap** (1–3), dibagi acak & unik dari 48 peserta.
- Taruhan seragam per orang (Rupiah), pot dihitung otomatis.
- **Provably fair**: undian pakai RNG ber-seed. Seed sama → hasil identik, jadi bisa diverifikasi bareng-bareng.
- Sisa negara yang tak kebagian masuk ke "bank".
- Pilih negara juara setelah final → otomatis tampilkan pemenang & payout.
- Hasil tersimpan walau halaman di-refresh.

## Menjalankan

```bash
npm install
npm run dev      # buka http://localhost:5173
npm run build    # build produksi ke /dist
npm run preview  # preview hasil build
```

Butuh Node.js 18+.

## Cara kerja undian

`src/lib/draw.ts` memakai Fisher-Yates shuffle dengan RNG ber-seed (mulberry32). 48 negara diacak berdasarkan seed, lalu dibagikan berurutan ke tiap pemain sebanyak `teamsPerPlayer`. Sisanya jadi bank. Karena deterministik, siapa pun yang memasukkan seed yang sama akan mendapat hasil undian yang persis sama.

## Push ke GitHub

Repo ini sudah di-`git init` dengan satu commit awal. Untuk push ke GitHub kamu:

```bash
# 1) buat repo kosong dulu di github.com (tanpa README/gitignore)
# 2) lalu dari folder ini:
git remote add origin git@github.com:USERNAME/arisan-piala-dunia.git
git branch -M main
git push -u origin main
```

Ganti `USERNAME` dengan username GitHub-mu. Pakai URL `https://github.com/...` kalau belum set SSH.

## Struktur

```
src/
  data/teams.ts        # 48 peserta + bendera + grup (hasil undian FIFA)
  lib/draw.ts          # undian acak ber-seed (provably fair)
  lib/format.ts        # format Rupiah
  stores/pool.ts       # state Pinia + persistensi localStorage + payout
  components/          # SetupForm, DrawReveal, Dashboard, PlayerTicket, SettlePanel
  types.ts
```

## Ide pengembangan

- Jumlah negara acak 1–3 dengan taruhan terskala.
- Payout berjenjang (juara/runner-up/semifinalis) + tracking babak gugur.
- Share hasil sebagai gambar / link.
- Sinkron antar perangkat (Supabase/Firebase) untuk arisan jarak jauh.
