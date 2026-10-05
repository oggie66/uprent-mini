import {
  isRecord,
  parseAddresses,
  parsePreferences,
  type CommutePreferences,
  type CommuteResult,
} from '~core/commute'
import type { CommuteReply } from '~core/commute/messages'

export interface CommuteServices {
  load(addresses: string[]): Promise<CommuteResult[]>
  read(): Promise<CommutePreferences>
  write(preferences: CommutePreferences): Promise<void>
}

export const handleCommuteMessage = async (
  message: unknown,
  services: CommuteServices,
  external = false,
): Promise<CommuteReply> => {
  try {
    if (!isRecord(message)) throw new Error('Invalid commute message.')
    switch (message.type) {
      case 'commute.preferences.get':
        return { ok: true, value: await services.read() }
      case 'commute.preferences.set': {
        const preferences = parsePreferences(message.preferences)
        await services.write(preferences)
        return { ok: true, value: preferences }
      }
      case 'commute.load':
        if (external)
          throw new Error('This operation is only available to the extension.')
        return {
          ok: true,
          value: await services.load(parseAddresses(message.addresses)),
        }
      default:
        throw new Error('Unknown commute operation.')
    }
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : 'The commute service is unavailable.',
    }
  }
}
