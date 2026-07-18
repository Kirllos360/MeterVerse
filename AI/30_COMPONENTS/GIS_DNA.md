# MeterVerse GIS DNA

**Defines reusable Geographic Information System components. Resolves IV Finding #1.**

---

## 1. GIS Architecture

GIS capabilities are provided via an abstract map interface that supports interchangeable map providers (Leaflet, Mapbox, Google Maps):

```
MapProvider (abstract)
├── MapContainer
├── Marker
├── MarkerCluster
├── Popup / InfoWindow
├── LayerControl
├── GeoJSONLayer
├── HeatmapLayer
├── DrawingManager
├── SearchBox
├── MeasurementTool
├── Polygon / Circle / Polyline
└── RoutingControl
```

## 2. Components

| Component | Purpose | Props | Events |
|-----------|---------|-------|--------|
| MapContainer | Base map with tiles, zoom, center | center, zoom, maxBounds, provider | onMove, onClick, onZoom |
| Marker | Point on map | position, icon, draggable, label | onClick, onDrag |
| MarkerCluster | Group nearby markers | markers, clusterOptions, maxZoom | onClusterClick |
| Popup | Content bubble on marker/click | position, content, offset | onClose |
| InfoWindow | Persistent detail panel | position, content, width | onClose |
| LayerControl | Toggle layer visibility | layers (array), position, collapsed | onToggle |
| GeoJSONLayer | Render GeoJSON data | data, style, onEachFeature | onClick |
| HeatmapLayer | Density visualization | points, radius, blur, maxIntensity | — |
| DrawingManager | Draw shapes on map | modes (polygon/circle/rectangle), editable | onDraw, onEdit |
| SearchBox | Geocoding search | placeholder, provider | onSelect |
| MeasurementTool | Distance/area measurement | unit, precision | onMeasure |
| Polygon | Area overlay | paths, fillColor, strokeColor, editable | onClick, onEdit |
| Circle | Radius overlay | center, radius, fillColor | onClick |
| Polyline | Path/route | positions, color, weight | onClick |
| RoutingControl | A→B route | waypoints, provider, showAlternatives | onRoute |

## 3. States

| State | Behavior |
|-------|----------|
| Loading | Skeleton map outline + spinner |
| Empty | Map centered on default coordinates with "No data" message |
| Error | Error banner with retry button |
| Populated | Normal interactive map with markers/layers |

## 4. Accessibility

- Map container has role="application" and aria-label
- Markers have aria-label with entity name
- Popup has role="dialog" and aria-labelledby
- Keyboard: Tab through markers, Enter to select, Esc to close popup
- Zoom controls have visible +/- buttons
- Touch targets: 44x44px minimum for interactive elements

## 5. Responsive

- Desktop: Full map with side panels
- Tablet: Full map with bottom sheet
- Mobile: Single column, map takes 50% viewport height
