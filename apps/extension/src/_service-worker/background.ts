import { loadCommutes } from '~api/commute'
import { emptyPreferences, parsePreferences } from '~core/commute'
import {
  isRentalOrigin,
  isWebOrigin,
  PREFERENCES_KEY,
  type CommuteReply,
} from '~core/commute/messages'
import { handleCommuteMessage, type CommuteServices } from './commute-handler'

const services: CommuteServices = {
  load: loadCommutes,
  read: async () => {
    const saved = await chrome.storage.local.get(PREFERENCES_KEY)
    return saved[PREFERENCES_KEY] === undefined
      ? emptyPreferences()
      : parsePreferences(saved[PREFERENCES_KEY])
  },
  write: async preferences => {
    await chrome.storage.local.set({ [PREFERENCES_KEY]: preferences })
  },
}

chrome.runtime.onMessage.addListener(
  (message: unknown, sender, reply: (response: CommuteReply) => void) => {
    if (sender.id !== chrome.runtime.id || !isRentalOrigin(sender.url)) {
      reply({
        ok: false,
        error: 'This page is not allowed to use the commute service.',
      })
      return false
    }
    void handleCommuteMessage(message, services).then(reply)
    return true
  },
)

chrome.runtime.onMessageExternal.addListener(
  (message: unknown, sender, reply: (response: CommuteReply) => void) => {
    if (!isWebOrigin(sender.url)) {
      reply({
        ok: false,
        error: 'This website is not allowed to access commute preferences.',
      })
      return false
    }
    void handleCommuteMessage(message, services, true).then(reply)
    return true
  },
)

const webClients = new Set<chrome.runtime.Port>()
chrome.runtime.onConnectExternal.addListener(port => {
  if (port.name !== 'commute.preferences' || !isWebOrigin(port.sender?.url)) {
    port.disconnect()
    return
  }
  webClients.add(port)
  port.onDisconnect.addListener(() => webClients.delete(port))
})

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local' || !(PREFERENCES_KEY in changes)) return
  for (const port of webClients) {
    try {
      port.postMessage({ type: 'commute.preferences.changed' })
    } catch {
      webClients.delete(port)
    }
  }
})
