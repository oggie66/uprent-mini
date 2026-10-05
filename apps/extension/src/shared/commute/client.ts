import { isCommuteResults, parsePreferences } from '~core/commute'
import {
  PREFERENCES_KEY,
  type CommuteMessage,
  type CommuteReply,
} from '~core/commute/messages'
import { createCommuteClient } from '~ui/components/commute-time/client'

const send = (message: CommuteMessage): Promise<CommuteReply> =>
  new Promise((resolve, reject) => {
    const timeout = setTimeout(
      () =>
        reject(
          new Error('The extension did not respond. Reload it and try again.'),
        ),
      20_000,
    )
    chrome.runtime.sendMessage(
      message,
      (response: CommuteReply | undefined) => {
        clearTimeout(timeout)
        if (chrome.runtime.lastError || !response) {
          reject(
            new Error(
              'The extension is unavailable. Reload this page and try again.',
            ),
          )
        } else if (!response.ok) {
          reject(new Error(response.error))
        } else {
          resolve(response)
        }
      },
    )
  })

export const commuteClient = createCommuteClient(
  {
    read: async () => {
      const response = await send({ type: 'commute.preferences.get' })
      if (!response.ok) throw new Error(response.error)
      return parsePreferences(response.value)
    },
    write: async preferences => {
      await send({ type: 'commute.preferences.set', preferences })
    },
    listen: onChange => {
      const listener = (
        changes: Record<string, chrome.storage.StorageChange>,
        area: string,
      ) => {
        if (area === 'local' && PREFERENCES_KEY in changes) onChange()
      }
      chrome.storage.onChanged.addListener(listener)
      return () => chrome.storage.onChanged.removeListener(listener)
    },
  },
  async addresses => {
    const response = await send({ type: 'commute.load', addresses })
    if (!response.ok || !isCommuteResults(response.value))
      throw new Error('The commute response could not be read.')
    return response.value
  },
)
