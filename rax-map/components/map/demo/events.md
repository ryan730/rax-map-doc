---
title: 事件绑定
order: 2
---

可以通过`events`属性给地图绑定事件;
> [支持所有amap事件](https://lbs.amap.com/api/javascript-api/reference/map)

![Alt text](https://img.alicdn.com/tfs/TB1T0lOvz7nBKNjSZLeXXbxCFXa-880-881.jpg)

[JSFIDDLE 在线示例](https://jsfiddle.net/ioslh/mxc0h16p/6/)

```jsx
import {Map} from 'rax-map';
import View from 'rax-view';
import {PureComponent, render} from 'rax';
import Text from 'rax-text';


class App extends PureComponent{
  constructor(props) {
      super(props);
      this.state = {
          message:''
      }
   }
  changeText(txt){
    this.setState({
        message:txt
    })
  }
  render(){
    const events = {
      complete:() => {this.changeText('地图图块加载完成后触发事件!')},
      created: (map) => {this.changeText('获取到map')},
      click: () => {this.changeText('你点击了 Map')},
      mapmove: () => {this.changeText('你平移了 Map')},
      moveend: () => {this.changeText('你结束平移了 Map')}
    }
    return <View style={{width: '100%', height: '100%'}}>
        <View style={{width: '100%', height: '100%'}}>
            <Map events={events}/>
        </View>
        <Text style={{fontSize:8}}>{this.state.message}</Text>
    </View>
  }
}
render(
  <App/>,
  mountNode
)
```
