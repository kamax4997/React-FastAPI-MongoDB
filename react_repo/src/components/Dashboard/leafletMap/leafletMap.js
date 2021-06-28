import React from "react";
import {MapContainer, TileLayer, Marker, Tooltip, TileLayerProps} from 'react-leaflet'
import {DivIcon} from 'leaflet'

import 'font-awesome/css/font-awesome.min.css';
import './leafletMap.scss';
import 'leaflet/dist/leaflet.css';

export const LeafletMap = ({mapData, mapStyle}) => {

  let defaultLatLng = [51.505, -0.09];

  const tilelayer = <TileLayer url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&hl=en"
                               minZoom={1}
                               maxZoom={18}
                               maxNativeZoom={17}
                               minNativeZoom={2}
                               subdomains={["mt0", "mt1", "mt2", "mt3"]}/>

  const markers = Object.keys(mapData).map(function (url, idx) {
    if (!mapData[url]["showMarker"]) {
      return ``;
    }
    const android = [
      '<div class="leaflet-icon-wrap">',
      '{{counter}}',
      '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 475.071 475.071" xml:space="preserve">',
      `<g fill="url(#androidLG-${idx})">`,
      '<path d="M65.947,153.884c-8.183,0-15.136,2.853-20.844,8.566c-5.708,5.711-8.564,12.562-8.564,20.555v122.772 c0,8.179,2.855,15.126,8.564,20.837c5.708,5.712,12.657,8.562,20.841,8.562c8.186,0,15.085-2.851,20.699-8.562 c5.618-5.711,8.425-12.658,8.425-20.837V183.005c0-7.996-2.857-14.847-8.565-20.555C80.794,156.74,73.939,153.884,65.947,153.884z"/>',
      '<path d="M106.494,349.457c0,8.754,3.046,16.177,9.136,22.269c6.091,6.085,13.512,9.13,22.27,9.13h21.128l0.288,64.81c0,8.186,2.855,15.129,8.564,20.841c5.708,5.711,12.562,8.565,20.555,8.565c8.188,0,15.133-2.854,20.844-8.565c5.711-5.712,8.564-12.655,8.564-20.841v-64.81h39.397v64.81c0,8.186,2.854,15.129,8.562,20.841c5.715,5.711,12.662,8.565,20.848,8.565c8.179,0,15.126-2.854,20.834-8.565c5.708-5.712,8.559-12.655,8.559-20.841v-64.81h21.416c8.56,0,15.89-3.039,21.98-9.13c6.092-6.092,9.138-13.515,9.138-22.269V159.308H106.494V349.457z"/>',
      '<path d="M302.345,43.682L322.61,6.279c1.335-2.474,0.855-4.377-1.424-5.708c-2.478-1.143-4.38-0.572-5.708,1.714L294.918,39.97c-18.082-7.994-37.205-11.991-57.384-11.991c-20.174,0-39.304,3.997-57.387,11.991L159.591,2.286c-1.328-2.286-3.234-2.857-5.708-1.714c-2.285,1.331-2.758,3.234-1.426,5.708l20.271,37.402c-20.559,10.467-36.923,25.076-49.108,43.824c-12.181,18.749-18.273,39.259-18.273,61.525h264.095c0-22.266-6.091-42.777-18.273-61.525C338.982,68.758,322.717,54.148,302.345,43.682z M185.144,98.068c-2.187,2.19-4.803,3.284-7.849,3.284c-3.046,0-5.614-1.093-7.71-3.284c-2.091-2.187-3.14-4.805-3.14-7.85c0-3.046,1.049-5.664,3.14-7.854c2.093-2.19,4.665-3.282,7.71-3.282c3.042,0,5.659,1.091,7.849,3.282c2.19,2.19,3.284,4.808,3.284,7.854C188.428,93.264,187.334,95.878,185.144,98.068z M305.489,98.068c-2.098,2.19-4.668,3.284-7.713,3.284c-3.046,0-5.657-1.093-7.848-3.284c-2.19-2.187-3.281-4.805-3.281-7.85c0-3.046,1.091-5.664,3.281-7.854c2.19-2.19,4.802-3.282,7.848-3.282c3.045,0,5.615,1.091,7.713,3.282c2.088,2.19,3.139,4.808,3.139,7.854C308.628,93.264,307.58,95.878,305.489,98.068z"/>',
      '<path d="M429.964,162.306c-5.708-5.614-12.655-8.422-20.841-8.422c-7.991,0-14.843,2.808-20.551,8.422c-5.711,5.616-8.568,12.517-8.568,20.699v122.772c0,8.179,2.857,15.126,8.568,20.837c5.708,5.712,12.56,8.562,20.551,8.562c8.186,0,15.133-2.851,20.841-8.562c5.715-5.711,8.568-12.658,8.568-20.837V183.005C438.532,174.822,435.679,167.921,429.964,162.306z"/>',
      '</g>',
      `<linearGradient id="androidLG-${idx}" x1="0" x2="0" y1="0" y2="1">`,
      '<stop offset="0%" stop-color="rgba({{color}}, 0.25)"/>',
      '<stop offset="50%" stop-color="rgba({{color}}, 0.60)"/>',
      '<stop offset="100%" stop-color="rgba({{color}}, 0.90)"/>',
      '</linearGradient>',
      '</svg>',
      '</div>',
    ].join('\n');
    const laptop = [
      '<div class="leaflet-icon-wrap">',
      '{{counter}}',
      '<svg enable-background="new 0 0 512.428 512.428" viewBox="0 0 512.428 512.428" x="0px" y="0px" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">',
      `<g fill="url(#laptopLG-${idx})">`,
      '<path d="m508.434 420.271-43.22-58.057h-418l-43.22 58.057c-9.822 13.194-.406 31.943 16.043 31.943h472.355c16.448 0 25.864-18.75 16.042-31.943z"/>',
      '<path d="m465.214 100.214c0-22.091-17.909-40-40-40h-338c-22.091 0-40 17.909-40 40v232h418zm-168 30h-82c-8.284 0-15-6.716-15-15s6.716-15 15-15h82c8.284 0 15 6.716 15 15s-6.716 15-15 15z"/>',
      '</g>',
      `<linearGradient id="laptopLG-${idx}" x1="0" x2="0" y1="0" y2="1">`,
      '<stop offset="0%" stop-color="rgba({{color}}, 0.25)"/>',
      '<stop offset="50%" stop-color="rgba({{color}}, 0.60)"/>',
      '<stop offset="100%" stop-color="rgba({{color}}, 0.90)"/>',
      '</linearGradient>',
      '</svg>',
      '</div>',
    ].join('\n');
    const apple = [
      '<div class="leaflet-icon-wrap">',
      '{{counter}}',
      '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" xml:space="preserve">',
      `<g fill="url(#appleLG-${idx})">`,
      '<path d="M185.255,512c-76.201-0.439-139.233-155.991-139.233-235.21c0-129.404,97.075-157.734,134.487-157.734 c16.86,0,34.863,6.621,50.742,12.48c11.104,4.087,22.588,8.306,28.975,8.306c3.823,0,12.832-3.589,20.786-6.738   c16.963-6.753,38.071-15.146,62.651-15.146c0.044,0,0.103,0,0.146,0c18.354,0,74.004,4.028,107.461,54.272l7.837,11.777   l-11.279,8.511c-16.113,12.158-45.513,34.336-45.513,78.267c0,52.031,33.296,72.041,49.292,81.665   c7.061,4.248,14.37,8.628,14.37,18.208c0,6.255-49.922,140.566-122.417,140.566c-17.739,0-30.278-5.332-41.338-10.034   c-11.191-4.761-20.845-8.862-36.797-8.862c-8.086,0-18.311,3.823-29.136,7.881C221.496,505.73,204.752,512,185.753,512H185.255z"/>',
      '<path d="M351.343,0c1.888,68.076-46.797,115.304-95.425,112.342C247.905,58.015,304.54,0,351.343,0z"/>',
      '</g>',
      `<linearGradient id="appleLG-${idx}" x1="0" x2="0" y1="0" y2="1">`,
      '<stop offset="0%" stop-color="rgba({{color}}, 0.25)"/>',
      '<stop offset="50%" stop-color="rgba({{color}}, 0.60)"/>',
      '<stop offset="100%" stop-color="rgba({{color}}, 0.90)"/>',
      '</linearGradient>',
      '</svg>',
      '</div>',
    ].join('\n');
    const mobile = [
      '<div class="leaflet-icon-wrap">',
      '{{counter}}',
      '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 32 32" xml:space="preserve">',
      `<g fill="url(#phoneLG-${idx})">`,
      `<path d="M23 0h-14c-1.65 0-3 1.35-3 3v26c0 1.65 1.35 3 3 3h14c1.65 0 3-1.35 3-3v-26c0-1.65-1.35-3-3-3zM12 1.5h8v1h-8v-1zM16 30c-1.105 0-2-0.895-2-2s0.895-2 2-2 2 0.895 2 2-0.895 2-2 2zM24 24h-16v-20h16v20z"></path>`,
      '</g>',
      `<linearGradient id="phoneLG-${idx}" x1="0" x2="0" y1="0" y2="1">`,
      '<stop offset="0%" stop-color="rgba({{color}}, 0.25)"/>',
      '<stop offset="50%" stop-color="rgba({{color}}, 0.60)"/>',
      '<stop offset="100%" stop-color="rgba({{color}}, 0.90)"/>',
      '</linearGradient>',
      '</svg>',
      '</div>',
    ].join('\n');

    
    return Object.keys(mapData[url]["data"]).map(function(ll, idxx) {
      const location = mapData[url]["data"][ll];
      const latlong = [location["lat"], location["long"]];
      const numOfCliked = Object.keys(location["date"]).length;

      var iconCounter = "";
      if (numOfCliked > 1) {
        iconCounter = '<div class="leaflet-icon-counter" style="color: rgba({{color}})">+{{numOfIcon}}</div>'
          .replaceAll("{{color}}", location["color"])
          .replaceAll("{{numOfIcon}}", numOfCliked);
      }
      const iconDevice = {
        "iphone": apple.replaceAll("{{color}}", location["color"]).replace("{{counter}}", iconCounter),
        "android": android.replaceAll("{{color}}", location["color"]).replace("{{counter}}", iconCounter),
        "desktop": laptop.replaceAll("{{color}}", location["color"]).replace("{{counter}}", iconCounter),
        "mobile": mobile.replaceAll("{{color}}", location["color"]).replace("{{counter}}", iconCounter)
      }
      const carIcon = new DivIcon({
        className: "leaflet-div-marker",
        iconSize: [35, 35],
        html: iconDevice[location["device"]]
      });

      if (defaultLatLng.length === 0) {
        defaultLatLng = latlong;
      }
      const randomKey = () => Math.random().toString(36).substring(7);
      return (
        <Marker position={latlong}
                icon={carIcon}
                key={"marker-"+randomKey()}
        >
          <Tooltip>
            <table className={"leaflet-tooltip-table"}>
              <tbody>
                <tr key={idx+"tr1"}><td colSpan={2}>{Object.keys(location["date"])[0]}</td></tr>
                <tr key={idx+"tr2"}><td colSpan={2}><hr/></td></tr>
                <tr key={idx+"tr3"}><td colSpan={2}>{location["city"]}</td></tr>
                <tr key={idx+"tr4"}><td colSpan={2}>{url}</td></tr>
              </tbody>
            </table>
          </Tooltip>
        </Marker>)
    });
  });

  return(
      <MapContainer center={defaultLatLng} zoom={1.5} style={mapStyle}>
        {tilelayer}
        {markers}
      </MapContainer>
  )
}