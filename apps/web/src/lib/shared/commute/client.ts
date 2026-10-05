import { loadCommutes } from '~api/commute'
import { parsePreferences } from '~core/commute'
import {
  EXTENSION_ID,
  type CommuteMessage,
  type CommuteReply,
} from '~core/commute/messages'
import { createCommuteClient } from '~ui/components/commute-time/client'

const setupMessage =
  'Install or reload the Uprent Mini Chrome extension, then reload this page at localhost:5173 to share your commute preferences.'

const getRuntime = () =>
  typeof chrome !== 'undefined' ? chrome.runtime : undefined

const send = (message: CommuteMessage): Promise<CommuteReply> =>
  new Promise((resolve, reject) => {
    const runtime = getRuntime()
    if (!runtime?.sendMessage) return reject(new Error(setupMessage))
    const timeout = setTimeout(
      () =>
        reject(
          new Error('The extension did not respond. Reload it and try again.'),
        ),
      5_000,
    )
    runtime.sendMessage(
      EXTENSION_ID,
      message,
      (response: CommuteReply | undefined) => {
        clearTimeout(timeout)
        if (runtime.lastError || !response) reject(new Error(setupMessage))
        else if (!response.ok) reject(new Error(response.error))
        else resolve(response)
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
      if (typeof window === 'undefined') return () => undefined
      let port: chrome.runtime.Port | undefined
      let timer: ReturnType<typeof setTimeout> | undefined
      let stopped = false
      const connect = () => {
        const runtime = getRuntime()
        if (!runtime?.connect || stopped) return
        port = runtime.connect(EXTENSION_ID, { name: 'commute.preferences' })
        port.onMessage.addListener(onChange)
        port.onDisconnect.addListener(() => {
          // Reading lastError prevents an unhandled Chrome diagnostic on reload.
          void runtime.lastError
          if (!stopped)
            timer = setTimeout(() => {
              connect()
              onChange()
            }, 2_000)
        })
      }
      connect()
      window.addEventListener('focus', onChange)
      return () => {
        stopped = true
        clearTimeout(timer)
        port?.disconnect()
        window.removeEventListener('focus', onChange)
      }
    },
  },
  loadCommutes,
)
