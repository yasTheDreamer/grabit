import React, { useEffect, useContext, useState } from "react";
import L from "leaflet";
import "../../style/Map.css";
import "leaflet-routing-machine";
import { OpenStreetMapProvider } from "leaflet-geosearch";
import { locationContext } from "../../contexts/LocationContext";
import { userContext } from "../../contexts/userContext";

const Map = (props) => {
  const [Location, setLocation] = useContext(locationContext);
  const [User, setUser] = useContext(userContext);
  const [removeControl, setRemoveControl] = useState(null);
  let map;
  let firstResults = null,
    secondResults = null;

  const getResults = async (source, destination) => {
    const provider = new OpenStreetMapProvider();

    const firstResults = await provider.search({ query: source });
    const secondResults = await provider.search({ query: destination });

    const results = {
      firstResults: firstResults,
      secondResults: secondResults,
    };

    return results;
  };

  useEffect(() => {
    // create map
    map = L.map("map", {
      center: [49.47748, 8.4],
      zoom: 12,
    });

    L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    const tracker_form = document.querySelector(
      ".order__content__main--content--order--form"
    );

    switch (User.type) {
      case 2:
        map
          .locate({
            setView: true,
            watch: true,
            enableHighAccuracy: true,
          }) /* This will return map so you can do chaining */
          .on("locationfound", function (e) {
            let marker = L.marker([e.latitude, e.longitude]).bindPopup(
              "Your are here "
            );

            setLocation({
              ...Location,
              longitude: e.longitude,
              latitude: e.latitude,
            });

            map.addLayer(marker);
          })
          .on("locationerror", function (e) {
            console.log(e);
            alert("Location access denied.");
          });
        break;

      case 1:
        if (Location.latitude && Location.longitude) {
          let marker = L.marker([
            Location.latitude,
            Location.longitude,
          ]).bindPopup("the driver is here");

          map.addLayer(marker);

          map.flyTo([Location.latitude, Location.longitude]);
        }

        break;
    }
    const addTrack = (e) => {
      if (e && e.preventDefault) e.preventDefault();
      let source = null;
      let destination = null;

      if (tracker_form) {
        source = tracker_form.elements["source"].value;
        destination = tracker_form.elements["destination"].value;
      } else if (props.source && props.destination) {
        source = props.source;
        destination = props.destination;
      }

      getResults(source, destination).then((results) => {
        if (removeControl !== null) map.removeControl(removeControl);

        firstResults = results.firstResults[0];
        secondResults = results.secondResults[0];

        console.log(firstResults, secondResults);

        if (firstResults && secondResults) {
          setRemoveControl(
            L.Routing.control({
              waypoints: [
                L.latLng(firstResults.y, firstResults.x),
                L.latLng(secondResults.y, secondResults.x),
              ],
              addWaypoints: true,
              routeWhileDragging: false,
            }).addTo(map)
          );
        }
      });
      console.log("added");
    };

    if (tracker_form) tracker_form.addEventListener("submit", addTrack);
    if (props.source && props.destination) addTrack();
  }, []);

  useEffect(() => {
    if (removeControl && Location && removeControl.getWaypoints().length == 3) {
      removeControl.spliceWaypoints(
        0,
        1,
        L.latLng(Location.latitude, Location.longitude)
      );
    } else {
      if (removeControl && Location)
        removeControl.setWaypoints([
          L.latLng(Location.latitude, Location.longitude),
          ...removeControl.getWaypoints(),
        ]);
    }
  }, [Location, removeControl]);

  return <div id="map"></div>;
};

export default Map;
