---
title: 基本用法2
order: 2
---

本例演示了如何创建一个折线以及动态改变折线的属性

```jsx 
import {Map,Markers,Polyline} from 'rax-map';
import {detailSwiper as DetailSwiper} from 'rax-map';
import {PureComponent, render} from 'rax';
import View from 'rax-view';
import Touchable from 'rax-touchable'; //  导入touch 容器

// touch容器样式
 const touchStyle = {
      borderStyle: 'solid',
      borderColor: '#dddddd',
      borderWidth: 1,
      padding:2,
      margin:5,
      width:60,
      height:20,
      backgroundColor:'#FFF',
      justifyContent:'center',
      alignItems:'center',
      fontSize:5,
      textAlign: 'center',
      boxShadow: '5px 5px 5px #888888'
  }

  const rowStyle = {
    position:'absolute',
    flexDirection:'column',
    justifyContent:'space-between',
    right:-80,
    top:-20
  }

const alphabet = 'ABCDEFGHIJKLMNOP'.split('');
const randomMarker = (len) => (
  Array(len).fill(true).map((e, idx) => ({
    position: {
      longitude: 100 + Math.random() * 30,
      latitude: 30 + Math.random() * 20,
    },
    myLabel: '标的名称:'+alphabet[idx],
    myIndex: idx + 1,
  }))
);

const style = {
  padding: '8px',
  backgroundColor: '#000',
  color: '#fff',
  border: '1px solid #fff',
};

const mouseoverStyle = {
  padding: '8px',
  backgroundColor: '#fff',
  color: '#000',
  border: '1px solid #000',
}

class App extends PureComponent{
  constructor(){
    super();
    this.markers = randomMarker(10);
    this.mapCenter = {longitude: 115, latitude: 40};
    this.state = {
      useCluster: false,
    };
    this.mapEvents = {
      complete:() => {
          console.log('地图图块加载完成后触发事件!');
          this.randomMarkers();
      },
      created:() => {
        console.log('markers 加载完成后触发事件!');
      }
    }
    this.markerEvents = {
      click:(e)=>{
        console.log('markers click事件!',e,e.target.getPosition());
        const marker = e.target;
        marker.getMap().setCenter(marker.getPosition());
      }
    }
  }

  randomMarkers() {
      this.setState({
        markers: randomMarker(10)
      })
  }

  renderMarkerLayout(extData){
      return <View style={style}>{extData.myLabel}</View>
  }

  render(){
    console.log('map->render');
    return <View style={{width: '100%', height: '100%'}}>
      <View style={{width: '100%', height: '100%'}}>
        <Map plugins={['ToolBar']} center={this.mapCenter} zoom={4} events={this.mapEvents}>
          <DetailSwiper animationEndHanler={(e)=>{
             console.log('swiper结束:',e)
          }}/>
          <Markers
            events={this.markerEvents}
            markers={this.markers}
            render={this.renderMarkerLayout}
          />
        </Map>
      </View>
      <View style={rowStyle}>
        <Touchable style={touchStyle} onPress={this.randomMarkers.bind(this)}>
              点击:刷新多个 Markers
        </Touchable>
      </View>
    </View>
  }
}

render(<App/>, mountNode);
```