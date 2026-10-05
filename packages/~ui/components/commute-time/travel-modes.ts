import { WalkSVG, BikeSVG, BusSVG, CarSVG } from '~ui/assets'

export const modes = [
  { key: 'walking', label: 'Walk', icon: WalkSVG },
  { key: 'biking', label: 'Cycle', icon: BikeSVG },
  { key: 'transit', label: 'Transit', icon: BusSVG },
  { key: 'driving', label: 'Drive', icon: CarSVG },
] as const
