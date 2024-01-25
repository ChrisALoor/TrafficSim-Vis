import './App.css'

/* global window */
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Map } from 'react-map-gl';
import { Dropdown, Tooltip} from 'flowbite-react';
import maplibregl from 'maplibre-gl';
// import { AmbientLight, PointLight, LightingEffect } from '@deck.gl/core';
import DeckGL from '@deck.gl/react';
import { TripsLayer } from '@deck.gl/geo-layers';
import { GeoJsonLayer } from '@deck.gl/layers';


import trips from "./data/cuenca3k_events.json"
import redes from "./data/cuenca3k_network.json"


// Source data
const DATA_URL = {
  TRIPS: trips,
  NETWORK: redes,
};


const DEFAULT_THEME = {
  trailColor0: [253, 128, 93],
  trailColor1: [23, 184, 190],
};

const INITIAL_VIEW_STATE = {
  longitude: -79.0,
  latitude: -2.9,
  zoom: 2,
  pitch: 45,
  bearing: 0,
};


//const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json'; //mapa negro sin labels
//const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'; //mapa blanco con labels

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json'; //mapa a color con labels 

export default function App({
  trips = DATA_URL.TRIPS,
  net = DATA_URL.NETWORK,
  initialViewState = INITIAL_VIEW_STATE,
  mapStyle = MAP_STYLE,
  theme = DEFAULT_THEME,
  loopLength = 86400,
  initialAnimationSpeed = 1,
}) {
  const [tooltip, setTooltip] = useState(null);
  const [isPlaying, setPlaying] = useState(true);
  const [time, setTime] = useState(0);
  const [animationSpeed, setAnimationSpeed] = useState(initialAnimationSpeed);
  const [networkLayerVisible, setNetworkLayerVisible] = useState(true);
  const [tripsLayerVisible, setTripsLayerVisible] = useState(true);

  const[trailLength, setTrailLength]=useState(50)


  const handleTrailLengthChange = (event) => {
    const newTrailLength = parseInt(event.target.value, 10);
    setTrailLength(newTrailLength);
  };
  
  //custom layers
  const [customLayer1, setCustomLayer1] = useState(null);
  const [customLayerVisible1, setCustomLayerVisible1] = useState(false);
  const [customLayer2, setCustomLayer2] = useState(null);
  const [customLayerVisible2, setCustomLayerVisible2] = useState(false);
  const [customLayer3, setCustomLayer3] = useState(null);
  const [customLayerVisible3, setCustomLayerVisible3] = useState(false);

  const [hoverInfo, setHoverInfo] = useState({});

  const animationRef = useRef();

  const [mensaje, setMensaje] = useState('');
  const clearMensaje = () => {
    setMensaje('');
  };

  const togglePlayPause = () => {
    setPlaying((prevIsPlaying) => !prevIsPlaying);
  };

  const increaseSpeed = () => {
    setAnimationSpeed((prevSpeed) => prevSpeed + 1);
  };

  const decreaseSpeed = () => {
    setAnimationSpeed((prevSpeed) => Math.max(prevSpeed - 1, 1));
    setMensaje('Decrease Speed')
  };

  const handleTimeChange = (event) => {
    const newTime = parseFloat(event.target.value);
    setTime(newTime);
  };




  const handleFileUpload = (event, setCustomLayer, setCustomLayerVisible) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const geoJsonData = JSON.parse(e.target.result);
        setCustomLayer(geoJsonData);
        setCustomLayerVisible(true);
      };
      reader.readAsText(file);
    }
  };

  const handleCheckboxChange = (layer) => {
    switch (layer) {
      case 'network':
        setNetworkLayerVisible((prev) => !prev);
        break;
      case 'trips':
        setTripsLayerVisible((prev) => !prev);
        break;
      case 'custom1':
        setCustomLayerVisible1((prev) => !prev);
        break;
      case 'custom2':
        setCustomLayerVisible2((prev) => !prev);
        break;
      case 'custom3':
        setCustomLayerVisible3((prev) => !prev);
        break;
    
      default:
        break;
    }
  };

  const toggleLayerVisibility = (layer) => {
    switch (layer) {
      case 'network':
        setNetworkLayerVisible((prev) => !prev);
        break;
      case 'trips':
        setTripsLayerVisible((prev) => !prev);
        break;
      case 'custom1':
        setCustomLayerVisible1((prev) => !prev);
        break;
      case 'custom2':
        setCustomLayerVisible2((prev) => !prev);
        break;
      case 'custom3':
        setCustomLayerVisible3((prev) => !prev);
        break;
    
      default:
        break;
    }
  };

  const animate = () => {
    setTime((prevTime) => (prevTime + animationSpeed) % loopLength);
    animationRef.current = window.requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (isPlaying) {
      animationRef.current = window.requestAnimationFrame(animate);
    } else {
      window.cancelAnimationFrame(animationRef.current);
    }

    return () => {
      window.cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, animationSpeed]);



  function renderTooltip() {
    if (!hoverInfo || !hoverInfo.object) {
      return null;
    }
  
    const { object, x, y, layer } = hoverInfo;
  
    let tooltipContent;
  
    if (layer && layer.id === 'MapNetwork' && object) {
      // GeoJsonLayer tooltip content
      tooltipContent = (
        <div>
          <b>id: {object.properties.id}</b><br />
          <b>from: {object.properties.from}</b><br />
          <b>to: {object.properties.to}</b><br />
          <b>length: {object.properties.length}</b><br />
          <b>freespeed: {object.properties.freespeed}</b><br />
          <b>capacity: {object.properties.capacity}</b><br />
          <b>oneway: {object.properties.from}</b><br />
          <b>modes: {object.properties.from}</b>
          {/* Agrega más información según sea necesario */}
        </div>
      );
    } else if (layer && layer.id === 'trips' && object) {
      // TripsLayer tooltip content
      tooltipContent = (
        <div>
          <b>Vehicle id: {object.vehicle}</b>
          
        </div>
      );
    } else {
      return null; // No se reconoce la capa o no hay objeto válido
    }
  
    return (
      <div className="tooltip" style={{ left: x, top: y }}>
        {tooltipContent}
      </div>
    );
  }
  


  



  const layers = [

    networkLayerVisible &&
    new GeoJsonLayer({
      id: 'MapNetwork',
      data: net,
      filled: true,
      pointRadiusMinPixels: 0,
      pointRadiusScale: 1,
      getPointRadius: (f) => 11 - f.properties.scalerank,
      getFillColor: [255, 0, 255, 255],  // centro
      getLineColor:[200, 200, 200, 255],  //lineas
      pickable: true,
      onHover: (info) => setHoverInfo(info),
      autoHighlight: true,
      //onClick: info =>
      // eslint-disable-next-line
      //info.object && alert(`${info.object.properties.id} (${info.object.properties.abbrev})`)

    }),

    tripsLayerVisible &&
    new TripsLayer({
      id: 'trips',
      data: trips,
      getPath: (d) => d.path,
      getTimestamps: (d) => d.timestamps,
      getColor: (d) => theme.trailColor1,
      opacity: 1,
      widthMinPixels: 5,
      rounded: true,
      pickable: true,
      autoHighlight: true,
      trailLength:trailLength ,
      currentTime: time,
      shadowEnabled: false,
      onHover: (info) => setHoverInfo(info),
    }),

    customLayerVisible1 &&
    customLayer1 &&
    new GeoJsonLayer({
      id: 'CustomLayer1',
      data: customLayer1,
      filled: true,
      pointRadiusMinPixels: 5,
      pointRadiusScale: 3,
      getPointRadius: (f) => 11 - f.properties.scalerank,
      getFillColor: [0, 150, 255, 255],
      // getLineColor: [255, 0, 0, 1],
      // highlightColor: [255, 0, 255, 1], // Color de resaltado
      pickable: true,
      autoHighlight: true,

    }),

    customLayerVisible2 &&
    customLayer2 &&
    new GeoJsonLayer({
      id: 'CustomLayer2',
      data: customLayer2,
      filled: true,
      pointRadiusMinPixels: 5,
      pointRadiusScale: 3,
      getPointRadius: (f) => 11 - f.properties.scalerank,
      getFillColor: [0, 255, 0, 255],
      // getLineColor: [255, 0, 0, 1],
      // highlightColor: [255, 0, 255, 1], // Color de resaltado
      pickable: true,
      autoHighlight: true,

    }),


    customLayerVisible3 &&
    customLayer3 &&
    new GeoJsonLayer({
      id: 'CustomLayer3',
      data: customLayer3,
      filled: true,
      pointRadiusMinPixels: 5,
      pointRadiusScale: 3,
      getPointRadius: (f) => 11 - f.properties.scalerank,
      getFillColor: [255, 0, 0, 255],
      // getLineColor: [255, 0, 0, 1],
      // highlightColor: [255, 0, 255, 1], // Color de resaltado
      pickable: true,
      autoHighlight: true,

    }),

    
  ];

  return (

    <div className=''>
      <div className='app-name'>
      <div className="flex items-center right" >
        <h1>
        <svg width="60px" height="60px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14.1427 15.9621C14.2701 16.2169 14.1593 16.5264 13.8991 16.6424L4.49746 20.835C3.00163 21.5021 1.45007 20.0209 2.19099 18.6331L5.34302 12.7294C5.58818 12.2702 5.58818 11.7298 5.34302 11.2706L2.19099 5.36689C1.45006 3.97914 3.00163 2.49789 4.49746 3.16496L8.02178 4.73662C8.44465 4.9252 8.78899 5.25466 8.99606 5.6688L14.1427 15.9621Z" fill="#1C274C"/>
          <path opacity="0.5" d="M15.5332 15.3904C15.6529 15.6297 15.9397 15.7324 16.1841 15.6235L21.0066 13.4728C22.3304 12.8825 22.3304 11.1181 21.0066 10.5278L12.1089 6.55983C11.6802 6.36864 11.2481 6.82023 11.458 7.24008L15.5332 15.3904Z" fill="#1C274C"/>
        </svg>
          TrafficSim-Vis
        </h1>
      </div>
      </div>



      <div className='relative'>
        <div className=' bg-gray-700 backdrop-blur-sm w-full absolute z-10 top-0' >
          <div className="w-full">
            <div className="flex items-center justify-center mx-auto mb-1">

            <div className="flex items-center justify-center">
              <div className="flex items-right space-x-2">
                <span className="text-md text-center font-medium text-gray-100 dark:text-gray-100">
                  trailLength {trailLength}:
                </span>
                <input
                  type="range"
                  min={1}
                  max={2000}
                  step={1}
                  value={trailLength}
                  onChange={handleTrailLengthChange}
                  className='w-1/4 my-auto'
                  style={{
                    background: `linear-gradient(to right, red ${((trailLength / 2000) * 100)}%, rgba(196, 196, 196, 0.2) ${((trailLength / 2000) * 100)}%)`,
                    WebkitAppearance: 'none',
                    height: '2px',
                    borderRadius: '1px',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                />
              </div>
            </div>
            <span className="ml-2 text-gray-500 dark:text-gray-300">{animationSpeed}</span>
              <span onClick={decreaseSpeed}  
                className="p-2.5 group rounded-full hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-600 dark:hover:bg-gray-600 relative">

                <svg onMouseEnter={() => setMensaje('Decrease Speed')} onMouseLeave={clearMensaje} className="rtl:rotate-180 w-4 h-4 text-gray-500 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="white" class="w-6 h-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 16.811c0 .864-.933 1.406-1.683.977l-7.108-4.061a1.125 1.125 0 0 1 0-1.954l7.108-4.061A1.125 1.125 0 0 1 21 8.689v8.122ZM11.25 16.811c0 .864-.933 1.406-1.683.977l-7.108-4.061a1.125 1.125 0 0 1 0-1.954l7.108-4.061a1.125 1.125 0 0 1 1.683.977v8.122Z" />
                </svg>

              </span>
              {mensaje && <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 mt-2 text-gray-500 dark:text-gray-300">{mensaje}</span>}
              <span onClick={togglePlayPause} className="inline-flex items-center justify-center p-2.5 mx-2 font-medium bg-azul rounded-full hover:bg-blue-700 group focus:ring-4 focus:ring-blue-300 focus:outline-none dark:focus:ring-blue-800">
                {
                  isPlaying ?
                    <svg onMouseEnter={() => setMensaje('Pause')} onMouseLeave={clearMensaje} className="w-3 h-3 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" stroke="white" viewBox="0 0 10 16">
                      <path fill-rule="evenodd" d="M0 .8C0 .358.32 0 .714 0h1.429c.394 0 .714.358.714.8v14.4c0 .442-.32.8-.714.8H.714a.678.678 0 0 1-.505-.234A.851.851 0 0 1 0 15.2V.8Zm7.143 0c0-.442.32-.8.714-.8h1.429c.19 0 .37.084.505.234.134.15.209.354.209.566v14.4c0 .442-.32.8-.714.8H7.857c-.394 0-.714-.358-.714-.8V.8Z" clip-rule="evenodd" />
                    </svg>
                    :
                    <svg onMouseEnter={() => setMensaje('Play')} onMouseLeave={clearMensaje} className="w-3 h-3 text-white" stroke="white" stroke-width="3"
                      version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 17.804 17.804" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g id="c98_play"> <path d="M2.067,0.043C2.21-0.028,2.372-0.008,2.493,0.085l13.312,8.503c0.094,0.078,0.154,0.191,0.154,0.313 c0,0.12-0.061,0.237-0.154,0.314L2.492,17.717c-0.07,0.057-0.162,0.087-0.25,0.087l-0.176-0.04 c-0.136-0.065-0.222-0.207-0.222-0.361V0.402C1.844,0.25,1.93,0.107,2.067,0.043z"></path> </g> <g id="Capa_1_78_"> </g> </g> </g></svg>
                }
              </span>
              <span
                onClick={increaseSpeed}
                className="p-2.5 group rounded-full hover:bg-gray-100 me-1 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-600 dark:hover:bg-gray-600 relative">

                <svg onMouseEnter={() => setMensaje('Increase Speed')} onMouseLeave={clearMensaje} className="rtl:rotate-180 w-4 h-4 text-gray-500 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="white" class="w-6 h-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061A1.125 1.125 0 0 1 3 16.811V8.69ZM12.75 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061a1.125 1.125 0 0 1-1.683-.977V8.69Z" />
                </svg>

              </span>
              <div className='bg-gray-900 dark:bg-gray-700'>
                <Dropdown dismissOnClick={false}>
                  <Dropdown.Item onClick={() => toggleLayerVisibility('network')}>
                    <span className='text-white'>
                      {networkLayerVisible ? 'Hide network' : 'Show network'}
                    </span>
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => toggleLayerVisibility('trips')}>
                    <span className='text-white'>
                      {tripsLayerVisible ? 'Hide events' : 'Show events'}
                    </span>
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  {/*layer 1*/}
                  <Dropdown.Item onClick={() => toggleLayerVisibility('custom1')}>
                    <span className='text-white'>
                    <input type="checkbox" checked={customLayerVisible1} onChange={() => handleCheckboxChange('custom1', setCustomLayerVisible1)} />
                      {customLayerVisible1 ? 'Hide custom layer 1' : 'Show custom layer 1'}
                    </span>
                  </Dropdown.Item>
                  <Dropdown.Item>
                    <label for="nuevoArchivo1" className='text-white'>
                      Add layer 1
                    </label>
                  </Dropdown.Item>

                  {/*layer 2*/}
                  <Dropdown.Item onClick={() => toggleLayerVisibility('custom2')}>
                    <span className='text-white'>
                    <input type="checkbox" checked={customLayerVisible2} onChange={() => handleCheckboxChange('custom2', setCustomLayerVisible2)} />
                      {customLayerVisible2 ? 'Hide custom layer 2' : 'Show custom layer 2'}
                    </span>
                  </Dropdown.Item>
                  <Dropdown.Item>
                    <label for="nuevoArchivo2" className='text-white'>
                     Add layer 2
                    </label>
                  </Dropdown.Item>

                  {/*layer 3*/}
                  <Dropdown.Item onClick={() => toggleLayerVisibility('custom3')}>
                    <label className= 'text-white' >
                      <input type="checkbox" checked={customLayerVisible3} onChange={() => handleCheckboxChange('custom3', setCustomLayerVisible3)} />
                      {customLayerVisible3 ? 'Hide custom layer 3' : 'Show custom layer 3'}
                    </label>
                  </Dropdown.Item>
                  <Dropdown.Item>
                    <label for="nuevoArchivo3" className='text-white'>
                      Add layer 3
                    </label>
                  </Dropdown.Item>

                </Dropdown>
              </div>
            </div>
            {/* layer 1*/}
            <input type="file" id='nuevoArchivo1' className=' hidden' accept=".geojson" onChange={(e) => handleFileUpload(e, setCustomLayer1, setCustomLayerVisible1)} />
            
            {/* layer 2 */}
            <input type="file" id='nuevoArchivo2' className=' hidden' accept=".geojson" onChange={(e) => handleFileUpload(e, setCustomLayer2, setCustomLayerVisible2)} />

            {/* layer 3 */}
            <input type="file" id='nuevoArchivo3' className=' hidden' accept=".geojson" onChange={(e) => handleFileUpload(e, setCustomLayer3, setCustomLayerVisible3)} />


            <div className="flex items-center justify-between">
              <div className='flex' >
                <span className="text-lg text-center font-medium text-gray-100 dark:text-gray-100 w-32">{Math.floor((time % 86400) / 3600)}h {Math.floor((time % 3600) / 60)}m {time % 60}s</span>
              </div>
              <div className="w-full">
                <input
                  type="range"
                  min={0}
                  max={loopLength}
                  step={1}
                  value={time}
                  onChange={handleTimeChange}
                  className=' w-full my-auto'
                  style={{
                    background: `linear-gradient(to right, red ${((time / loopLength) * 100)}%, rgba(196, 196, 196, 0.2) ${((time / loopLength) * 100)}%)`,
                    WebkitAppearance: 'none',
                    height: '5px',
                    borderRadius: '5px',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                  
                />
              </div>
              <div className='flex' >
                <span className="text-lg text-center font-medium text-gray-100 dark:text-gray-100 w-32">{Math.floor(((loopLength-time) % 86400) / 3600)}h {Math.floor(((loopLength-time) % 3600) / 60)}m {(loopLength-time) % 60}s</span>
                
              </div>
            </div>
          </div>
        </div>
      </div>

      <DeckGL layers={layers} effects={theme.effects} initialViewState={initialViewState} controller={true}>
        <Map reuseMaps mapLib={maplibregl} mapStyle={mapStyle} preventStyleDiffing={true} />
        {renderTooltip()}

      </DeckGL>

       
    </div>
  );
}

export function renderToDOM(container) {
  createRoot(container).render(<App />);
  
}