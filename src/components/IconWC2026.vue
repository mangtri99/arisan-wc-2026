<template>
  <!-- Stylized FIFA World Cup 2026 trophy icon -->
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 64 72"
    fill="none"
    aria-label="FIFA World Cup 2026"
    v-bind="$attrs"
  >
    <!-- trophy cup body -->
    <path
      d="M20 6 H44 L40 34 Q32 44 24 34 Z"
      fill="#F2C84B"
    />
    <!-- handles left -->
    <path
      d="M20 10 Q8 12 10 24 Q12 32 22 30"
      stroke="#F2C84B" stroke-width="3.5" stroke-linecap="round" fill="none"
    />
    <!-- handles right -->
    <path
      d="M44 10 Q56 12 54 24 Q52 32 42 30"
      stroke="#F2C84B" stroke-width="3.5" stroke-linecap="round" fill="none"
    />
    <!-- neck -->
    <rect x="28" y="44" width="8" height="8" rx="1" fill="#F2C84B" />
    <!-- base stem -->
    <rect x="24" y="52" width="16" height="3" rx="1.5" fill="#F2C84B" />
    <!-- base -->
    <rect x="18" y="55" width="28" height="5" rx="2.5" fill="#F2C84B" />
    <!-- "26" text inside cup -->
    <text
      x="32" y="28"
      text-anchor="middle"
      font-family="Anton, system-ui, sans-serif"
      font-size="14"
      font-weight="700"
      fill="#06140E"
      letter-spacing="-0.5"
    >26</text>
    <!-- star on top -->
    <text
      x="32" y="5.5"
      text-anchor="middle"
      font-size="7"
      fill="#F2C84B"
    >★</text>
  </svg>
</template>
