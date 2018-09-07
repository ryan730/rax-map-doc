---
title: 事件绑定
order: 3
---

可以通过`events`属性给地图绑定事件;
> [支持所有amap事件](https://lbs.amap.com/api/javascript-api/reference/map)

![Alt text](https://img.alicdn.com/tfs/TB1T0lOvz7nBKNjSZLeXXbxCFXa-880-881.jpg)

[JSFIDDLE 在线示例](https://jsfiddle.net/ioslh/mxc0h16p/6/)

```jsx
import {Map} from 'rax-map';
import View from 'rax-view';
import {PureComponent, render} from 'rax';

class App extends PureComponent{
  render(){
    const events = {
      complete:() => {alert('地图图块加载完成后触发事件!')},
      created: (map) => {alert('获取到map')},
      click: () => {alert('你点击了 Map')},
      moveend: () => {alert('你结束平移了 Map')}
    }
    return <View style={{width: '100%', height: '100%'}}>
      <Map events={events}/>
    </View>
  }
}
render(
  <App/>,
  mountNode
)
```
