/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';
import { MapPin, Truck, Home } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';

// Fix for Leaflet default icon issues in some environments
const createMarkerIcon = (color: string, Icon: any) => {
  const iconMarkup = renderToStaticMarkup(
    <div className={`relative flex items-center justify-center`}>
      <div className={`w-10 h-10 rounded-full bg-white shadow-xl flex items-center justify-center border-2`} style={{ borderColor: color }}>
        <Icon className="w-6 h-6" style={{ color: color }} />
      </div>
      <div className="absolute -bottom-1 w-2 h-2 rotate-45 border-r-2 border-b-2 bg-white" style={{ borderColor: color }} />
    </div>
  );

  return L.divIcon({
    html: iconMarkup,
    className: 'custom-leaflet-icon',
    iconSize: [40, 44],
    iconAnchor: [20, 44],
    popupAnchor: [0, -40],
  });
};

const StoreIcon = (props: any) => <MapPin {...props} />;

const vendorIcon = createMarkerIcon('#F26A3D', StoreIcon);
const customerIcon = createMarkerIcon('#0F1E2E', Home);
const riderIcon = createMarkerIcon('#22C55E', Truck);

interface DeliveryMapProps {
  pickup?: { lat: number; lng: number };
  delivery?: { lat: number; lng: number };
  rider?: { lat: number; lng: number };
  zoom?: number;
}

function RecenterMap({ pickup, delivery, rider }: DeliveryMapProps) {
  const map = useMap();
  
  useEffect(() => {
    const points: L.LatLngExpression[] = [];
    if (pickup) points.push([pickup.lat, pickup.lng]);
    if (delivery) points.push([delivery.lat, delivery.lng]);
    if (rider) points.push([rider.lat, rider.lng]);
    
    if (points.length > 0) {
      if (points.length === 1) {
        map.setView(points[0], 15);
      } else {
        const bounds = L.latLngBounds(points);
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [pickup, delivery, rider, map]);
  
  return null;
}

export default function DeliveryMap({ pickup, delivery, rider, zoom = 13 }: DeliveryMapProps) {
  const center: L.LatLngExpression = pickup ? [pickup.lat, pickup.lng] : [31.5204, 74.3587];

  return (
    <div className="w-full h-full rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-inner bg-secondary relative">
      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {pickup && (
          <Marker position={[pickup.lat, pickup.lng]} icon={vendorIcon}>
            <Popup className="font-poppins font-bold">Store Pickup</Popup>
          </Marker>
        )}
        
        {delivery && (
          <Marker position={[delivery.lat, delivery.lng]} icon={customerIcon}>
            <Popup className="font-poppins font-bold">Delivery Point</Popup>
          </Marker>
        )}
        
        {rider && (
          <Marker position={[rider.lat, rider.lng]} icon={riderIcon}>
            <Popup className="font-poppins font-bold">Rider Position</Popup>
          </Marker>
        )}
        
        <RecenterMap pickup={pickup} delivery={delivery} rider={rider} />
      </MapContainer>
      
      <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-3 rounded-2xl border border-white/50 shadow-lg flex justify-around pointer-events-none">
        {pickup && (
          <div className="flex items-center space-x-1.5">
            <div className="w-2 h-2 rounded-full bg-accent" />
            <span className="text-[8px] font-bold uppercase tracking-widest text-primary">Store</span>
          </div>
        )}
        {delivery && (
          <div className="flex items-center space-x-1.5">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-[8px] font-bold uppercase tracking-widest text-primary">Dropoff</span>
          </div>
        )}
        {rider && (
          <div className="flex items-center space-x-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-[8px] font-bold uppercase tracking-widest text-primary">Rider</span>
          </div>
        )}
      </div>
    </div>
  );
}
