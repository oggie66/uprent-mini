<script lang="ts">
  import { CommuteTime } from '~ui/components'
  import { commuteClient } from '$lib/shared/commute/client'
  export let origin: string
</script>

<CommuteTime client={commuteClient} {origin} />
