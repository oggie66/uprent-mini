<script lang="ts">
  import { onMount } from 'svelte'
  import {
    parsePreferences,
    type CommutePreferences,
    type TravelMode,
  } from '~core/commute'
  import { modes } from './travel-modes'
  import Icon from './icon.svelte'

  export let preferences: CommutePreferences
  export let onSave: (preferences: CommutePreferences) => Promise<void>
  export let onClose: () => void

  const suggestions = [
    'Amsterdam Centraal, Amsterdam',
    'Utrecht Centraal, Utrecht',
    'Rotterdam Centraal, Rotterdam',
    'Den Haag Centraal, Den Haag',
    'Leiden University, Leiden',
    'Schiphol Airport, Schiphol',
    'TU Delft, Delft',
  ]
  const id = `commute-${crypto.randomUUID()}`
  let dialog: HTMLDialogElement
  let addresses = preferences.addresses.length
    ? [...preferences.addresses]
    : ['']
  let limits: Record<TravelMode, number | undefined> = Object.fromEntries(
    modes.map(({ key }) => [key, preferences.maxDurations[key] ?? undefined]),
  ) as Record<TravelMode, number | undefined>
  let saving = false
  let error = ''

  onMount(() => dialog.showModal())

  const save = async () => {
    error = ''
    try {
      const next = parsePreferences({
        addresses: addresses.map(address => address.trim()).filter(Boolean),
        maxDurations: Object.fromEntries(
          modes.map(({ key }) => [key, limits[key] ?? null]),
        ),
      })
      saving = true
      await onSave(next)
      dialog.close()
    } catch (cause) {
      error =
        cause instanceof Error
          ? cause.message
          : 'Settings could not be saved. Please try again.'
    } finally {
      saving = false
    }
  }
</script>

<dialog
  bind:this={dialog}
  aria-labelledby={`${id}-title`}
  aria-describedby={`${id}-description`}
  on:close={onClose}
  on:cancel={event => {
    if (saving) event.preventDefault()
  }}
  class="uprent .fixed .inset-0 .m-auto .max-h-[90dvh] .w-[min(540px,calc(100%-32px))] .overflow-y-auto .rounded-2xl .border-0 .bg-white .p-0 .text-black .shadow-2xl"
>
  <form on:submit|preventDefault={save} class=".p-6 xs:.p-4">
    <div class=".flex .items-start .justify-between .gap-4">
      <div>
        <p
          class=".m-0 .text-xs .font-semibold .uppercase .tracking-widest .text-[#246553]"
        >
          Your everyday journey
        </p>
        <h2 id={`${id}-title`} class=".mb-2 .mt-2 .text-2xl .font-semibold">
          Commute preferences
        </h2>
      </div>
      <button
        type="button"
        aria-label="Close preferences"
        disabled={saving}
        on:click={() => dialog.close()}
        class="uprent .rounded-full .bg-gray-100 .px-3 .py-2 .text-lg hover:.bg-gray-200 focus-visible:.outline focus-visible:.outline-2 focus-visible:.outline-[#246553]"
        >×</button
      >
    </div>
    <p
      id={`${id}-description`}
      class=".mb-6 .mt-0 .text-sm .leading-relaxed .text-gray-600"
    >
      Add the places you travel to. Your addresses and limits are shared with
      the Uprent extension in this browser.
    </p>

    <fieldset disabled={saving} class=".m-0 .min-w-0 .border-0 .p-0">
      <legend class=".mb-3 .text-sm .font-semibold"
        >Destinations <span class=".font-normal .text-gray-500"
          >· up to two</span
        ></legend
      >
      <div class=".space-y-3">
        {#each addresses as address, index}
          <div>
            <label
              for={`${id}-address-${index}`}
              class=".mb-1 .block .text-xs .font-medium .text-gray-600"
              >Destination {index + 1}</label
            >
            <div class=".flex .gap-2">
              <input
                id={`${id}-address-${index}`}
                list={`${id}-suggestions`}
                type="text"
                maxlength="200"
                autocomplete="off"
                placeholder="Work, university, or another address"
                bind:value={addresses[index]}
                class="uprent .min-w-0 .flex-1 .rounded-lg .border .border-solid .border-gray-300 .bg-white .px-3 .py-3 .text-sm focus:.border-primary focus:.ring-2 focus:.ring-primary-100"
              />
              <button
                type="button"
                aria-label={`Remove destination ${index + 1}`}
                on:click={() =>
                  (addresses = addresses.filter(
                    (_, position) => position !== index,
                  ))}
                class="uprent .rounded-lg .bg-gray-100 .px-3 .text-sm .text-gray-600 hover:.bg-gray-200 focus-visible:.outline focus-visible:.outline-2 focus-visible:.outline-[#246553]"
                >Remove</button
              >
            </div>
          </div>
        {/each}
      </div>
      <datalist id={`${id}-suggestions`}>
        {#each suggestions as address}<option value={address} />{/each}
      </datalist>
      {#if addresses.length < 2}
        <button
          type="button"
          on:click={() => (addresses = [...addresses, ''])}
          class="uprent .mt-3 .rounded-md .bg-[#eaf3ed] .px-3 .py-2 .text-sm .font-medium .text-[#246553] focus-visible:.outline focus-visible:.outline-2 focus-visible:.outline-[#246553]"
          >+ Add {addresses.length ? 'another' : 'an'} address</button
        >
      {/if}
      <p class=".mb-0 .mt-2 .text-xs .text-gray-500">
        Suggestions are examples. You can enter any address.
      </p>
    </fieldset>

    <fieldset
      disabled={saving}
      class=".mb-0 .ml-0 .mr-0 .mt-7 .min-w-0 .border-0 .p-0"
    >
      <legend class=".mb-1 .text-sm .font-semibold">Maximum travel time</legend>
      <p class=".mb-4 .mt-0 .text-xs .leading-relaxed .text-gray-500">
        These limits apply to both destinations. Leave a field empty for no
        limit.
      </p>
      <div class=".grid .grid-cols-2 .gap-3">
        {#each modes as mode}
          <label
            class=".rounded-xl .border .border-solid .border-gray-200 .bg-gray-50 .p-3"
          >
            <span class=".mb-2 .flex .items-center .gap-2 .text-sm .font-medium"
              ><Icon icon={mode.icon} class=".h-4 .w-4" />{mode.label}</span
            >
            <span class=".flex .items-center .gap-2">
              <input
                type="number"
                min="1"
                max="1440"
                step="1"
                inputmode="numeric"
                aria-label={`${mode.label} maximum minutes`}
                bind:value={limits[mode.key]}
                placeholder="No limit"
                class="uprent .w-full .min-w-0 .rounded-md .border .border-solid .border-gray-300 .bg-white .px-2 .py-2 .text-sm focus:.border-primary focus:.ring-2 focus:.ring-primary-100"
              />
              <span class=".text-xs .text-gray-500">min</span>
            </span>
          </label>
        {/each}
      </div>
    </fieldset>

    {#if error}<p
        role="alert"
        class=".mb-0 .mt-4 .rounded-lg .bg-red-50 .p-3 .text-sm .text-red-800"
      >
        {error}
      </p>{/if}
    <div
      class=".mt-6 .flex .justify-end .gap-3 .border-0 .border-t .border-solid .border-gray-100 .pt-5"
    >
      <button
        type="button"
        disabled={saving}
        on:click={() => dialog.close()}
        class="uprent .rounded-lg .bg-gray-100 .px-4 .py-3 .text-sm .font-medium focus-visible:.outline focus-visible:.outline-2 focus-visible:.outline-[#246553]"
        >Cancel</button
      >
      <button
        type="submit"
        disabled={saving}
        class="uprent .rounded-lg .bg-[#246553] .px-5 .py-3 .text-sm .font-medium .text-white hover:.bg-[#194b3d] focus-visible:.outline focus-visible:.outline-2 focus-visible:.outline-offset-2 focus-visible:.outline-[#246553] disabled:.opacity-60"
        >{saving ? 'Saving…' : 'Save preferences'}</button
      >
    </div>
  </form>
</dialog>

<style>
  dialog {
    color-scheme: light;
  }
  dialog::backdrop {
    background: rgb(20 18 24 / 55%);
    backdrop-filter: blur(3px);
  }
</style>
