---
title: Map插件
order: 2
---

amap中有一些[地图插件](https://lbs.amap.com/api/javascript-api/guide/abc/plugins)以插件的形式加载;

> 注意：由于是以移动应用为主,所以ToolBar插件默认开启了amap官方的liteStyle(精简模式),为true;

> 如果要继续沿用amap关于ToolBar的配置,请关闭精简模式。

```
const plugins = [
  {
  	name: 'ToolBar',
    options: {
        liteStyle: false,
        position: 'LT'
    }
  }
]
```

> plugins 插件配置较复杂,具体操作移步到高德amap [地图控件](http://lbs.amap.com/api/javascript-api/reference/map-control)

[JSFIDDLE 在线示例](https://jsfiddle.net/ioslh/mxc0h16p/8/)


```jsx
 import {Map} from 'rax-map';
 import View from 'rax-view';
 import {PureComponent, render} from 'rax';

class App extends PureComponent{
  render(){
    const plugins = [
      'MapType',
      'Scale',
      'OverView',
      //{
        //name:'ControlBar', // 必须和3Dmap配合使用
        //options:{
            //position:{top:'10px',right:'200px'}
        //}
     // },
      {
        name: 'ToolBar',
        options: {
          visible: true,  // 不设置该属性默认就是 true
          onCreated(ins){
            console.log(ins);
          },
        },
      }
    ]
    return <div style={{width: '100%', height: '100%'}}>
      <Map
        // viewMode="3D" // 必须和ControlBar配合使用
        plugins={plugins}
      />
    </div>
  }
}
render(
  <App/>,
  mountNode
)
```
