/**
 * DOM elements for MapLibre markers. MapLibre positions the outer element with a CSS
 * transform, so any visual scaling must happen on the inner node.
 */
const RECYCLE_PATHS = [
  'M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5',
  'M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12',
  'm14 16-3 3 3 3',
  'M8.293 13.596 7.196 9.5 3.1 10.598',
  'm9.344 5.811 1.093-1.892A1.83 1.83 0 0 1 11.985 3a1.784 1.784 0 0 1 1.546.888l3.943 6.843',
  'm13.378 9.633 4.096 1.098 1.097-4.096',
]

const SVG_NS = 'http://www.w3.org/2000/svg'

function svgEl<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string>) {
  const el = document.createElementNS(SVG_NS, tag)
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v)
  return el
}

export function createPinElement(label: string): { root: HTMLDivElement; button: HTMLButtonElement } {
  const root = document.createElement('div')
  root.className = 'gp-pin-root'

  const button = document.createElement('button')
  button.type = 'button'
  button.className = 'gp-pin'
  button.setAttribute('aria-label', label)

  const svg = svgEl('svg', { viewBox: '0 0 40 52', width: '40', height: '52', 'aria-hidden': 'true' })
  svg.append(
    svgEl('path', {
      class: 'gp-pin-body',
      d: 'M20 50.5S3.5 31.2 3.5 19.5a16.5 16.5 0 0 1 33 0C36.5 31.2 20 50.5 20 50.5Z',
      stroke: '#ffffff',
      'stroke-width': '2',
    }),
  )
  const glyph = svgEl('g', {
    transform: 'translate(9.5 9) scale(0.875)',
    fill: 'none',
    stroke: '#ffffff',
    'stroke-width': '2.2',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
  })
  RECYCLE_PATHS.forEach((d) => glyph.append(svgEl('path', { d })))
  svg.append(glyph)
  button.append(svg)
  root.append(button)
  return { root, button }
}

export function createUserDotElement(): HTMLDivElement {
  const el = document.createElement('div')
  el.className = 'gp-user'
  el.setAttribute('aria-label', 'Vị trí của bạn')
  el.innerHTML = '<span class="gp-user-halo"></span><span class="gp-user-dot"></span>'
  return el
}
