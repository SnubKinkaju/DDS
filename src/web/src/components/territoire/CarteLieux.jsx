import { useEffect, useEffectEvent, useRef, useState } from "react";
import { Maximize, Minus, Plus } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import { couleurs } from "../../data/territoire.js";
import { GlypheLieu } from "./IconeLieu.jsx";
import "./carte.css";

const village = [45.905, 6.424];
const zoomMin = 11;
const zoomMax = 19;

function cadrer(map, groupe) {
  const limites = groupe.getBounds();
  if (limites.isValid())
    map.fitBounds(limites, { padding: [38, 38], maxZoom: 16, animate: false });
  else map.setView(village, 14);
}

function iconeGroupe(groupe) {
  const count = groupe.getChildCount();
  return L.divIcon({
    className: "carte-groupe",
    html: `<span aria-label="Agrandir ce groupe de ${count} emplacements">${count}</span>`,
    iconSize: [38, 38],
  });
}

export default function CarteLieux({
  points,
  vueVillage,
  selection,
  choisir,
  effacer,
  children,
}) {
  const container = useRef(null);
  const glyphes = useRef(null);
  const carte = useRef(null);
  const groupe = useRef(null);
  const tuiles = useRef(null);
  const marqueurs = useRef(new Map());
  const [zoom, setZoom] = useState(14);
  const [tuilesEnErreur, setTuilesEnErreur] = useState(false);

  const activer = useEffectEvent(choisir);

  useEffect(() => {
    const map = L.map(container.current, {
      zoomControl: false,
      minZoom: zoomMin,
      maxZoom: zoomMax,
      scrollWheelZoom: false,
      zoomAnimation: false,
    }).setView(village, 14);
    carte.current = map;
    const fond = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: zoomMax,
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    });
    fond.on("tileerror", () => setTuilesEnErreur(true));
    fond.on("load", () => {
      const tuiles = fond.getContainer()?.querySelectorAll("img");
      setTuilesEnErreur(
        Boolean(tuiles?.length) &&
          !Array.from(tuiles).some((img) => img.naturalWidth > 0),
      );
    });
    fond.addTo(map);
    tuiles.current = fond;
    map.attributionControl.setPrefix(false);
    L.control.scale({ imperial: false, position: "bottomleft" }).addTo(map);
    map.on("zoomend", () => setZoom(map.getZoom()));
    groupe.current = L.markerClusterGroup({
      maxClusterRadius: (niveau) => (niveau >= 14 ? 26 : 36),
      showCoverageOnHover: false,
      animate: false,
      iconCreateFunction: iconeGroupe,
    }).addTo(map);
    const observer = new ResizeObserver(() =>
      map.invalidateSize({ pan: false }),
    );
    observer.observe(container.current);
    return () => {
      observer.disconnect();
      map.remove();
    };
  }, []);

  useEffect(() => {
    const group = groupe.current;
    const markers = new Map();
    for (const point of points) {
      const { nom, categorie, famille } = point.properties;
      const type = categorie || famille;
      const [lon, lat] = point.geometry.coordinates;
      const marker = L.marker([lat, lon], {
        title: nom,
        icon: L.divIcon({
          className: "carte-repere",
          html: glyphes.current
            .querySelector(`[data-type="${type}"]`)
            .cloneNode(true),
          iconSize: [32, 32],
        }),
      });
      const label = document.createElement("span");
      label.textContent = nom;
      marker.bindTooltip(label, { direction: "top", offset: [0, -13] });
      marker.on("click", () => activer(point));
      markers.set(point.id, marker);
    }
    marqueurs.current = markers;
    group.addLayers(Array.from(markers.values()));
    if (vueVillage) carte.current.setView(village, 15, { animate: false });
    else cadrer(carte.current, group);
    return () => group.clearLayers();
  }, [points, vueVillage]);

  useEffect(() => {
    const marker = marqueurs.current.get(selection);
    if (!marker) return;
    const map = carte.current;
    let actif = true;
    const icon = marker.options.icon;
    marker.setIcon(
      L.divIcon({ ...icon.options, className: "carte-repere is-selected" }),
    );
    map.setView(marker.getLatLng(), Math.max(16, map.getZoom()), {
      animate: false,
    });
    groupe.current.zoomToShowLayer(marker, () => {
      if (actif) {
        marker.openTooltip();
      }
    });
    return () => {
      actif = false;
      marker.setIcon(icon);
      marker.closeTooltip();
    };
  }, [points, selection]);

  return (
    <div className="carte-cadre">
      <div ref={glyphes} hidden>
        {Object.entries(couleurs).map(([type, couleur]) => (
          <span
            key={type}
            data-type={type}
            className="carte-pastille"
            style={{ backgroundColor: couleur }}
          >
            <GlypheLieu categorie={type} size={17} />
          </span>
        ))}
      </div>
      <div
        ref={container}
        className="carte-fond"
        aria-label="Carte interactive de La Clusaz"
      />
      <div
        className="carte-commandes"
        aria-label="Commandes de la carte"
        role="group"
      >
        <button
          type="button"
          aria-label="Agrandir la carte"
          title="Zoom avant"
          disabled={zoom >= zoomMax}
          onClick={() => carte.current.zoomIn()}
        >
          <Plus />
        </button>
        <button
          type="button"
          aria-label="Réduire la carte"
          title="Zoom arrière"
          disabled={zoom <= zoomMin}
          onClick={() => carte.current.zoomOut()}
        >
          <Minus />
        </button>
        <button
          type="button"
          aria-label="Recadrer sur les résultats"
          title="Recadrer sur les résultats"
          onClick={() => {
            effacer();
            cadrer(carte.current, groupe.current);
          }}
        >
          <Maximize />
        </button>
      </div>
      {tuilesEnErreur && (
        <span className="carte-hors-ligne" role="status">
          Fond de carte indisponible{" "}
          <button
            type="button"
            className="font-semibold underline"
            onClick={() => tuiles.current.redraw()}
          >
            Réessayer
          </button>
        </span>
      )}
      {children}
    </div>
  );
}
