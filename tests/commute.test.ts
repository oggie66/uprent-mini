import {
  directionsURL,
  parariusOrigin,
} from '../packages/~core/commute/directions'
import type { TravelMode } from '../packages/~core/commute'
import { describe, expect, test } from 'bun:test'
import {
  emptyPreferences,
  exceedsLimit,
  isCommuteResults,
  parseAddresses,
  parsePreferences,
} from '../packages/~core/commute'
import { isRentalOrigin, isWebOrigin } from '../packages/~core/commute/messages'
import {
  handleCommuteMessage,
  type CommuteServices,
} from '../apps/extension/src/_service-worker/commute-handler'

const duration = { walking: 45, biking: 25, driving: 10, transit: null }

const services = (): CommuteServices => {
  let saved = emptyPreferences()
  return {
    read: () => Promise.resolve(saved),
    write: value => {
      saved = value
      return Promise.resolve()
    },
    load: addresses =>
      Promise.resolve(
        addresses.map(address => ({ address, durations: duration })),
      ),
  }
}

describe('commute inputs', () => {
  test('trims one or two addresses and permits empty saved preferences', () => {
    expect(parseAddresses(['  Delft  ', 'Den Haag'])).toEqual([
      'Delft',
      'Den Haag',
    ])
    expect(parsePreferences(emptyPreferences()).addresses).toEqual([])
  })
  test('rejects missing, duplicate, excessive and malformed addresses', () => {
    for (const addresses of [
      [],
      [' '],
      ['Delft', 'DELFT'],
      ['a', 'b', 'c'],
      [null],
      ['x'.repeat(201)],
    ]) {
      expect(() => parseAddresses(addresses)).toThrow()
    }
  })
  test('validates limits including zero, fractions, missing fields and infinity', () => {
    for (const limit of [0, -1, 1.5, Infinity, 1441, undefined, '30']) {
      expect(() =>
        parsePreferences({
          ...emptyPreferences(),
          maxDurations: { ...emptyPreferences().maxDurations, walking: limit },
        }),
      ).toThrow()
    }
  })
  test('highlights only available durations strictly beyond an active limit', () => {
    expect(exceedsLimit(31, 30)).toBe(true)
    expect(exceedsLimit(30, 30)).toBe(false)
    expect(exceedsLimit(null, 30)).toBe(false)
    expect(exceedsLimit(31, null)).toBe(false)
  })
  test('rejects malformed API results', () => {
    expect(isCommuteResults([{ address: 'Delft', durations: duration }])).toBe(
      true,
    )
    expect(
      isCommuteResults([
        { address: 'Delft', durations: { ...duration, biking: NaN } },
      ]),
    ).toBe(false)
    expect(isCommuteResults([])).toBe(false)
  })
})

describe('extension request boundary', () => {
  test('accepts only exact trusted origins', () => {
    expect(isWebOrigin('http://localhost:5173/feed')).toBe(true)
    expect(isWebOrigin('http://localhost:5001')).toBe(false)
    expect(isWebOrigin('https://localhost:5173.attacker.example')).toBe(false)
    expect(
      isRentalOrigin('https://www.pararius.com/apartment-for-rent/example'),
    ).toBe(true)
    expect(isRentalOrigin('https://www.pararius.com.attacker.example')).toBe(
      false,
    )
    expect(isRentalOrigin('http://www.pararius.com')).toBe(false)
  })
  test('loads through the worker and returns an explicit response', async () => {
    expect(
      await handleCommuteMessage(
        { type: 'commute.load', addresses: ['Delft'] },
        services(),
      ),
    ).toEqual({ ok: true, value: [{ address: 'Delft', durations: duration }] })
  })
  test('rejects arbitrary fetches and external commute requests', async () => {
    expect(
      (
        await handleCommuteMessage(
          { type: 'fetch', url: 'http://example.com' },
          services(),
        )
      ).ok,
    ).toBe(false)
    expect(
      (
        await handleCommuteMessage(
          { type: 'commute.load', addresses: ['Delft'] },
          services(),
          true,
        )
      ).ok,
    ).toBe(false)
  })
  test('web and extension use the same saved settings', async () => {
    const backend = services()
    const preferences = { ...emptyPreferences(), addresses: ['Utrecht'] }
    await handleCommuteMessage(
      { type: 'commute.preferences.set', preferences },
      backend,
      true,
    )
    expect(
      await handleCommuteMessage({ type: 'commute.preferences.get' }, backend),
    ).toEqual({ ok: true, value: preferences })
  })
  test('network errors always become a failure reply', async () => {
    const backend = services()
    backend.load = () => Promise.reject(new Error('API unavailable'))
    expect(
      await handleCommuteMessage(
        { type: 'commute.load', addresses: ['Delft'] },
        backend,
      ),
    ).toEqual({ ok: false, error: 'API unavailable' })
  })
})

describe('Google Maps directions', () => {
  test('preserves addresses and uses the correct mode for every transport', () => {
    for (const [mode, expected] of Object.entries({
      walking: 'walking',
      biking: 'bicycling',
      transit: 'transit',
      driving: 'driving',
    })) {
      const url = new URL(
        directionsURL(
          'Milletstraat, Amsterdam',
          'Station & Café, Leiden',
          mode as TravelMode,
        )!,
      )
      expect(url.origin).toBe('https://www.google.com')
      expect(url.searchParams.get('api')).toBe('1')
      expect(url.searchParams.get('origin')).toBe('Milletstraat, Amsterdam')
      expect(url.searchParams.get('destination')).toBe('Station & Café, Leiden')
      expect(url.searchParams.get('travelmode')).toBe(expected)
    }
  })
  test('does not silently route from the user location when the listing address is missing', () => {
    expect(directionsURL('', 'Amsterdam Centraal', 'walking')).toBeUndefined()
    expect(directionsURL('Milletstraat', ' ', 'walking')).toBeUndefined()
  })
  test('extracts the property origin from English and Dutch listing headings', () => {
    expect(parariusOrigin('For rent: Flat Milletstraat in Amsterdam')).toBe(
      'Milletstraat, Amsterdam',
    )
    expect(
      parariusOrigin('Te huur: Appartement Milletstraat in Amsterdam'),
    ).toBe('Milletstraat, Amsterdam')
  })
})
