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
//import styles from './index.css';

const styles = {
  circleContainer: {
    position: 'absolute',
    bottom: 40/3,
    left: 20/3,
    backgroundColor: '#FFFFFF',
    height: 41/3,
    width: 41/3,
    borderRadius: 41/3,
    boxShadow: 'rgba(106,106,106,10) 0px 1px 2px',
    lineHeight: 41/3,
    color: '#000000',
    fontSize: 13/3,
    textAlign: 'center',
    justifyContent: 'center',
    alignItems:'center',
  },
  icon: {
    width: 56/3,
    height: 56/3,
  }
}

/* global AMap */
const CurrentLocation = (props) => {
  const map = props.__map__;
  //const mapStore = props.mapStore.state || {center: null, zoom: null};
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