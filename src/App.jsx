import './App.css'

/* imports */
import { Map } from 'react-map-gl';
import DeckGL from '@deck.gl/react';
import maplibregl from 'maplibre-gl';
import { createRoot } from 'react-dom/client';
import { GeoJsonLayer } from '@deck.gl/layers';
import { TripsLayer } from '@deck.gl/geo-layers';
import { Button, Modal, Sidebar } from 'flowbite-react';
import { TbAdjustmentsHorizontal } from "react-icons/tb";
import React, { useState, useEffect, useRef } from 'react';
import { BiNetworkChart} from "react-icons/bi"
import { FaInfoCircle, FaCarSide, FaLayerGroup ,FaPlus  } from "react-icons/fa";


const DEFAULT_THEME = {
  trailColor0: [255, 115, 0],//naranja
  trailColor1: [23, 184, 190],//turquesa
  trailColor2: [255, 0, 0],//rojo
};

//const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json'; //mapa negro sin labels
//const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'; //mapa blanco con labels

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json'; //mapa a color con labels 

export default function App({
  mapStyle = MAP_STYLE,
  theme = DEFAULT_THEME,
  loopLength = 86400,
  initialAnimationSpeed = 1,
}) {
  
  const [isPlaying, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [animationSpeed, setAnimationSpeed] = useState(initialAnimationSpeed);


  const [fileNameNetwork, setFileNameNetwork] = useState('');
  const [fileNameTrips, setFileNameTrips] = useState('');
  const [fileNameCustom1, setfileNameCustom1] = useState('');
  const [fileNameCustom2, setfileNameCustom2] = useState('');
  const [fileNameCustom3, setfileNameCustom3] = useState('');


  const [openModal, setOpenModal] = useState(true);

  const[trailLength, setTrailLength]=useState(50)
  const handleTrailLengthChange = (event) => {
    const newTrailLength = parseInt(event.target.value, 10);
    setTrailLength(newTrailLength);
  };

  const[pointRadiusScale, setpointRadiusScale]=useState(1)
  const handlepointRadiusScaleChange = (event) => {
    const newpointRadiusScale = parseInt(event.target.value, 10);
    setpointRadiusScale(newpointRadiusScale);
  };

  const[widthMinPixels, setwidthMinPixels]=useState(5)
  const handlewidthMinPixelsChange = (event) => {
    const newwidthMinPixels= parseInt(event.target.value, 10);
    setwidthMinPixels(newwidthMinPixels);
  };

  const[getLineWidth, setgetLineWidth]=useState(1)
  const handlegetLineWidthChange = (event) => {
    const newgetLineWidth= parseInt(event.target.value, 10);
    setgetLineWidth(newgetLineWidth);
  };

  const[opacity, setopacity]=useState(0.4)
  const handleOpacityChange = (event) => {
    const newopacity= parseFloat(event.target.value);
    setopacity(newopacity);
  };

  


  const [isCollapsed, setIsCollapsed] = useState(true);

  const handleToggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };
 

  // trips and geojson layer
  const [customLayer5, setCustomLayer5] = useState(null);
  const [networkLayerVisible, setNetworkLayerVisible] = useState(false);
  const [customLayer4, setCustomLayer4] = useState(null);
  const [tripsLayerVisible, setTripsLayerVisible] = useState(false);
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



  const handleFileUpload = (event, setCustomLayer, setCustomLayerVisible, setFileName, layerType) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = JSON.parse(e.target.result);
        switch (layerType) {
          case 'network':
            setCustomLayer(data);
            setCustomLayerVisible(true);
            setFileNameNetwork(file.name);
            break;
          case 'trips':
            setCustomLayer(data);
            setCustomLayerVisible(true);
            setFileNameTrips(file.name);
            break;

          case 'layer1':
            setCustomLayer(data);
            setCustomLayerVisible(true);
            setfileNameCustom1(file.name);
            break;
          case 'layer2':
            setCustomLayer(data);
            setCustomLayerVisible(true);
            setfileNameCustom2(file.name);
            break;
          case 'layer3':
            setCustomLayer(data);
            setCustomLayerVisible(true);
            setfileNameCustom3(file.name);
            break;          
          
          // Añade casos para otros tipos de capas aquí
          default:
            break;
        }
        
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
      case 'custom-1':
        setCustomLayerVisible1((prev) => !prev);
        break;
      case 'custom-2':
        setCustomLayerVisible2((prev) => !prev);
        break;
      case 'custom-3':
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
      // Verificar si el objeto es un punto (nodo) o una línea (enlace)
      if (object.geometry.type === 'Point') {
        // GeoJsonLayer tooltip content para nodos
        tooltipContent = (
          <div>
            <b>NODE NETWORK</b><br />
            <b>node id: {object.properties.id}</b><br />
            <b>position: {object.geometry.coordinates[0]}, {object.geometry.coordinates[1]}</b><br />
          </div>
        );
      } else if (object.geometry.type === 'LineString') {
        // GeoJsonLayer tooltip content para enlaces
        tooltipContent = (
          <div>
            <b>LINK NETWORK</b><br />
            <b>link id: {object.properties.id}</b><br />
            <b>from: {object.properties.from}</b><br />
            <b>to: {object.properties.to}</b><br />
            <b>length: {object.properties.length}</b><br />
            <b>freespeed: {object.properties.freespeed}</b><br />
            <b>capacity: {object.properties.capacity}</b><br />
            <b>oneway: {object.properties.oneway}</b><br />
            <b>modes: {object.properties.modes}</b>
            {/*  más información  */}
          </div>
        );
      }
    }

    else if (layer && layer.id === 'trips' && object) {
      // TripsLayer tooltip content
      tooltipContent = (
        <div>
          <b>EVENTS</b><br />
          <b>vehicle id: {object.vehicle}</b>
          
        </div>
      );

    } else if (layer && layer.id === 'CustomLayer1' && object){
      tooltipContent = (
        <div>
          <b>CUSTOM LAYER 1</b><br />
          <b>id: {object.properties.id}</b><br />
          <b>position: {object.geometry.coordinates[0]}, {object.geometry.coordinates[1]}</b><br />
        </div>
      );
    } else if (layer && layer.id === 'CustomLayer2' && object){
      tooltipContent = (
        <div>
          <b>CUSTOM LAYER 2</b><br />
          <b>id: {object.properties.id}</b><br />
          <b>position: {object.geometry.coordinates[0]}, {object.geometry.coordinates[1]}</b><br />
        </div>
      );
    } else if (layer && layer.id === 'CustomLayer3' && object){
      tooltipContent = (
        <div>
          <b>CUSTOM LAYER 3</b><br />
          <b>id: {object.properties.id}</b><br />
          <b>position: {object.geometry.coordinates[0]}, {object.geometry.coordinates[1]}</b><br />
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

  
  
  const calculateInitialViewState = (customLayer4) => {
    // Verificar que customLayer4 tenga al menos un elemento y la estructura esperada
    if (customLayer4 && customLayer4.features && customLayer4.features.length > 0) {
      const firstFeature = customLayer4.features[0];
  
      // Verificar que la primera característica tenga la estructura esperada
      if (firstFeature.geometry && firstFeature.geometry.coordinates) {
        const firstCoordinate = firstFeature.geometry.coordinates;
  
        // Configuración de initialViewState basada en la primera coordenada
        return {
          longitude: firstCoordinate[0],
          latitude: firstCoordinate[1],
          zoom: 12, 
          pitch: 45,
          bearing: 0,
          
        };
      }
    }
  
    return {
      longitude: -79.0,
      latitude: -2.9,
      zoom: 2,
      pitch: 45,
      bearing: 0,
    };
  };
  
  
  const layers = [

    networkLayerVisible &&
    customLayer4 &&
    new GeoJsonLayer({
      id: 'MapNetwork',
      data: customLayer4,
      filled: true,
      pointRadiusMinPixels: 0,
      pointRadiusScale: pointRadiusScale,
      getPointRadius: (f) => 11 - f.properties.scalerank,
      getFillColor: [255, 0, 255, 255],  // centro
      getLineWidth: getLineWidth,      //ancho de lineas
      getLineColor:[0, 0, 0, 255],  //lineas
      pickable: true,
      onHover: (info) => setHoverInfo(info),
      autoHighlight: true,
      highlightColor: [23, 184, 190, 225], 
      initialViewState: calculateInitialViewState(customLayer4) // Aquí se establece initialViewState

    }),

    tripsLayerVisible &&
    customLayer5 &&
    new TripsLayer({
      id: 'trips',
      data: customLayer5,
      getPath: (d) => d.path,
      getTimestamps: (d) => d.timestamps,
      getColor: (d) => theme.trailColor0,
      opacity: opacity,
      widthMinPixels: widthMinPixels,
      pickable: true,
      autoHighlight: true,
      highlightColor: [25, 100, 255, 225], 
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
      onHover: (info) => setHoverInfo(info),

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
      onHover: (info) => setHoverInfo(info),

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
      onHover: (info) => setHoverInfo(info),

    }),

    
  ];

  return (

    <div className=''>
      {/*Logo*/}
      <div className='app-name'>
      <div className="flex items-center right  " >
        <h1>
        <svg width="60px" height="60px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14.1427 15.9621C14.2701 16.2169 14.1593 16.5264 13.8991 16.6424L4.49746 20.835C3.00163 21.5021 1.45007 20.0209 2.19099 18.6331L5.34302 12.7294C5.58818 12.2702 5.58818 11.7298 5.34302 11.2706L2.19099 5.36689C1.45006 3.97914 3.00163 2.49789 4.49746 3.16496L8.02178 4.73662C8.44465 4.9252 8.78899 5.25466 8.99606 5.6688L14.1427 15.9621Z" fill="#1C274C"/>
          <path opacity="0.4" d="M15.5332 15.3904C15.6529 15.6297 15.9397 15.7324 16.1841 15.6235L21.0066 13.4728C22.3304 12.8825 22.3304 11.1181 21.0066 10.5278L12.1089 6.55983C11.6802 6.36864 11.2481 6.82023 11.458 7.24008L15.5332 15.3904Z" fill="#1C274C"/>
        </svg>
          <strong>TrafficSim-Vis</strong>
        </h1>
      </div>
      </div>

      {/* modal de informacion */}
      <Modal className='relative p-20 md:h-auto bg-gray-900 bg-opacity-80 dark:bg-opacity-80 ' show={openModal} onClose={() => setOpenModal(false)}>
            <Modal.Header className="flex items-start justify-center rounded-t bg-blue-500 text-white h-full w-full p-2">
            <div className="flex items-center">
              <svg width="40px" height="40px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                <path d="M14.1427 15.9621C14.2701 16.2169 14.1593 16.5264 13.8991 16.6424L4.49746 20.835C3.00163 21.5021 1.45007 20.0209 2.19099 18.6331L5.34302 12.7294C5.58818 12.2702 5.58818 11.7298 5.34302 11.2706L2.19099 5.36689C1.45006 3.97914 3.00163 2.49789 4.49746 3.16496L8.02178 4.73662C8.44465 4.9252 8.78899 5.25466 8.99606 5.6688L14.1427 15.9621Z" fill="#1C274C"/>
                <path opacity="0.5" d="M15.5332 15.3904C15.6529 15.6297 15.9397 15.7324 16.1841 15.6235L21.0066 13.4728C22.3304 12.8825 22.3304 11.1181 21.0066 10.5278L12.1089 6.55983C11.6802 6.36864 11.2481 6.82023 11.458 7.24008L15.5332 15.3904Z" fill="#1C274C"/>
              </svg>
              <h1 className="text-gray-900">Welcome to TrafficSim-Vis!</h1>
            </div>

          </Modal.Header>
          <Modal.Body>
            <div className="space-y-2 ">
    
                <p className="text-base leading-relaxed text-gray-100 dark:text-white" style={{ textAlign: 'justify' }}>
                This is a single-page application developed to view files processed from MATSim simulations. 
                It emerged as part of the work "Visual Analytics of Traffic Simulation Data". Users 
                can view and analyze traffic simulation data using browsers efficiently.
                </p>
        
              <p className="text-base leading-relaxed text-gray-100 dark:text-white">
              <strong>How to use it?</strong><br />
              You need to <a href="https://github.com/ChrisALoor/TrafficSim-Vis/tree/main/parsingFile" target="_blank" rel="noopener noreferrer"><span className="text-blue-500 ">preprocess</span></a> the MATSim output files (output_network.xml.gz and output_events.xml.gz). 
              When you have done this, you will get two JSON files ready to be loaded to this application from the ToolsLayer button (in case you only need usage-example <a href="https://github.com/ChrisALoor/TrafficSim-Vis/tree/main/src/data" target="_blank" rel="noopener noreferrer"><span className="text-blue-500 ">clic here</span></a>) .
              
              </p>
              
              <p className="text-base leading-relaxed text-gray-100 dark:text-white">
               Slider tools information:
              <ul>
                <li><strong>Node size</strong> = adjust the size of the node radius, range of 1 to 20 meters</li>
                <li><strong>Link size</strong> = adjust the size of the links width, range of 1 to 10 meters</li>
                <li><strong>TraiLenght</strong> = adjust vehicle trajectory fade, range of 1 to 2000 seconds</li>
                <li><strong>Trailwidth</strong> = adjust the width of the agents trail, range of 1 to 20 meters</li>
                <li><strong>TrailOpacity</strong> = adjust the opacity of the trail, range of 10% to 100 %</li>
              </ul>
              </p>
            </div>

            <Modal.Footer className="flex justify-center">
              <Button onClick={() => setOpenModal(false)}></Button>
              <Button className="p-2.5 group rounded-full bg-blue-500 hover:bg-blue-100 me-1 focus:outline-none focus:ring-4 focus:ring-gray-500 dark:focus:ring-gray-600 dark:hover:bg-gray-600 relative" color="red" onClick={() => setOpenModal(false)}>
                Accept
              </Button>
            </Modal.Footer>
          </Modal.Body>

      </Modal>





      {/*Barra lateral */}
      <div className={`sidebar ${isCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
      <div className='lateral'>         
          {/* Sidebar en el lado derecho */}
          <div className=" bg-gray-700  z-10 top-0 w-300 p-2">{/* bg-gray-700  z-10 top-0 w-200*/}
              <Sidebar aria-label="tools">
                <Sidebar.Items>
                  <Sidebar.ItemGroup>

                    <Sidebar.Item  icon={BiNetworkChart} style={{ color: 'white', textShadow: '1px 1px 2px rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'flex-start',pointerEvents: 'none' }}  >
                      NETWORK  
                    </Sidebar.Item>

                          <div className='bg-gray-700 dark:bg-gray-700'>
                            <div className='text-white' onClick={() => toggleLayerVisibility('network')} >
                              <input type="checkbox" checked={networkLayerVisible} onChange={() => handleCheckboxChange('custom4', setNetworkLayerVisible)} />
                              {networkLayerVisible ? ' File: ' : ' Show: '}<span className='text-white'>{fileNameNetwork}</span>
                            </div>

                            <input 
                              type="file" 
                              id='nuevoArchivo4' 
                              className='hidden' 
                              accept=".json" 
                              onChange={(e) => handleFileUpload(e, setCustomLayer4, setNetworkLayerVisible, setFileNameNetwork, 'network')} 
                            />
                            <label htmlFor="nuevoArchivo4" className='text-white' style={{ display: 'flex', alignItems: 'center' }}>
                              <div className="p-0.1 group rounded-full hover:bg-gray-100/50 me-1 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-600 dark:hover:bg-blue-600 relative" style={{ display: 'flex', alignItems: 'center' }}>
                                <FaPlus style={{ marginRight: '5px' }} />
                                <span>Add network</span>
                              </div>
                            </label>
                            <div className="flex flex-col items-right justify-right ">
                              <span className="text-white mb-2">
                                  Node size ({pointRadiusScale} meters) :
                              </span>
                              <input
                                type="range"
                                min={1}
                                max={20}
                                step={1}
                                value={pointRadiusScale}
                                onChange={handlepointRadiusScaleChange}
                                className='w-90 my-auto'
                                style={{
                                  background: `linear-gradient(to right, red ${((pointRadiusScale / 20) * 100)}%, rgba(196, 196, 196, 0.2) ${((pointRadiusScale / 20) * 100)}%)`,
                                  WebkitAppearance: 'none',
                                  height: '2px',
                                  borderRadius: '1px',
                                  outline: 'none',
                                  cursor: 'pointer',
                                }}
                              />
                            </div>
                            <div className="flex flex-col items-right justify-right  mt-2 ">
                              <span className="text-white mb-2">
                                  Link size ({getLineWidth} meters) :
                              </span>
                              <input
                                type="range"
                                min={0}
                                max={10}
                                step={1}
                                value={getLineWidth}
                                onChange={handlegetLineWidthChange}
                                className='w-90  my-auto'
                                style={{
                                  background: `linear-gradient(to right, red ${((getLineWidth / 10) * 100)}%, rgba(196, 196, 196, 0.2) ${((getLineWidth / 10) * 100)}%)`,
                                  WebkitAppearance: 'none',
                                  height: '2px',
                                  borderRadius: '1px',
                                  outline: 'none',
                                  cursor: 'pointer',
                                }}
                              />
                            </div>
                          </div>
                          <label className='barra'>
                              __________________________________
                          </label>
                          

                    <Sidebar.Item href="#" icon={FaCarSide } style={{ color: 'white', textShadow: '1px 1px 2px rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'flex-start',pointerEvents: 'none'}}>
                      EVENTS
                    </Sidebar.Item>

                          <div className='bg-gray-700 dark:bg-gray-700'>
                            <div className='text-white' onClick={() => toggleLayerVisibility('trips')}>
                              <input type="checkbox" checked={tripsLayerVisible} onChange={() => handleCheckboxChange('custom5', setTripsLayerVisible)} />
                              {tripsLayerVisible ? ' File: ' : ' Show: '}<span className='text-white'>{fileNameTrips}</span>
                            </div>

                            <input 
                              type="file" 
                              id='nuevoArchivo5' 
                              className='hidden' 
                              accept=".json" 
                              onChange={(e) => handleFileUpload(e, setCustomLayer5, setTripsLayerVisible,setFileNameTrips, 'trips')} 
                            />
                            <label htmlFor="nuevoArchivo5" className='text-white' style={{ display: 'flex', alignItems: 'center' }}>
                              <div className="p-0.1 group rounded-full hover:bg-gray-100/50 me-1 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-600 dark:hover:bg-blue-600 relative" style={{ display: 'flex', alignItems: 'center' }}>
                                <FaPlus style={{ marginRight: '5px' }} />
                                <span>Add event</span>
                              </div>
                            </label>
                            </div>



                            <div className="flex flex-col items-right justify-right">
                              <span className="text-white mb-2">
                                TrailLenght ({trailLength} seconds) :
                              </span>
                              <input
                                type="range"
                                min={1}
                                max={2000}
                                step={1}
                                value={trailLength}
                                onChange={handleTrailLengthChange}
                                className='w-90  my-auto'
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

                            <div className="flex flex-col items-right justify-right  mt-2">
                              <span className="text-white mb-2">
                                  TrailWidth ({widthMinPixels} meters) :
                              </span>
                              <input
                                type="range"
                                min={1}
                                max={20}
                                step={1}
                                value={widthMinPixels}
                                onChange={handlewidthMinPixelsChange}
                                className='w-90 my-auto'
                                style={{
                                  background: `linear-gradient(to right, red ${((widthMinPixels / 20) * 100)}%, rgba(196, 196, 196, 0.2) ${((widthMinPixels / 20) * 100)}%)`,
                                  WebkitAppearance: 'none',
                                  height: '2px',
                                  borderRadius: '1px',
                                  outline: 'none',
                                  cursor: 'pointer',
                                }}
                              />               
                            </div>

                            <div className="flex flex-col items-right justify-right  mt-2">
                              <span className="text-white mb-2">
                                  TrailOpacity ({opacity * 100}%):
                              </span>
                              <input
                                type="range"
                                min={0}
                                max={1.0}
                                step={0.1}
                                value={opacity}
                                onChange={handleOpacityChange}
                                className='w-90 my-auto'
                                style={{
                                  background: `linear-gradient(to right, red ${((opacity / 1.0) * 100)}%, rgba(196, 196, 196, 0.2) ${((opacity / 1.0) * 100)}%)`,
                                  WebkitAppearance: 'none',
                                  height: '2px',
                                  borderRadius: '1px',
                                  outline: 'none',
                                  cursor: 'pointer',
                                }}
                              />               
                            </div>

                          <label className='barra'>
                                __________________________________
                          </label>
                 
                    <Sidebar.Item href="#" icon={FaLayerGroup } style={{ color: 'white', textShadow: '1px 1px 2px rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'flex-start',pointerEvents: 'none' }}>
                      CUSTOM LAYER 1 
                    </Sidebar.Item>
                          <div className='bg-gray-700 dark:bg-gray-700'>
                            <div className='text-white' onClick={() => toggleLayerVisibility('custom1')}>
                              <input type="checkbox" checked={customLayerVisible1} onChange={() => handleCheckboxChange('custom1', setCustomLayerVisible1)} />
                              {customLayerVisible1 ? ' File: ' : ' Show: '}<span className='text-white'>{fileNameCustom1}</span>
                            </div>
                            <input 
                              type="file" 
                              id='nuevoArchivo1' 
                              className='hidden' 
                              accept=".json" 
                              onChange={(e) => handleFileUpload(e, setCustomLayer1, setCustomLayerVisible1, setfileNameCustom1, 'layer1')} 
                            />
                            <label htmlFor="nuevoArchivo1" className='text-white' style={{ display: 'flex', alignItems: 'center' }}>
                              <div className="p-0.1 group rounded-full hover:bg-gray-100/50 me-1 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-600 dark:hover:bg-blue-600 relative" style={{ display: 'flex', alignItems: 'center' }}>
                                <FaPlus style={{ marginRight: '5px' }} />
                                <span>Add custom layer 1</span>
                              </div>
                            </label>
                          </div>
                          <label className='barra'>
                              __________________________________
                          </label>

                    <Sidebar.Item href="#" icon={FaLayerGroup } style={{ color: 'white', textShadow: '1px 1px 2px rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'flex-start',pointerEvents: 'none' }}>
                      CUSTOM LAYER 2 
                    </Sidebar.Item>
                          <div className='bg-gray-700 dark:bg-gray-700'>
                            <div className='text-white' onClick={() => toggleLayerVisibility('custom2')}>
                              <input type="checkbox" checked={customLayerVisible2} onChange={() => handleCheckboxChange('custom2', setCustomLayerVisible2)} />
                              {customLayerVisible2 ? ' File: ' : ' Show: '}<span className='text-white'>{fileNameCustom2}</span>
                            </div>
                            <input 
                              type="file" 
                              id='nuevoArchivo2' 
                              className='hidden' 
                              accept=".json" 
                              onChange={(e) => handleFileUpload(e, setCustomLayer2, setCustomLayerVisible2, setfileNameCustom2, 'layer2')} 
                            />
                            <label htmlFor="nuevoArchivo2" className='text-white' style={{ display: 'flex', alignItems: 'center' }}>
                              <div className="p-0.1 group rounded-full hover:bg-gray-100/50 me-1 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-600 dark:hover:bg-blue-600 relative" style={{ display: 'flex', alignItems: 'center' }}>
                                <FaPlus style={{ marginRight: '5px' }} />
                                <span>Add custom layer 2</span>
                              </div>
                            </label>
                          </div>
                          <label className='barra'>
                              __________________________________
                          </label>

                    <Sidebar.Item href="#" icon={FaLayerGroup } style={{ color: 'white', textShadow: '1px 1px 2px rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'flex-start',pointerEvents: 'none' }}>
                      CUSTOM LAYER 3 
                    </Sidebar.Item>
                          <div className='bg-gray-700 dark:bg-gray-700'>
                            <div className='text-white' onClick={() => toggleLayerVisibility('custom3')}>
                              <input type="checkbox" checked={customLayerVisible3} onChange={() => handleCheckboxChange('custom3', setCustomLayerVisible3)} />
                              {customLayerVisible3 ? ' File: ' : ' Show: '}<span className='text-white'>{fileNameCustom3}</span>
                            </div>
                            <input 
                              type="file" 
                              id='nuevoArchivo3' 
                              className='hidden' 
                              accept=".json" 
                              onChange={(e) => handleFileUpload(e, setCustomLayer3, setCustomLayerVisible3,setfileNameCustom3, 'layer3')} 
                            />
                            <label htmlFor="nuevoArchivo3" className='text-white' style={{ display: 'flex', alignItems: 'center' }}>
                              <div className="p-0.1 group rounded-full hover:bg-gray-100/50 me-1 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-600 dark:hover:bg-blue-600 relative" style={{ display: 'flex', alignItems: 'center' }}>
                                <FaPlus style={{ marginRight: '5px' }} />
                                <span>Add custom layer 3</span>
                              </div>
                            </label>
                          </div>

                          

                  
                  </Sidebar.ItemGroup>
                </Sidebar.Items>
              </Sidebar>

            </div>
            </div>
            </div>  

            
      {/*Barra de reproductor */}
      <div className='relative'>
        
        <span onClick={handleToggleSidebar} >
              <button className="z-30 top-0 left-20 p-2.5 group rounded-full hover:bg-gray-100/20 focus:outline-none focus:ring-0 focus:ring-gray-200 dark:focus:ring-gray-100 dark:hover:bg-blue-600 relative"     onMouseEnter={() => setMensaje('Tool Layers')} onMouseLeave={clearMensaje}>
                  <TbAdjustmentsHorizontal style={{ fontSize: '24px', color: 'white' }}/>
              </button>
        </span>
        <span onClick={() => setOpenModal(true)}  >
                <button className="z-30 top-0 right-1 p-2.5 group rounded-full hover:bg-gray-100/20 focus:outline-none focus:ring-0 focus:ring-gray-200 dark:focus:ring-gray-100 dark:hover:bg-blue-600 relative"     onMouseEnter={() => setMensaje('Information')} onMouseLeave={clearMensaje}>
                    <FaInfoCircle style={{ fontSize: '24px', color: 'white' }}/>
                </button>
        </span>
        <div className=' bg-gray-700 backdrop-blur-sm w-full absolute z-10 top-0' >
          <div className="w-full">


            <div className="flex items-center justify-center mx-auto mb-1">
            
            <span className="ml-2 text-gray-300 dark:text-gray-300">{animationSpeed}</span>
              <span onClick={decreaseSpeed} >
                <button className="p-2.5 group rounded-full hover:bg-gray-100/20 focus:outline-none focus:ring-0 focus:ring-gray-100 dark:focus:ring-gray-100 dark:hover:bg-blue-600 relative">
                  <svg onMouseEnter={() => setMensaje('Decrease Speed')} onMouseLeave={clearMensaje} className="rtl:rotate-180 w-4 h-4 text-gray-500 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="white" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 16.811c0 .864-.933 1.406-1.683.977l-7.108-4.061a1.125 1.125 0 0 1 0-1.954l7.108-4.061A1.125 1.125 0 0 1 21 8.689v8.122ZM11.25 16.811c0 .864-.933 1.406-1.683.977l-7.108-4.061a1.125 1.125 0 0 1 0-1.954l7.108-4.061a1.125 1.125 0 0 1 1.683.977v8.122Z" />
                  </svg>
                </button>
              </span>

              {mensaje && <span className="absolute bg-gray-800 bottom-0 left-1/2 transform -translate-x-1/2 mt-2 text-gray-100 dark:text-gray-100">{mensaje}</span>}

              <span onClick={togglePlayPause} >

                <button className="inline-flex items-center justify-center p-2.5 mx-2 font-medium bg-azul rounded-full hover:bg-red-700 group focus:ring-0 focus:ring-blue-100 focus:outline-none dark:focus:ring-gray-100">
                {
                  isPlaying ?
                    <svg onMouseEnter={() => setMensaje('Pause')} onMouseLeave={clearMensaje} className="w-3 h-3 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" stroke="white" viewBox="0 0 10 16">
                      <path fill-rule="evenodd" d="M0 .8C0 .358.32 0 .714 0h1.429c.394 0 .714.358.714.8v14.4c0 .442-.32.8-.714.8H.714a.678.678 0 0 1-.505-.234A.851.851 0 0 1 0 15.2V.8Zm7.143 0c0-.442.32-.8.714-.8h1.429c.19 0 .37.084.505.234.134.15.209.354.209.566v14.4c0 .442-.32.8-.714.8H7.857c-.394 0-.714-.358-.714-.8V.8Z" clip-rule="evenodd" />
                    </svg>
                    :
                    <svg onMouseEnter={() => setMensaje('Play')} onMouseLeave={clearMensaje} className="w-3 h-3 text-white" stroke="white" stroke-width="3"
                      version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 17.804 17.804" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g id="c98_play"> <path d="M2.067,0.043C2.21-0.028,2.372-0.008,2.493,0.085l13.312,8.503c0.094,0.078,0.154,0.191,0.154,0.313 c0,0.12-0.061,0.237-0.154,0.314L2.492,17.717c-0.07,0.057-0.162,0.087-0.25,0.087l-0.176-0.04 c-0.136-0.065-0.222-0.207-0.222-0.361V0.402C1.844,0.25,1.93,0.107,2.067,0.043z"></path> </g> <g id="Capa_1_78_"> </g> </g> </g></svg>
                }
                </button>
              </span>

              <span onClick={increaseSpeed} >
                <button className="p-2.5 group rounded-full hover:bg-gray-100/20 me-1 focus:outline-none focus:ring-0 focus:ring-gray-200 dark:focus:ring-gray-100 dark:hover:bg-blue-600 relative">
                  <svg onMouseEnter={() => setMensaje('Increase Speed')} onMouseLeave={clearMensaje} className="rtl:rotate-180 w-4 h-4 text-gray-500 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="white" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061A1.125 1.125 0 0 1 3 16.811V8.69ZM12.75 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061a1.125 1.125 0 0 1-1.683-.977V8.69Z" />
                  </svg>
                </button>
              </span>

            </div>


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
        <div>

        </div>

      </div>


      

      <DeckGL layers={layers} effects={theme.effects} initialViewState={calculateInitialViewState(customLayer4)} controller={true}>
        <Map reuseMaps mapLib={maplibregl} mapStyle={mapStyle} preventStyleDiffing={true} />
        {renderTooltip()}

      </DeckGL>

       
    </div>
  );
}

export function renderToDOM(container) {
  createRoot(container).render(<App />);
  
}