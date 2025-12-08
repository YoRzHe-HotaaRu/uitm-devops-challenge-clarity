'use client'

import React, { useRef, useEffect, useCallback, memo } from 'react'
import * as maptilersdk from '@maptiler/sdk'

interface MapViewerProps {
  center?: {
    lng: number
    lat: number
  }
  zoom?: number
  style?: string
  className?: string
  height?: string
  width?: string
  markers?: Array<{
    lng: number
    lat: number
    popup?: string
    color?: string
  }>
  onMapLoad?: (map: maptilersdk.Map) => void
  onMapClick?: (coordinates: { lng: number; lat: number }) => void
  interactive?: boolean
}

const MapViewer = memo(function MapViewer({
                                            center = { lng: 139.753, lat: 35.6844 }, // Default to Tokyo
                                            zoom = 14,
                                            style = 'streets',
                                            className = '',
                                            height = '100%',
                                            width = '100%',
                                            markers = [],
                                            onMapLoad,
                                            onMapClick,
                                            interactive = true,
                                          }: MapViewerProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maptilersdk.Map | null>(null)
  const markersRef = useRef<maptilersdk.Marker[]>([])
  const isMapLoaded = useRef(false)
  const isInitializing = useRef(false)

  // Initialize API key once
  useEffect(() => {
    if (!maptilersdk.config.apiKey) {
      maptilersdk.config.apiKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY || ''
    }
  }, [])

  // Clear existing markers
  const clearMarkers = useCallback(() => {
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []
  }, [])

  // Initialize map (only once)
  useEffect(() => {
    if (!mapContainer.current || map.current || isInitializing.current) return

    isInitializing.current = true

    try {
      console.log('Initializing map with center:', [center.lng, center.lat])
      console.log('API Key available:', !!maptilersdk.config.apiKey)

      // Use the style directly - MapTiler SDK will handle the URL with the API key
      map.current = new maptilersdk.Map({
        container: mapContainer.current,
        style: style,
        center: [center.lng, center.lat],
        zoom: zoom,
        interactive: interactive,
      })

      // Handle map load event
      map.current.on('load', () => {
        console.log('Map loaded, setting isMapLoaded to true')
        isMapLoaded.current = true
        isInitializing.current = false

        if (map.current && onMapLoad) {
          onMapLoad(map.current)
        }

        // Markers will be added by the markers useEffect when markers prop changes
      })

      // Handle map click event
      if (onMapClick && map.current) {
        map.current.on('click', (e) => {
          onMapClick({
            lng: e.lngLat.lng,
            lat: e.lngLat.lat,
          })
        })
      }
    } catch (error) {
      console.error('Error initializing map:', error)
      isInitializing.current = false
    }

    return () => {
      console.log('Cleaning up map')
      clearMarkers()
      if (map.current) {
        console.log('Removing map instance')
        map.current.remove()
        map.current = null
        isMapLoaded.current = false
        isInitializing.current = false
      }
    }
  }, []) // Empty dependency array - initialize only once

  // Update map center and zoom when props change (only on initial load or when explicitly needed)
  useEffect(() => {
    if (map.current && isMapLoaded.current) {
      console.log('Map is interactive, center update skipped to allow user interaction')
      // Intentionally empty - don't auto-center to allow user to drag freely
      // If you need to force update center, use a separate prop like 'shouldUpdateCenter'
    }
  }, [center.lng, center.lat, zoom])

  // Update markers when markers prop changes
  useEffect(() => {
    if (map.current && isMapLoaded.current) {
      console.log('Markers changed, updating map markers')
      // Use the markers from props directly in a stable callback
      const currentMarkers = markers
      const mapInstance = map.current

      // Clear existing markers
      clearMarkers()

      console.log('Adding markers to map:', currentMarkers.length)

      currentMarkers.forEach((markerData, index) => {
        console.log(`Creating marker ${index}:`, markerData)

        const marker = new maptilersdk.Marker({
          color: markerData.color || '#3B82F6',
        })
          .setLngLat([markerData.lng, markerData.lat])
          .addTo(mapInstance)

        // Add popup if provided
        if (markerData.popup) {
          const popup = new maptilersdk.Popup({
            offset: 25,
            closeButton: true,
            closeOnClick: true,
            maxWidth: '320px',
            anchor: 'bottom'
          }).setHTML(markerData.popup)

          marker.setPopup(popup)
        }

        markersRef.current.push(marker)
      })

      console.log('Total markers added:', markersRef.current.length)
    } else if (!isMapLoaded.current) {
      console.log('Map not ready for markers yet:', {
        mapExists: !!map.current,
        mapLoaded: isMapLoaded.current
      })
    }
  }, [markers]) // Only depend on markers, not on callbacks

  // Update map style when style prop changes
  useEffect(() => {
    if (map.current) {
      map.current.setStyle(style)
    }
  }, [style])

  return (
    <div
      className={`map-wrap ${className} rounded-3xl overflow-hidden`}
      style={{ height, width }}
    >
      <div
        ref={mapContainer}
        className="map w-full h-full rounded-3xl overflow-hidden"
        style={{
          height: '100%',
          width: '100%',
          boxShadow: 'none',
        }}
      />
    </div>
  )
})

export default MapViewer
