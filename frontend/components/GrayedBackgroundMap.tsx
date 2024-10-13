'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

const LeafletMap = dynamic(() => import('./LeafletMap'), {
    ssr: false,
})

export default function GrayedBackgroundMap() {
    const [mapCenter, setMapCenter] = useState<[number, number]>([46.2276, 2.2137])
    const [mapZoom, setMapZoom] = useState(6)

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedCenter = localStorage.getItem('mapCenter')
            const savedZoom = localStorage.getItem('mapZoom')
            if (savedCenter) setMapCenter(JSON.parse(savedCenter))
            if (savedZoom) setMapZoom(parseInt(savedZoom, 10))
        }
    }, [])

    return (
        <div className="relative w-full h-full">
            <LeafletMap casas={[]} center={mapCenter} zoom={mapZoom} />
            <div className="absolute inset-0 bg-gray-500 bg-opacity-50 pointer-events-none" />
        </div>
    )
}
