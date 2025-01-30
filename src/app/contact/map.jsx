'use client'
import { useEffect } from "react";
const Map = ()=>{
    useEffect(() => {
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDGRnDhzIz-pTnEBockMqN55NBTcRszrpA&callback=initMap`;
        script.async = true;
        document.body.appendChild(script);
      
        window.initMap = () => {
          const mapElement = document.getElementById("map");
          if (mapElement) {
            const map = new google.maps.Map(mapElement, {
              center: { lat: 38.590152, lng: 68.789922 },
              zoom: 18,
              mapTypeId: "satellite",
              mapTypeControl: false,
              streetViewControl: false,
              zoomControl: true,
              fullscreenControl: true,
            });
      
            const infoWindow = new google.maps.InfoWindow({
              pixelOffset: new google.maps.Size(0, -15),
              maxWidth: 300,
            });
      
            const directionsService = new google.maps.DirectionsService();
            const directionsRenderer = new google.maps.DirectionsRenderer();
            directionsRenderer.setMap(map);
          } else {
            console.error("Map element not found!");
          }
        };
      
        return () => {
          delete window.initMap;
          document.body.removeChild(script);
        };
      }, []);
    return (
 
        <div className="w-full lg:w-2/3">
        <div id="map" style={{ width: "100%", height: "450px", borderRadius: "8px", overflow: "hidden" }}></div>
      </div>
    )
}
export default Map;