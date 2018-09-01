/**
 * Created with WebStorm.
 * User: 一晟
 * Date: 2018/5/8
 * Time: 下午5:28
 * email: zhu.yan@alibaba-inc.com
 * To change this template use File | Settings | File Templates.
 */
import {
  createElement,
  Component,
  Children,
  PureComponent,
  findDOMNode,
  cloneElement,
  unmountComponentAtNode
} from 'rax';
import View from 'rax-view';
import Picture from 'rax-picture';
import styles from './index.css';

/* global AMap */
const CurrentLocation = (props) => {
  const map = props.__map__;
  const mapStore = props.mapStore.state || {center: null, zoom: null};
  if (!map) {
    console.log('组件必须作为 Map 的子组件使用');
    return;
  }
  return (<View style={styles.circleContainer} onClick={
    () => {
      AMap.event.trigger(map, 'customEvents', {type: 'CurrentLocation'});// 自定义的方法
    }
  }>
    <Picture source={{uri: '//gw.alicdn.com/tfs/TB1yPNpG25TBuNjSspmXXaDRVXa-135-138.png'}} style={styles.icon}
      resizeMode={'cover'} />
  </View>);
};

export default CurrentLocation;