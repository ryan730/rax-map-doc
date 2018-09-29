import {createElement, Component, Children, PureComponent, cloneElement, unmountComponentAtNode} from 'rax';
import View from 'rax-view';
import APILoader from '../utils/APILoader';
import isFun from '../utils/isFun';
import log from '../utils/log';
import {toLnglat} from '../utils/common';
import wrapperGenerator from '../utils/wrapperGenerator';

const containerStyle = {
  width: '100%',
  height: '100%'
};
const wrapperStyle = {
  width: '100%',
  height: '100%',
  position: 'relative'
};

// Native supported dynamic props by Amap
const NativeDynamicProps = [
  'layers',
  'zoom',
  'center',
  'labelzIndex',

  // 'lang', native error in JSSDK when 3D viewMode
  'mapStyle',
  'features',
  'cursor',
  'pitch'
];

/*
 * Props below can set by 'setStatus' altogether
 */
const StatusDynamicProps = [
  'animateEnable',
  'doubleClickZoom',
  'dragEnable',
  'isHotspot',
  'jogEnable',
  'keyboardEnable',
  'resizeEnable',
  'rotateEnable',
  'scrollWheel',
  'touchZoom',
  'zoomEnable'
];

const StaticProps = [
  'view',
  'zooms',
  'showIndoorMap',
  'indoorMap',
  'expandZoomRange',
  'showBuildingBlock',
  'viewMode',
  'pitchEnable',
  'buildingAnimation',
  'skyColor'
];

const CreateProps = NativeDynamicProps.concat(StatusDynamicProps, StaticProps);

// const reservedPropName = [
//   'amapkey',
//   'version',
//   'useAMapUI',
//   'onInstanceCreated',
//   'events',
//   'loading',
//   'plugins'
// ]

const defaultOpts = {
  MapType: {
    showRoad: false,
    showTraffic: false,
    defaultType: 0
  },
  ToolBar: {
    position: 'RB', // 控件停靠位置 LT:左上角;RT:右上角;LB:左下角;RB:右下角;默认位置：LT
    noIpLocate: true, // 定位失败后，是否开启IP定位，默认为false
    locate: true,// 是否显示定位按钮，默认为false
    liteStyle: true,// 是否使用精简模式，默认为false
    autoPosition: false, // 是否自动定位，即地图初始化加载完成后,是否自动定位的用户所在地,仅在支持HTML5的浏览器中有效，默认为false
    direction: true// 方向键盘是否可见，默认为true
  },
  OverView: {},
  ControlBar: {
    position: 'LT',
    showZoomBar: true,//是否显示缩放按钮。移动端默认为false，PC端为默认为true
    showControlButton: true // 是否显示倾斜、旋转按钮。移动端默认为false，PC端为默认为true
  }
};

// class BaseMap
class BaseMap extends PureComponent {
  static displayName = 'BaseMap';

  pluginMap;
  loader;
  map;
  mapWrapper;
  setterMap;
  converterMap;

  // 只暴露了自定义部分,其他prop沿用AMap的api
  static defaultProps = {
    key: '',
    useAMapUI: '',
    version: '',
    protocol: '',
    plugins: [],
    events: {},
    loading: {
      time: 0,
      render: () => null
    },
    status: {}
  }

  constructor(props) {
    super(props);

    this.state = {
      mapLoaded: false
    };
    const self = this;
    this.setterMap = {
      zoom(val) {
        self.map.setZoom(val);
      },
      cursor(val) {
        self.map.setDefaultCursor(val);
      },
      labelzIndex(val) {
        self.map.setlabelzIndex(val);
      }
    };
    this.converterMap = {
      center: toLnglat
    };
    if (typeof window !== 'undefined') {
      this.pluginMap = {};
      new APILoader({
        key: props.amapkey,
        useAMapUI: props.useAMapUI,
        version: props.version,
        protocol: props.protocol,
        loading: props.loading
      }).load().then(() => {
        this.createInstance();
        if (!this.state.mapLoaded) {
          this.setState({
            mapLoaded: true
          });
        }
      });
    }
  }

  get instance() {
    return this.map;
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.mapLoaded) {
      this.updateMapProps(this.props, nextProps);
    }
  }

  renderChildren() {
    return Children.map(this.props.children, (child) => {
      if (child) {
        const cType = child.type;
        /* 针对下面两种组件不注入地图相关属性
         * 1. 明确声明不需要注入的
         * 2. DOM 元素
         */
        if (cType.preventAmap || (typeof cType === 'string')) {
          return child;
        }
        return cloneElement(child, {
          __map__: this.map,
          __raxMap__: this
        });
      }
      return child;
    });
  }

  createInstance() {
    if (!this.map) {
      const options = this.buildCreateOptions();
      this.map = new window.AMap.Map(this.mapWrapper, options);
      // install map plugins
      this.setPlugins(this.props);
      this.props.onInstanceCreated && this.props.onInstanceCreated();
    }
  }

  buildCreateOptions() {
    const props = this.props;
    const options = {};
    CreateProps.forEach((key) => {
      if (key in props) {
        options[key] = this.getSetterValue(key, props);
      }
    });
    return options;
  }

  updateMapProps(prevProps, nextProps) {
    const nextMapStatus = {};
    let statusChangeFlag = false;
    let statusPropExist = false;
    StatusDynamicProps.forEach((key) => {
      if (key in nextProps) {
        statusPropExist = true;
        if (this.detectPropChanged(key, prevProps, nextProps)) {
          statusChangeFlag = true;
          nextMapStatus[key] = nextProps[key];
        }
      }
    });
    statusChangeFlag && this.map.setStatus(nextMapStatus);
    if (statusPropExist && 'status' in nextProps) {
      // log.warning(`以下这些属性可以单独提供进行配置，也可以统一作为‘status’属性配置；但是请不要同时使用这两种方式。\n（${StatusDynamicProps.join(', ')}）`);
    }
    StaticProps.forEach((key) => {
      if (key in nextProps) {
        if (this.detectPropChanged(key, prevProps, nextProps)) {
          // log.warning(`'${key}' 是一个静态属性，地图实例创建成功后无法修改`);
        }
      }
    });
    this.setPlugins(nextProps);
  }

  getSetterValue(key, props) {
    if (key in this.converterMap) {
      return this.converterMap[key](props[key]);
    }
    return props[key];
  }

  detectPropChanged(key, prevProps, nextProps) {
    return prevProps[key] !== nextProps[key];
  }

  setPlugins(props) {
    const pluginList = ['Scale', 'ToolBar', 'MapType', 'OverView', 'ControlBar'];
    if ('plugins' in props) {
      const plugins = props.plugins;
      if (plugins && plugins.length) {
        plugins.forEach((p) => {
          let name, config, visible;
          if (typeof p === 'string') {
            name = p;
            config = null;
            visible = true;
          } else {
            name = p.name;
            config = p.options || {};
            visible = (('visible' in config) && (typeof config.visible === 'boolean')) ? config.visible : true;
            delete config.visible;
          }
          const idx = pluginList.indexOf(name);
          if (idx === -1) {
            log.warning(`没有 ‘${name}’ 这个插件，请检查是否拼写错误`);
          } else {
            if (visible) {
              pluginList.splice(idx, 1);
              this.installPlugin(name, config);
            }
          }
        });
      }
    }
    this.removeOrDisablePlugins(pluginList);
  }

  removeOrDisablePlugins(plugins) {
    if (plugins && plugins.length) {
      plugins.forEach((p) => {
        if (p in this.pluginMap) {
          // ControlBar has no 'hide' method
          if (p === 'ControlBar') {
            this.map.removeControl(this.pluginMap[p]);
            delete this.pluginMap[p];
          } else {
            this.pluginMap[p].hide();
          }
        }
      });
    }
  }

  installPlugin(name, opts) {
    opts = opts || {};
    switch (name) {
      case 'Scale':
      case 'ToolBar':
      case 'OverView':
      case 'MapType':
        this.setMapPlugin(name, opts);
        break;
      case 'ControlBar':
        this.setControlBar(opts);
        break;
      default:
        // do nothing
    }
  }

  setMapPlugin(name, opts) {
    if (this.pluginMap[name]) {
      this.pluginMap[name].show();
    } else {
      const {onCreated, ...restOpts} = opts;
      const initOpts = {...defaultOpts[name], ...restOpts};
      this.map.plugin([`AMap.${name}`], () => {
        this.pluginMap[name] = new window.AMap[name](initOpts);
        this.map.addControl(this.pluginMap[name]);
        if (isFun(onCreated)) {
          onCreated(this.pluginMap[name]);
        }
      });
    }
  }

  setControlBar(opts) {
    if (this.pluginMap.ControlBar) {
      // do nothing
    } else {
      const {onCreated, ...restOpts} = opts;
      const initOpts = {...defaultOpts.ControlBar, ...restOpts};
      this.map.plugin(['AMap.ControlBar'], () => {
        this.pluginMap.ControlBar = new window.AMap.ControlBar(initOpts);
        this.map.addControl(this.pluginMap.ControlBar);
        if (isFun(onCreated)) {
          onCreated(this.pluginMap.ControlBar);
        }
      });
    }
  }

  render() {
    const {loading} = this.props;
    const loadingRender = (loading.render instanceof Function) ? loading.render : ()=>null
    return (
        <View ref={'mapContainer'} style={wrapperStyle}>
          <div ref={(div) => {
            this.mapWrapper = div;
          }} style={containerStyle}>
            {this.state.mapLoaded ? null : loadingRender() || null}
          </div>
          <div ref={'otherContainer'}>{this.state.mapLoaded ? this.renderChildren() : null}</div>
        </View>);
  }
}

export default wrapperGenerator(BaseMap);