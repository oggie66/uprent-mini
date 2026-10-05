import type { CommutePreferences, CommuteResult } from '.'

export const EXTENSION_ID = 'nnjokgfpoecefilcbmcinacgmefmdabl'
export const WEB_ORIGIN = 'http://localhost:5173'
export const PREFERENCES_KEY = 'commute-preferences-v1'

export type CommuteMessage =
  | { type: 'commute.load'; addresses: string[] }
  | { type: 'commute.preferences.get' }
  | { type: 'commute.preferences.set'; preferences: CommutePreferences }

export type Reply<T> = { ok: true; value: T } | { ok: false; error: string }
export type CommuteReply = Reply<CommutePreferences | CommuteResult[]>

export const isWebOrigin = (url: string | undefined) => {
  try {
    return !!url && new URL(url).origin === WEB_ORIGIN
  } catch {
    return false
  }
}

export const isRentalOrigin = (url: string | undefined) => {
  try {
    if (!url) return false
    const { origin } = new URL(url)
    return ['https://www.pararius.com', 'https://www.pararius.nl'].includes(
      origin,
    )
  } catch {
    return false
  }
}
