import { useEffect, useRef, useState } from "react";
import Leaflet from "leaflet";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./Map.css";
import "leaflet-routing-machine";
import Routing from "../Road";

import pin from "../assets/icons/pin.svg";
import car from "../assets/icons/car.svg";

let markerIcon = Leaflet.icon({
  iconUrl: pin,
  iconRetinaUrl: pin,
  iconAnchor: [7, 35],
  popupAnchor: null,
  iconSize: [23, 30],
});
let carIcon = Leaflet.icon({
  iconUrl: car,
  iconRetinaUrl: car,
  iconAnchor: [12, 37],
  popupAnchor: null,
  iconSize: [30, 30],
});
function Map() {
  const [markers, setMarkers] = useState([]);
  const [road, setRoad] = useState(null);
  const [times, setTimes] = useState([]);
  const [type, setType] = useState("");
  const [counter, setCounter] = useState(0);
  function addMarker(latlng) {
    if (markers.length < 2) {
      let newMarkers = [...markers];
      newMarkers.push(latlng);
      setMarkers(newMarkers);
    }
  }
  const LocationFinderDummy = () => {
    useMapEvents({
      click(e) {
        addMarker(e.latlng);
      },
    });
    return null;
  };
  const markerRef = useRef(null);
  useEffect(() => {
    if (road && markerRef.current && type === "autorun") {
      let newTimes = [...times];
      road.coordinates.forEach(function (coord, index) {
        newTimes.push(
          setTimeout(function () {
            markerRef.current.setLatLng([coord.lat, coord.lng]);
          }, 10 * index)
        );
      });
      setTimes(newTimes);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [road, markerRef, type]);
  function reset() {
    removeTimes();
    setMarkers([]);
  }
  function removeTimes() {
    for (let t = 0; t < times.length; t++) {
      clearTimeout(times[t]);
    }
    setTimes([]);
  }
  function manualChangeRoad(index) {
    if (road && markerRef.current) {
      let newTimes = [...times];
          newTimes.push(
            setTimeout(function () {
              markerRef.current.setLatLng([road.coordinates[index].lat, road.coordinates[index].lng]);
              setCounter(counter + 1);
            }, counter)
          );
      setTimes(newTimes);
    }
  }

  return (
    <div className="map__container">
      {markers.length < 2 && (
        <h1 className="map__title">
          {markers.length === 0
            ? "Wybierz punkt startowy"
            : "Wybierz punkt końcowy"}
        </h1>
      )}
      <MapContainer
        center={[52.065162, 19.252522]}
        zoom={6}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationFinderDummy />

        {markers.map((position, key) => {
          return (
            <Marker
              key={`marker-${key}`}
              icon={markerIcon}
              position={position}
            ></Marker>
          );
        })}
        {markers.length === 2 && road && (
          <Marker ref={markerRef} icon={carIcon} position={markers[0]}></Marker>
        )}
        {markers.length === 2 && (
          <Routing points={[markers[0], markers[1]]} setRoad={setRoad} />
        )}
      </MapContainer>
      {markers.length > 0 && (
        <button onClick={() => reset()} className="map__reset">
          Wyczyść
        </button>
      )}
      <div className="map__bottom">
        <h2 className="map__text">Wybierz tryb poruszania</h2>
        <label className="map__label" htmlFor="autorun">
          Automatycznie
        </label>
        <input
          type="radio"
          className="map__radio"
          onChange={(e) => setType(e.currentTarget.value)}
          name="type"
          value="autorun"
          id="autorun"
        />
        <input
          type="radio"
          className="map__radio"
          onChange={(e) => {
            removeTimes();
            markerRef.current.setLatLng([
              road.coordinates[0].lat,
              road.coordinates[0].lng,
            ]);
            setType(e.currentTarget.value);
          }}
          name="type"
          value="scroll"
          id="scroll"
        />
        <label className="map__label" htmlFor="scroll">
          Manualnie
        </label>
        {type === "scroll" && (
          <input
            className="map__range"
            onInput={(e) => { manualChangeRoad(e.currentTarget.value)}}
            onMouseDown={(e) => {setCounter(0)}}
            type="range"
            defaultValue="0"
            id="range"
            name="range"
            min="0"
            max={road.coordinates ? road.coordinates.length - 1 : 0}
            step="1"
          />
        )}
      </div>
    </div>
  );
}
export default Map;
