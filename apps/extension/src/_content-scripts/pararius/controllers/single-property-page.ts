import { SinglePropertyPageController } from '@features'
import { CommuteTime } from '@widgets'
import { parariusOrigin } from '~core/commute/directions'

class ParariusController extends SinglePropertyPageController {
  constructor() {
    super()
  }

  private target: HTMLDivElement | null = null
  private widget: CommuteTime | null = null
  private url = ''

  onPageMutation() {
    if (this.target?.isConnected && this.url === location.pathname) return

    this.widget?.$destroy()
    this.target?.remove()
    this.widget = null
    this.target = null

    const container = document.querySelector('.listing-detail-summary')
    if (!container) return

    this.url = location.pathname
    this.target = document.createElement('div')
    this.target.className = 'uprent-travel-time uprent-pararius-travel-time'
    container.append(this.target)
    const title = container.querySelector('h1')?.textContent ?? ''
    this.widget = new CommuteTime({
      target: this.target,
      props: { origin: parariusOrigin(title) },
    })
  }
}

export const singlePropertyPageController = new ParariusController()
