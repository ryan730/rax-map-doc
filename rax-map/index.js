import Map from './components/map';
import Marker from './components/marker';
import Markers from './components/markers';
import Polyline from './components/polyline';
import Polygon from './components/polygon';
import Circle from './components/circle';
import Tip from './components/tip';

import checkZoom from './modules/checkZoom';
import detailSwiper from './modules/detailSwiper';
import currentLocation from './modules/currentLocation';
import mapServices from './modules/utils/mapServices';

// import Circle from './circle';
// import Polygon from './polygon';

// import GroundImage from './groundimage';
// import CircleEditor from './circleeditor';
// import PolyEditor from './polyeditor';
// import MouseTool from './mousetool';

export {
  Map,
  Marker,
  Markers,
  Polyline,
  Polygon,
  Circle,
  Tip,
  // CircleEditor,
  // PolyEditor,
  // InfoWindow,
  // GroundImage,
  // MouseTool
  checkZoom,
  currentLocation,
  mapServices,
  detailSwiper
};

export default {
  Map,
  Marker,
  Markers,
  Circle,
  // CircleEditor,
  Polyline,
  Polygon,
  Tip,
  // PolyEditor,
  // InfoWindow,
  // GroundImage,
  // MouseTool
  checkZoom,
  currentLocation,
  mapServices,
  detailSwiper
};