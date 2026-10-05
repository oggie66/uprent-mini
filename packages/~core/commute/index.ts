import type { Durations } from '../database/data-types/durations'

export const travelModes = ['walking', 'biking', 'transit', 'driving'] as const
export type TravelMode = (typeof travelModes)[number]

export type CommutePreferences = {
  addresses: string[]
  maxDurations: Record<TravelMode, number | null>
}

export type CommuteResult = {
  address: string
  durations: Durations
}

export const emptyPreferences = (): CommutePreferences => ({
  addresses: [],
  maxDurations: { walking: null, biking: null, transit: null, driving: null },
})

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

export const parseAddresses = (
  value: unknown,
  allowEmpty = false,
): string[] => {
  if (
    !Array.isArray(value) ||
    value.length > 2 ||
    (!allowEmpty && !value.length)
  ) {
    throw new Error('Choose one or two destination addresses.')
  }

  const addresses = value.map(address => {
    if (
      typeof address !== 'string' ||
      !address.trim() ||
      address.trim().length > 200
    ) {
      throw new Error('Each address must contain between 1 and 200 characters.')
    }
    return address.trim()
  })

  if (
    new Set(addresses.map(address => address.toLocaleLowerCase())).size !==
    addresses.length
  ) {
    throw new Error('Please choose two different addresses.')
  }
  return addresses
}

export const parsePreferences = (value: unknown): CommutePreferences => {
  if (!isRecord(value) || !isRecord(value.maxDurations)) {
    throw new Error('Your saved commute settings could not be read.')
  }
  const addresses = parseAddresses(value.addresses, true)
  const maxDurations = emptyPreferences().maxDurations
  for (const mode of travelModes) {
    const minutes = value.maxDurations[mode]
    if (
      minutes !== null &&
      (typeof minutes !== 'number' ||
        !Number.isInteger(minutes) ||
        minutes < 1 ||
        minutes > 1440)
    ) {
      throw new Error(
        'Travel limits must be whole minutes between 1 and 1440, or empty.',
      )
    }
    maxDurations[mode] = minutes as number | null
  }
  return { addresses, maxDurations }
}

export const isCommuteResults = (value: unknown): value is CommuteResult[] =>
  Array.isArray(value) &&
  value.length >= 1 &&
  value.length <= 2 &&
  value.every(
    result =>
      isRecord(result) &&
      typeof result.address === 'string' &&
      isRecord(result.durations) &&
      travelModes.every(mode => {
        const minutes = (result.durations as Record<string, unknown>)[mode]
        return (
          minutes === null ||
          (typeof minutes === 'number' &&
            Number.isFinite(minutes) &&
            minutes >= 0)
        )
      }),
  )

export const exceedsLimit = (minutes: number | null, maximum: number | null) =>
  minutes !== null && maximum !== null && minutes > maximum
