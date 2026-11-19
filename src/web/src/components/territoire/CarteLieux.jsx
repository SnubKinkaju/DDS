import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { couleurs } from "../../data/territoire.js";

export default function CarteLieux({ points, selection, choisir }) {
  const container = useRef(null);
  const carte = useRef(null);
  const action = useRef(choisir);
  action.current = choisir;
  useEffect(() => {
    const map = L.map(container.current, { scrollWheelZoom: false }).setView(
      [45.905, 6.424],
      14,
    );
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    carte.current = map;
    return () => {
      map.remove();
      carte.current = null;
    };
  }, []);
  useEffect(() => {
    const map = carte.current;
    const layer = L.layerGroup().addTo(map);
    const bounds = [];
    for (const point of points) {
      const { nom, categorie, famille } = point.properties;
      const [lon, lat] = point.geometry.coordinates;
      const active = selection === point.id;
      bounds.push([lat, lon]);
      const label = document.createElement("span");
      label.textContent = nom;
      const marker = L.circleMarker([lat, lon], {
        radius: active ? 11 : famille === "logement" ? 8 : 6,
        color: active ? "#172824" : "#fff",
        weight: active ? 3 : 2,
        fillColor: couleurs[categorie || famille],
        fillOpacity: 1,
      })
        .addTo(layer)
        .bindTooltip(label)
        .on("click", () => action.current(point));
      if (active) {
        marker.openTooltip();
        map.setView([lat, lon], 16);
      }
    }
    if (!selection && bounds.length)
      map.fitBounds(bounds, { padding: [25, 25], maxZoom: 15 });
    return () => layer.remove();
  }, [points, selection]);
  return (
    <div
      ref={container}
      className="relative z-0 h-[44vh] min-h-72 w-full rounded-md md:h-[62vh]"
      aria-label="Carte des logements et services, également disponibles dans la liste"
    />
  );
}
