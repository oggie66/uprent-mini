<script lang="ts">
  import { onMount } from 'svelte'
  export let destination: string
  let patternId = ''
  onMount(() => {
    patternId = `commute-blocks-${crypto.randomUUID()}`
  })
</script>

<div class=".absolute .inset-0 .overflow-hidden .rounded-xl .bg-[#f1f0e9]">
  {#if patternId}
    <svg
      class=".block .h-full .w-full"
      viewBox="0 0 360 310"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Illustrative route between home and destination; conceptual map, not actual geography"
    >
      <defs
        ><pattern
          id={patternId}
          width="68"
          height="58"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(-12)"
          ><rect width="68" height="58" fill="#f1f0e9" /><rect
            x="8"
            y="8"
            width="22"
            height="18"
            rx="3"
            fill="#e4e5dc"
          /><rect
            x="35"
            y="8"
            width="24"
            height="18"
            rx="3"
            fill="#e8e7de"
          /><rect
            x="8"
            y="32"
            width="51"
            height="16"
            rx="3"
            fill="#e4e5dc"
          /><path d="M0 0H68M0 0V58" stroke="#fff" stroke-width="7" /></pattern
        ></defs
      >
      <rect width="360" height="310" fill={`url(#${patternId})`} />
      <path
        d="M232 -30C195 30 248 64 211 115S173 172 195 220 169 267 141 340"
        fill="none"
        stroke="#d1e3e3"
        stroke-width="29"
      />
      <path
        d="M0 76Q145 55 360 132M28 310Q80 140 329 7"
        fill="none"
        stroke="#e4e1d7"
        stroke-width="16"
      />
      <path
        d="M0 76Q145 55 360 132M28 310Q80 140 329 7"
        fill="none"
        stroke="#fff"
        stroke-width="11"
      />
      <path
        d="M14 142L81 129 103 180 28 207Z M277 206L347 188 360 262 295 275Z"
        fill="#dce7d7"
        stroke="#edf2e9"
        stroke-width="3"
      />
      <g fill="#c2d6bc"
        ><circle cx="35" cy="160" r="8" /><circle
          cx="59"
          cy="151"
          r="7"
        /><circle cx="69" cy="177" r="9" /><circle
          cx="317"
          cy="222"
          r="8"
        /><circle cx="336" cy="242" r="10" /><circle
          cx="306"
          cy="253"
          r="7"
        /></g
      >
      <path
        d="M82 239L115 204Q123 195 145 193L191 186Q212 181 217 158L228 118Q232 103 249 97L284 79"
        fill="none"
        stroke="#fff"
        stroke-width="10"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M82 239L115 204Q123 195 145 193L191 186Q212 181 217 158L228 118Q232 103 249 97L284 79"
        fill="none"
        stroke="#246553"
        stroke-width="4"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <circle cx="82" cy="239" r="17" fill="#246553" opacity=".12" /><circle
        cx="82"
        cy="239"
        r="7"
        fill="#fff"
        stroke="#246553"
        stroke-width="3"
      />
      <circle cx="284" cy="79" r="17" fill="#246553" opacity=".12" /><circle
        cx="284"
        cy="79"
        r="9"
        fill="#246553"
        stroke="#fff"
        stroke-width="3"
      />
      <g
        aria-label="This home"
        fill="white"
        stroke="#246553"
        stroke-width="2"
        stroke-linejoin="round"
        ><rect
          x="65"
          y="252"
          width="34"
          height="34"
          rx="9"
          stroke="none"
        /><path d="M72 267l10-8 10 8v12h-7v-8h-6v8h-7z" /></g
      >
    </svg>
  {/if}
  <span
    class=".absolute .right-1 .top-1 .max-w-[80%] .break-words .rounded-md .bg-white/95 .px-2 .py-1 .text-[10px] .leading-tight .text-[#203932]"
    >{destination}</span
  >
  <span
    class=".pointer-events-none .absolute .bottom-1 .right-1 .rounded .bg-white/90 .px-1.5 .py-0.5 .text-[10px] .leading-tight .text-[#69796f]"
    >Illustration</span
  >
</div>
