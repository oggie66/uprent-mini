<script lang="ts">
  import { CashSVG, DimensionsSVG } from '~ui/assets'
  import type { Property } from '~core/database'
  import { CommuteTime } from '$lib/widgets'

  export let property: Property
  let failedImageURL: string | undefined
</script>

<div
  class=".relative .grid .min-w-0 .shrink-0 .grid-cols-[200px_minmax(0,1fr)_540px] .rounded-md .bg-white .text-left .shadow-md md:.grid-cols-[200px_minmax(0,1fr)] sm:.grid-cols-1"
>
  <div
    class=".relative .h-[200px] .w-[200px] .self-start .overflow-hidden .rounded-md .bg-gray-100"
  >
    {#if !property.previewImageURL || failedImageURL === property.previewImageURL}
      <div
        class=".flex .h-full .items-center .justify-center .p-4 .text-center .text-sm .text-gray-500"
      >
        Photo unavailable
      </div>
    {:else}
      <img
        src={property.previewImageURL}
        alt=""
        aria-hidden="true"
        class=".absolute .inset-0 .h-full .w-full .scale-125 .object-cover .blur-xl"
      />
      <img
        src={property.previewImageURL}
        alt={property.title}
        on:error={() => (failedImageURL = property.previewImageURL)}
        class=".relative .block .h-full .w-full .object-contain"
      />
    {/if}
  </div>
  <div class=".flex .min-w-0 .flex-col .gap-6 .p-5">
    <div class=".flex .flex-col .gap-1">
      <span
        class=".relative .self-start .break-words .text-left .font-bold .text-primary hover:.underline"
      >
        <a
          href={property.sourceURL}
          target="_blank"
          class=".font-semibold .text-primary"
        >
          {property.title}
        </a>
      </span>
      <span class=".text-gray-600">{property.cityName}</span>
    </div>
    <div class=".mt-2 .flex .flex-col .gap-1">
      {#if property.price}
        <span class=".flex .gap-2">
          <CashSVG />
          <b>{property.price}</b> /month
        </span>
      {/if}
      {#if property.area}
        <span class=".flex .gap-2">
          <DimensionsSVG />
          <span>
            <b>{property.area}</b> m²
          </span>
        </span>
      {/if}
    </div>
  </div>
  <div class=".min-w-0 .p-3 md:.col-span-2 sm:.col-span-1">
    <CommuteTime origin={`${property.title}, ${property.cityName}`} />
  </div>
</div>
