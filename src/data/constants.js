// constants.js
import { AmbientLight, PointLight, LightingEffect } from '@deck.gl/core';
import redes from "./parsing_network.json"
import trips from "./salidatercercolab.json"

export const DATA_URL = {
  TRIPS: trips,
  NETWORK: redes,
};

export const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 1.0,
});

export const pointLight = new PointLight({
  color: [255, 255, 255],
  intensity: 2.0,
  position: [-74.05, 40.7, 8000],
});

export const lightingEffect = new LightingEffect({ ambientLight, pointLight });

export const material = {
  ambient: 0.1,
  diffuse: 0.6,
  shininess: 32,
  specularColor: [60, 64, 70],
};

export const DEFAULT_THEME = {
  trailColor0: [253, 128, 93],
  trailColor1: [23, 184, 190],
  material,
  effects: [lightingEffect],
};

export const INITIAL_VIEW_STATE = {
  longitude: -79.0,
  latitude: -2.9,
  zoom: 13,
  pitch: 45,
  bearing: 0,
};

export const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json';
