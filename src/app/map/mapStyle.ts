import type { StyleSpecification } from 'maplibre-gl'

/** OpenFreeMap vector style: free, no API key. Attribution is required and shown on the map. */
export const PRIMARY_STYLE_URL = 'https://tiles.openfreemap.org/styles/bright'

/** Used only when the vector style cannot be loaded. */
export const FALLBACK_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      maxzoom: 19,
      attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
    },
  },
  layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
}
