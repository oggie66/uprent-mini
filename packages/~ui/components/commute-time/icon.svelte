<script lang="ts">
  import type { ComponentType } from 'svelte'
  export let icon: ComponentType
  export let className = '.h-5 .w-5'
  export { className as class }
</script>

<span aria-hidden="true" class=".inline-flex .shrink-0 {className}"
  ><svelte:component this={icon} /></span
>

<style>
  span > :global(svg) {
    width: 100%;
    height: 100%;
  }
</style>
