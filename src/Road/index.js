import Leaflet from "leaflet";
import { createControlComponent } from "@react-leaflet/core";
import "leaflet-routing-machine";

const createRoutineMachineLayer = ({ points, setRoad }) => {
  const instance = Leaflet.Routing.control({
    waypoints: [points[0], points[1]],
    lineOptions: {
      styles: [{ color: "#4b4bfd", opacity: 1, weight: 6 }],
      addWaypoints: false,
    },
    fitSelectedRoutes: false,
    createMarker: function () {
      return null;
    },
  }).on("routesfound", function (e) {
    let routes = e.routes;
    setRoad(routes[0]);
  });
  return instance;
};

const Routing = createControlComponent(createRoutineMachineLayer);

export default Routing;
