import type { TravelMode } from './index'

const googleModes: Record<TravelMode, string> = {
  walking: 'walking',
  biking: 'bicycling',
  transit: 'transit',
  driving: 'driving',
}

export function directionsURL(
  origin: string,
  destination: string,
  mode: TravelMode,
) {
  if (!origin.trim() || !destination.trim()) return undefined
  const query = new URLSearchParams({
    api: '1',
    origin: origin.trim(),
    destination: destination.trim(),
    travelmode: googleModes[mode],
  })
  return `https://www.google.com/maps/dir/?${query}`
}

export function parariusOrigin(title: string) {
  return title
    .trim()
    .replace(/^(?:For rent|Te huur):\s*/i, '')
    .replace(
      /^(?:Flat|Apartment|House|Studio|Room|Appartement|Huis|Woning|Kamer)\s+/i,
      '',
    )
    .replace(/\s+in\s+/i, ', ')
}
