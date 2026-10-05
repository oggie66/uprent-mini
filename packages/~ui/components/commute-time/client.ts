import { writable, type Readable } from 'svelte/store'
import {
  emptyPreferences,
  type CommutePreferences,
  type CommuteResult,
} from '~core/commute'

export type PreferenceState = {
  preferences: CommutePreferences
  status: 'loading' | 'ready' | 'error'
  error: string
}

export interface PreferenceAdapter {
  read(): Promise<CommutePreferences>
  write(preferences: CommutePreferences): Promise<void>
  listen(onChange: () => void): () => void
}

export interface CommuteClient {
  settings: Readable<PreferenceState>
  refresh(): Promise<void>
  save(preferences: CommutePreferences): Promise<void>
  load(addresses: string[]): Promise<CommuteResult[]>
}

export const createCommuteClient = (
  adapter: PreferenceAdapter,
  load: CommuteClient['load'],
): CommuteClient => {
  let revision = 0
  const refresh = async () => {
    const request = ++revision
    try {
      const preferences = await adapter.read()
      if (request === revision)
        state.set({ preferences, status: 'ready', error: '' })
    } catch (error) {
      if (request === revision)
        state.update(current => ({
          ...current,
          status: 'error',
          error:
            error instanceof Error
              ? error.message
              : 'Could not read commute settings.',
        }))
    }
  }

  const state = writable<PreferenceState>(
    { preferences: emptyPreferences(), status: 'loading', error: '' },
    () => {
      // A single subscription is shared by every mounted property card.
      const stop = adapter.listen(() => void refresh())
      void refresh()
      return () => {
        revision++
        stop()
      }
    },
  )

  return {
    settings: { subscribe: state.subscribe },
    refresh,
    save: async preferences => {
      await adapter.write(preferences)
      await refresh()
    },
    load,
  }
}
