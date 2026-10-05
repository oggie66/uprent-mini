import { App } from '@widgets'

export const injectApp = () => {
  // Keep a real root so page mutations do not repeatedly recreate the app.
  const root = document.createElement('div')
  root.dataset.uprentApp = ''
  document.documentElement.append(root)
  new App({ target: root })

  const stylesheet = Array.from(document.head.querySelectorAll('style')).find(
    style => style.textContent?.includes('uprent-poppins'),
  )
  const observer = new MutationObserver(() => {
    if (stylesheet && !stylesheet.isConnected) document.head.append(stylesheet)
    if (!root.isConnected) document.documentElement.append(root)
  })
  observer.observe(document.documentElement, { childList: true, subtree: true })
  window.addEventListener('pagehide', () => observer.disconnect(), {
    once: true,
  })
}
