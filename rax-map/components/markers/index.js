/**
 * Created with WebStorm.
 * User: 一晟
 * Date: 2018/5/7
 * Time: 上午10:25
 * email: zhu.yan@alibaba-inc.com
 * To change this template use File | Settings | File Templates.
 */
import {createElement, Component, render, Children, PureComponent, cloneElement, unmountComponentAtNode} from 'rax';
import View from 'rax-view';

import hash from 'object-hash';

import isFun from '../utils/isFun';
import log from '../utils/log';
import {
  MarkerAllProps,
  getPropValue,
  renderMarkerComponent
} from '../utils/markerUtils';

if (typeof window !== 'undefined') {
  const styleText = `.amap_markers_pop_window{
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background: #fff;
    position: relative;
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
}
.amap_markers_pop_window::before{
    content: ' ';
    display: block;
    position: absolute;
    bottom: -12px;
    left: 50%;
    margin-left: -7px;
    width: 0;
    height: 0;
    border-top: 12px solid #ddd;
    border-left: 7px solid transparent;
    border-right: 7px solid transparent;
}
.amap_markers_pop_window::after{
    content: ' ';
    display: block;
    position: absolute;
    bottom: -11px;
    left: 50%;
    margin-left: -6px;
    width: 0;
    height: 0;
    border-top: 11px solid #fff;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
}
.amap_markers_pop_window_item{
    cursor:pointer;
    width: 40px;
    height: 50px;
    display: flex;
    align-items: flex-end;
    justify-content: center;
}
.amap_markers_pop_window_item span{
    pointer-events: none;
}
.amap_markers_window_overflow_warning{
    text-align: center;
    width: 100%;
    margin: 5px 0;
    color: #666;
}`;
  const headEl = document.head || document.getElementsByTagName('head')[0];
  const styleEl = document.createElement('style');
  styleEl.type = 'text/css';
  styleEl.textContent = styleText;
  headEl.appendChild(styleEl);
}

const SCALE = 0.8;
const SIZE_WIDTH = 32 * SCALE;
const SIZE_HEIGHT = 46 * SCALE - 2;
const SIZE_HOVER_WIDTH = 46 * SCALE;
const SIZE_HOVER_HEIGHT = 66 * SCALE - 2;
const MAX_INFO_MARKERS = 42;

const defaultOpts = {
  useCluster: false,
  markersCache: [],
  markerIDCache: []
};

const ClusterProps = [
  'gridSize',
  'minClusterSize',
  'maxZoom',
  'averageCenter',
  'styles',
  'zoomOnClick',
  'renderCluserMarker'
];

const IdKey = '__react_amap__';

// const MarkerDOM = HTMLDivElement & { markerRef: Object };
/*
 * props
 * {
 *  useCluster(boolean)是否使用聚合点
 *  markers(array<>)坐标列表
 *  __map__ 父级组件传过来的地图实例
 *  __ele__ 父级组件传过来的地图容器
 * }
 */

class Markers extends PureComponent {
  static displayName = 'Markers';

  map;
  element;
  markersCache;
  markerIDCache;
  useCluster;
  resetOffset;
  hoverOffset;
  markersWindow;
  mapCluster;
  markersDOM;
  markerReactChildDOM;
  keepLive;

  constructor(props) {
    super(props);
    if (typeof window !== 'undefined') {
      if (!props.__map__) {
        log.warning('MAP_INSTANCE_REQUIRED');
      } else {
        this.map = props.__map__;
        this.element = this.map.getContainer();
        this.markersCache = defaultOpts.markersCache;
        this.useCluster = null;
        this.markerIDCache = defaultOpts.markerIDCache;
        this.resetOffset = new window.AMap.Pixel(-SIZE_WIDTH / 2, -SIZE_HEIGHT);
        this.hoverOffset = new window.AMap.Pixel(-SIZE_HOVER_WIDTH / 2, -SIZE_HOVER_HEIGHT);
        this.keepLive = props.keepLive || false;
        this.createMarkers(props);
      }
    }
  }

  shouldComponentUpdate() {
    return false;
  }

  /* 创建amap类型的markers
  * props:react 对象的props
  * */
  createMarkers(props) {
    const markers = props.markers || [];
    const mapMarkers = [];
    const markerReactChildDOM = {};
    markers.length && markers.forEach((raw, idx) => {
      const options = this.buildCreateOptions(props, raw, idx);
      options.map = this.map;
      let markerContent = null;
      if (isFun(props.render)) {
        // $FlowFixMe
        let markerChild = props.render(raw);
        if (markerChild !== false) {
          const div = document.createElement('div');
          div.setAttribute(IdKey, '1');
          markerContent = div;
          markerReactChildDOM[idx] = markerChild;
        }
      }

      if (!markerContent) {
        markerContent = document.createElement('div');
        const img = document.createElement('img');
        img.src = '//webapi.amap.com/theme/v1.3/markers/n/mark_bs.png';
        markerContent.appendChild(img);
      }
      options.content = markerContent;
      const marker = new window.AMap.Marker(options);
      marker.on('click', (e) => {
        this.onMarkerClick(e);
      });
      marker.on('mouseover', (e) => {
        this.onMarkerHover(e);
      });
      marker.on('mouseout', (e) => {
        this.onMarkerHoverOut(e);
      });
      marker.on('touchstart', (e) => {
        this.onMarkerTouchstart(e);
      });
      marker.on('touchend', (e) => {
        this.onMarkerTouchend(e);
      });
      marker.on('touchmove', (e) => {
        this.onMarkerTouchmove(e);
      });

      marker.render = (function(marker) {
        return function(component) {
          return renderMarkerComponent(component, marker);
        };
      }(marker));

      this.bindMarkerEvents(marker);
      mapMarkers.push(marker);
      // 做每个marker的唯一性标记,用于比较marker的交并关系,isArea是为了处理是否是区域聚合
      raw.createdHash = hash({longitude: options.position.lng, latitude: options.position.lat, isArea: options.extData.isArea});
      raw.hashPosition = {longitude: options.position.lng, latitude: options.position.lat};
      raw.feature = marker;
      raw.cacheIndex = mapMarkers.indexOf(marker);
    });
    this.markersCache = mapMarkers;
    /// this.markersCache = this.markersCache.concat(mapMarkers);
    this.markerReactChildDOM = markerReactChildDOM;
    this.exposeMarkerInstance();
    this.checkClusterSettings(props);
  }

  checkClusterSettings(props) {
    if (props.useCluster) {
      this.loadClusterPlugin(props.useCluster).then((cluster) => {
        cluster.setMarkers(this.markersCache);
      });
    } else {
      if (this.mapCluster) {
        const markers = this.mapCluster.getMarkers();
        this.mapCluster.clearMarkers();
        markers.forEach((marker) => {
          marker.setMap(this.map);
        });
      }
    }
  }

  componentDidMount() {
    if (this.map) {
      this.setMarkerChild();
    }
  }

  /*
  * 创建react类型的markers(渲染所有数据)
  * 根据markerReactChildDOM,来渲染所有的markersCache
  * 相当于redraw
  * */
  setMarkerChild() {
    Object.keys(this.markerReactChildDOM).forEach((idx) => {
      const dom = this.markersCache[idx].getContent();
      const child = this.markerReactChildDOM[idx];
      this.renderMarkerChild(dom, child);
    });
  }

  /*
  * 创建react类型的markers(只渲染新数据)
  * 根据filterCache(差集),来渲染最新加载的marker
  * 相当于draw
  * */
  refreshMarkerChild(filterCache) {
    let allChild = filterCache;
    allChild.forEach((item) => {
      let idx = item.cacheIndex;
      const dom = this.markersCache[idx].getContent();
      const child = this.markerReactChildDOM[idx];
      this.renderMarkerChild(dom, child);
    });
  }

  /* 创建react类型的markers */
  renderMarkerChild(dom, child) {
    render(<View>{child}</View>, dom);
  }

  /*
  * 格式化markers数据
  * props: markers props对象
  * raw: amap里的marker 对象的 部分options
  * idx: 索引值
  * MarkerAllProps:amap里的marker 对象的 全部options
  * */
  buildCreateOptions(props, raw, idx) {
    const result = {};
    // 强制用户通过 render 函数来定义外观
    // const disabledKeys = ['label', 'icon', 'content'];
    // 还是不强制好，通过覆盖的方式来(如果有 render，覆盖 content/icon);
    const disabledKeys = ['extData'];
    MarkerAllProps.forEach((key) => {
      if ((key in raw) && (disabledKeys.indexOf(key) === -1)) {
        result[key] = getPropValue(key, raw[key]);
      } else if (key in props) {
        if (isFun(props[key])) {
          const tmpValue = props[key].call(null, raw, idx);
          result[key] = getPropValue(key, tmpValue);
        } else {
          result[key] = getPropValue(key, props[key]);
        }
      }
    });
    result.extData = raw;
    // result.offset={x:-100,y:-34-8}
    return result;
  }

  componentWillReceiveProps(nextProps) {
    if (this.map) {
      this.refreshMarkersLayout(nextProps);
    }
  }

  /* 过滤markersCache(所有markers的临时缓存),把不需要重绘的(已经加载的点),排除
  * newCache:新传入的marker对象的options;
  * oldCache:cache中保存的marker对象;
  * filterFun:预留加判断权重
  * */
  pruneCache(newCache, oldCache, filterFun) {
    let same = [];
    let diff = [];
    diff = newCache.filter(
        (key) => {
          let hasHash = oldCache.find((marker) => {
            // let extData = marker.getExtData();
            // if (extData && extData.createdHash === key.createdHash) {//是否已经在cache中
            let extData = marker.createdHash;
            if (extData && extData === key.createdHash) {// 是否已经在cache中
              same.push(key);
              return filterFun ? filterFun() : true;// 如果有,调用过滤函数
            }
            return false;
          });
          return !hasHash;
        });
    if (!oldCache.length) {
      same = newCache;
    }

    return {diff: diff, same: same};
  }

  refreshMarkersLayout(nextProps) {
    const markerChanged = (nextProps.markers !== this.props.markers);
    // || (nextProps.markers.length === 0 && this.props.markers.length === 0);
    const clusterChanged = ((!!this.props.useCluster) !== (!!nextProps.useCluster));
    const relationship = this.pruneCache(nextProps.markers, this.props.markers);
    const keepCache = relationship.same; // 交集
    const filterCache = relationship.diff; // 差集
    // console.log('╔═════════════════════════════refresh═════════════════════════════╗');
    // console.log('数据发生变化:', markerChanged);
    // console.log('差集:', filterCache, '数量:', filterCache.length);
    // console.log('交集:', keepCache, '数量:', keepCache.length);
    // console.log('新数据:', nextProps.markers, '数量:', nextProps.markers.length);
    // console.log('旧数据:', this.props.markers, '数量:', this.props.markers.length);
    // console.log('旧cache:', this.markersCache, '数量:', this.markersCache.length);
    // console.log('╚══════════════════════════════════════════════════════════════════╝');
    if (markerChanged) {
      // keepLive=false,清空所有marker
      // keepCache=[ ] 表示新旧数据对比,没有任何的重复,说明数据彻底做了刷新
      console.warn('keepCache.length1:',this.keepLive,keepCache.length,filterCache,this.props.markers)
      if (!this.keepLive || !keepCache.length) {
        // this.markersCache.length && this.markersCache.forEach((marker) => {
        this.props.markers.length && this.props.markers.forEach((item) => {
          let marker = item.feature;
          if (marker) {
            marker.setMap(null);
            marker = null;
            item = null;
          }
        }
        );
        console.warn('keepCache.length2:',this.keepLive,keepCache.length,this.props.markers)
      }
      this.markersCache = defaultOpts.markersCache;// markersCache 归零
      // draw和redraw
      if (markerChanged && (!this.keepLive || !keepCache.length)) {
        this.createMarkers(nextProps);
        setTimeout(()=>{ // 这里加入延迟,就能看的keepLive全部刷新和部分刷新的不同,延迟时间越长闪烁越明显。
          this.setMarkerChild();
        },0)

      } else {
        let realProps = {};
        Object.keys(nextProps).forEach((idx) => {// 浅复制,生成新的marker,需要加载的marker数据
          realProps[idx] = nextProps[idx];
        });
        realProps.markers = filterCache;
        this.createMarkers(realProps);
        this.refreshMarkerChild(filterCache); // 这里不能异步渲染
      }
    }
    if (markerChanged || (clusterChanged)) {
      if (this.markersWindow) {
        this.markersWindow.close();
      }
    }
    if (clusterChanged) {
      this.checkClusterSettings(nextProps);
    }
  }

  loadClusterPlugin(clusterConfig) {
    if (this.mapCluster) {
      return Promise.resolve(this.mapCluster);
    }
    const config = (typeof clusterConfig === 'boolean') ? {} : clusterConfig;
    return new Promise((resolve) => {
      this.map.plugin(['AMap.MarkerClusterer'], () => {
        resolve(this.createClusterPlugin(config));
      });
    });
  }

  /*
  * 聚合的默认样式,追踪marker的style样式(目前只支持默认样式)。
  */
  renderCluserMarker(context, scope) {
    var count = 1;
    var factor = Math.pow(context.count / count, 1 / 18);
    var div = document.createElement('div');
    div.innerHTML = context.count;
    let masterContext = context.markers[context.count - 1];
    let childContext = masterContext.getContent().children[0];// 获取marker的样式
    if (childContext && childContext.children[0]) {
      let mStyle = childContext.children[0].style.cssText;
      div.style.cssText = mStyle;
    }
    context.marker.setContent(div);
  }

  createClusterPlugin(config) {
    let options = {};
    // const style = {
    //   url: clusterIcon,
    //   size: new window.AMap.Size(56, 56),
    //   offset: new window.AMap.Pixel(-28, -28)
    // };
    const defalutOptions = {
      scope: this,
      minClusterSize: 2,
      zoomOnClick: false,
      maxZoom: 18,
      gridSize: 81,
      // styles: [style, style, style],
      averageCenter: true,
      renderCluserMarker: this.renderCluserMarker
    };
    ClusterProps.forEach((key) => {
      if (key in config) {
        options[key] = config[key];
      } else {
        options[key] = defalutOptions[key];
      }
    });
    this.mapCluster = new window.AMap.MarkerClusterer(this.map, [], options);
    let events = {};
    if ('events' in config) {
      events = config.events;
      if ('created' in events) {
        events.created(this.mapCluster);
      }
    }
    this.initClusterMarkerWindow();
    this.bindClusterEvent(events);
    return this.mapCluster;
  }

  onMarkerClick(e) {
    const marker = e.target;
    this.triggerMarkerClick(e, marker);
  }

  onMarkerTouchend(e) {
    const marker = e.target;
    this.triggerMarkerTouchend(e, marker);
  }

  onMarkerTouchmove(e) {
    const marker = e.target;
    this.triggerMarkerTouchmove(e, marker);
  }

  onMarkerTouchstart(e) {
    const marker = e.target;
    this.triggerMarkerTouchstart(e, marker);
  }

  onMarkerHover(e) {
    e.target.setTop(true);
    this.setMarkerHovered(e, e.target);
  }

  onMarkerHoverOut(e) {
    e.target.setTop(false);
    this.setMarkerHoverOut(e, e.target);
  }

  onWindowMarkerClick(element) {
    const marker = element.markerRef;
    this.triggerMarkerClick(null, marker);
  }

  onWindowMarkerHover(element) {
    const marker = element.markerRef;
    this.setMarkerHovered(null, marker);
  }

  onWindowMarkerHoverOut(element) {
    const marker = element.markerRef;
    this.setMarkerHoverOut(null, marker);
  }

  setMarkerHovered(e, marker) {
    this.triggerMarkerHover(e, marker);
  }

  setMarkerHoverOut(e, marker) {
    this.triggerMarkerHoverOut(e, marker);
  }

  triggerMarkerClick(e, marker) {
    // const raw = marker.getExtData();
    const events = this.props.events || {};
    if (isFun(events.click)) {
      events.click(e, marker);
    }
  }

  triggerMarkerTouchend(e, marker) {
    // const raw = marker.getExtData();
    const events = this.props.events || {};
    if (isFun(events.touchend)) {
      events.touchend(e, marker);
    }
  }

  triggerMarkerTouchmove(e, marker) {
    // const raw = marker.getExtData();
    const events = this.props.events || {};
    if (isFun(events.touchmove)) {
      events.touchmove(e, marker);
    }
  }

  triggerMarkerTouchstart(e, marker) {
    // const raw = marker.getExtData();
    const events = this.props.events || {};
    if (isFun(events.touchstart)) {
      events.touchstart(e, marker);
    }
  }

  triggerMarkerHover(e, marker) {
    // const raw = marker.getExtData();
    const events = this.props.events || {};
    if (isFun(events.mouseover)) {
      events.mouseover(e, marker);
    }
  }

  triggerMarkerHoverOut(e, marker) {
    // const raw = marker.getExtData();
    const events = this.props.events || {};
    if (isFun(events.mouseout)) {
      events.mouseout(e, marker);
    }
  }

  initClusterMarkerWindow() {
    this.markersWindow = new window.AMap.InfoWindow({
      isCustom: true,
      autoMove: true,
      closeWhenClickMap: true,
      content: '<span>loading...</span>',
      showShadow: false,
      offset: new window.AMap.Pixel(0, -20)
    });
    this.markersDOM = document.createElement('div');
    this.markersDOM.className = 'amap_markers_pop_window';
    this.markersWindow.setContent(this.markersDOM);
  }

  bindClusterEvent(events) {
    this.mapCluster.on('click', (e) => {
      if (this.props.useCluster && this.props.useCluster.zoomOnClick) {
        //
      } else {
        let returnValue = true;
        if (isFun(events.click)) {
          returnValue = events.click(e);
        }
        if (returnValue !== false) {
          this.showMarkersInfoWindow(e);
        }
      }
    });
  }

  showMarkersInfoWindow(e) {
    const pos = e.lnglat;
    let markers = e.markers;
    this.markersDOM.innerHTML = '';
    if (markers && markers.length) {
      const length = markers.length;
      if (length > MAX_INFO_MARKERS) {
        markers = markers.slice(0, MAX_INFO_MARKERS);
      }
      markers.forEach((m) => {
        const contentDOM = m.getContent();
        const itemDOM = document.createElement('div');
        itemDOM.className = 'window_marker_item';
        itemDOM.appendChild(contentDOM);
        itemDOM.markerRef = m;
        itemDOM.addEventListener('click', this.onWindowMarkerClick.bind(this, itemDOM), true);
        itemDOM.addEventListener('mouseover', this.onWindowMarkerHover.bind(this, itemDOM), true);
        itemDOM.addEventListener('mouseout', this.onWindowMarkerHoverOut.bind(this, itemDOM), true);

        this.markersDOM.appendChild(itemDOM);

      });
      if (length > MAX_INFO_MARKERS) {
        const warning = document.createElement('div');
        warning.className = 'amap_markers_window_overflow_warning';
        warning.innerText = '更多坐标请放大地图查看';
        this.markersDOM.appendChild(warning);
      }
    }
    this.markersWindow.open(this.map, pos);
  }

  exposeMarkerInstance() {
    if ('events' in this.props) {
      const events = this.props.events || {};
      if (isFun(events.created)) {
        events.created(this.markersCache);
      }
    }
  }

  bindMarkerEvents(marker) {
    const events = this.props.events || {};
    const list = Object.keys(events);
    const preserveEv = ['click', 'mouseover', 'mouseout', 'created'];
    list.length && list.forEach((evName) => {
      if (preserveEv.indexOf(evName) === -1) {
        marker.on(evName, events[evName]);
      }
    });
  }

  render() {
    return (null);
  }
}

export default Markers;