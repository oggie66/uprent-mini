<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import { exceedsLimit, type CommuteResult } from '~core/commute'
  import { directionsURL } from '~core/commute/directions'
  import { SettingsSVG, LoadingSpinnerSVG, ChevronUpSVG } from '~ui/assets'
  import type { CommuteClient } from './client'
  import { modes } from './travel-modes'
  import Icon from './icon.svelte'
  import SettingsDialog from './settings-dialog.svelte'
  import RouteMap from './route-map.svelte'

  export let client: CommuteClient
  export let origin = ''
  const settings = client.settings
  let mounted = false
  let editing = false
  let loading = false
  let error = ''
  let results: CommuteResult[] = []
  let request = 0
  let previousAddresses = ''
  let selectedAddress = ''

  onMount(() => {
    mounted = true
  })
  onDestroy(() => {
    request++
  })

  const load = async (addresses: string[]) => {
    const current = ++request
    loading = true
    error = ''
    results = []
    try {
      const loaded = await client.load([...addresses])
      if (current === request) results = loaded
    } catch (cause) {
      if (current === request)
        error =
          cause instanceof Error
            ? cause.message
            : 'Could not load commutes. Please try again.'
    } finally {
      if (current === request) loading = false
    }
  }

  $: addresses = $settings.preferences.addresses
  // Only changed addresses trigger requests; limits and destination selection are local.
  $: if (
    mounted &&
    $settings.status === 'ready' &&
    JSON.stringify(addresses) !== previousAddresses
  ) {
    previousAddresses = JSON.stringify(addresses)
    if (!addresses.includes(selectedAddress))
      selectedAddress = addresses[0] ?? ''
    request++
    results = []
    error = ''
    loading = false
    if (addresses.length) void load(addresses)
  }
  $: result = results.find(item => item.address === selectedAddress)
</script>

<section
  aria-label="Commute times"
  class="uprent commute-panel .w-full .min-w-0 .rounded-2xl .border .border-solid .border-[#e2e8e3] .bg-white .p-3 .text-left .text-sm .text-[#203932]"
>
  <header class=".mb-3 .flex .items-start .justify-between .gap-3">
    <div class=".min-w-0">
      <h3 class=".m-0 .text-lg .font-semibold .leading-snug">Your commute</h3>
    </div>
    <button
      type="button"
      aria-label="Edit commute preferences"
      disabled={!mounted || $settings.status !== 'ready'}
      on:click={() => (editing = true)}
      class="uprent .flex .shrink-0 .items-center .gap-1.5 .rounded-lg .border-0 .bg-[#f4f7f4] .p-2 .text-xs .text-[#246553] hover:.bg-[#eaf3ed] focus-visible:.outline focus-visible:.outline-2 focus-visible:.outline-[#246553] disabled:.opacity-50"
      ><Icon icon={SettingsSVG} class=".h-4 .w-4" />Settings</button
    >
  </header>
  {#if !mounted || $settings.status === 'loading'}
    <p role="status" class=".text-[#69796f]">Loading your preferences…</p>
  {:else if $settings.status === 'error'}
    <p role="alert" class=".text-[#69796f]">{$settings.error}</p>
    <button
      type="button"
      on:click={() => client.refresh()}
      class="uprent .rounded-lg .border-0 .bg-[#f4f7f4] .px-3 .py-2"
      >Retry connection</button
    >
  {:else if !addresses.length}
    <p class=".text-[#69796f]">
      Add the places you travel to. Your destinations apply to every home.
    </p>
    <button
      type="button"
      on:click={() => (editing = true)}
      class="uprent .rounded-lg .border-0 .bg-[#246553] .px-4 .py-3 .text-white"
      >Add a destination</button
    >
  {:else}
    <div class="commute-layout .grid .min-w-0 .gap-3">
      <div class="commute-map-column .flex .min-w-0 .flex-col">
        <label class=".mb-2 .block .text-xs .text-[#69796f]">
          <span class=".sr-only">Destination</span>
          <span class=".relative .block .min-w-0">
            <select
              bind:value={selectedAddress}
              title={selectedAddress}
              class="uprent .block .w-full .min-w-0 .appearance-none .truncate .rounded-lg .border .border-solid .border-[#e2e8e3] .bg-white .py-2.5 .pl-2.5 .pr-10 .text-sm .text-[#203932]"
            >
              {#each addresses as address}<option value={address}
                  >{address}</option
                >{/each}
            </select>
            <span
              aria-hidden="true"
              class=".pointer-events-none .absolute .inset-y-0 .right-3 .flex .items-center .leading-none .text-[#203932]"
              ><ChevronUpSVG class=".block .h-4 .w-4 .rotate-180" /></span
            >
          </span>
        </label>
        <div class="commute-map-slot">
          <RouteMap destination={selectedAddress} />
        </div>
      </div>
      <div class=".min-w-0" aria-busy={loading}>
        {#if loading}<p
            role="status"
            class=".mb-2 .mt-0 .flex .items-center .gap-2 .text-xs .text-[#69796f]"
          >
            <LoadingSpinnerSVG class=".h-4 .w-4" />Loading commutes…
          </p>{/if}
        <div class="commute-modes .grid .gap-2">
          {#each modes as mode}
            {@const minutes = result?.durations[mode.key]}
            {@const maximum = $settings.preferences.maxDurations[mode.key]}
            {@const over = minutes != null && exceedsLimit(minutes, maximum)}
            {@const href = directionsURL(origin, selectedAddress, mode.key)}
            <a
              {href}
              target="_blank"
              rel="noopener noreferrer"
              aria-disabled={!href}
              aria-label={`${mode.label} directions from ${origin || 'this home'} to ${selectedAddress} in Google Maps (opens a new tab)`}
              class="uprent commute-mode .flex .items-center .gap-2 .rounded-xl .border .border-solid .p-2 .no-underline focus-visible:.outline focus-visible:.outline-2 focus-visible:.outline-[#246553] {over
                ? '.border-red-200 .bg-red-50 .text-red-800 hover:.bg-red-100'
                : '.border-[#edf0e9] .bg-[#f7f8f5] .text-[#203932] hover:.bg-[#edf0e9]'}"
            >
              <Icon icon={mode.icon} class=".h-5 .w-5 .shrink-0" />
              <span class=".grow .text-sm"
                >{mode.label}{#if over}<span class=".mt-0.5 .block .text-[11px]"
                    >Over {maximum} min limit</span
                  >{/if}</span
              >
              <span
                class="commute-value .whitespace-nowrap .text-base .font-semibold"
                >{minutes === null
                  ? 'N/A'
                  : minutes === undefined
                    ? '—'
                    : `${minutes} min`}</span
              >
              <span aria-hidden="true" class="commute-arrow .text-xs">↗</span>
            </a>
          {/each}
        </div>
        {#if !origin}<p class=".text-xs .text-[#69796f]">
            Listing address unavailable. Directions cannot be opened.
          </p>{/if}
        {#if error}<p role="alert" class=".text-xs .text-red-800">{error}</p>
          <button
            type="button"
            on:click={() => load(addresses)}
            class="uprent .rounded-lg .border-0 .bg-[#f4f7f4] .px-3 .py-2"
            >Try again</button
          >{/if}
      </div>
    </div>
  {/if}
</section>
{#if editing}<SettingsDialog
    preferences={$settings.preferences}
    onSave={client.save}
    onClose={() => (editing = false)}
  />{/if}

<style>
  .commute-panel {
    container-type: inline-size;
    color-scheme: light;
  }
  .commute-layout {
    grid-template-columns: 1fr;
  }
  .commute-modes {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .commute-map-slot {
    position: relative;
    height: 120px;
  }
  .commute-mode {
    display: grid;
    grid-template-columns: 20px minmax(0, 1fr);
  }
  .commute-value {
    grid-column: 2;
  }
  .commute-arrow {
    display: none;
  }
  @container (min-width: 430px) {
    .commute-map-slot {
      height: 0;
      min-height: 0;
      flex: 1;
    }
    .commute-modes {
      grid-template-columns: 1fr;
    }
    .commute-mode {
      display: flex;
      flex-wrap: nowrap;
    }
    .commute-arrow {
      display: inline;
    }
    .commute-layout {
      grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
    }
  }
</style>
