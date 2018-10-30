---
category: 辅助组件
order: 2
title: 定位当前位置组件
---


## 介绍
- 作用:定位组件是为了定位移动端当前位置,并在地图上显示定位。
- 有两种定位方式:
- 一种是启用高德的 `AMap.Geolocation` 插件,[参考地址](https://lbs.amap.com/api/javascript-api/reference/location#m_AMap.Geolocation)。
    + Geolocation 定位服务插件。融合了浏览器定位、高精度IP定位、安卓定位sdk辅助定位等多种手段，提供了获取当前准确位置、获取当前城市信息、持续定位(浏览器定位)等功能。
    + 用户可以通过两种当时获得定位的成败和结果，一种是在 getCurrentPosition的时候传入回调函数来处理定位结果，一种是通过事件监听来取得定位结果。
    + 注：默认情况下，PC 端优先使用精确 IP 定位，解决多数浏览器无法完成定位的现状，IP定位失败后使用浏览器定位；手机端优先使用浏览器定位，失败后使用IP定位；

```* 由于Chrome、IOS10等已不再支持非安全域的浏览器定位请求，为保证定位成功率和精度，请尽快升级您的站点到HTTPS。```

- 另一种是 `Rax-map` 自定义的定位组件。




## API


### 静态属性

| 属性       |  类型 | 默认取值 | 说明     |
|-----------|-----------|-------|-----|
| render  | `Function`  | /   | 底部 card 的渲染样式,回调方法 |
| arrowRender  | `Function` | / | 箭头的渲染样式,支持参数: 'left','right' |
| loop  | `Boolean` | true | card 是否支持轮播 |
| autoPlay  | `Boolean` | true | 是否支持自动播放 |
| animationEndHanler | `Function` | / | 底部 `card` 每次滑动效果结束触发的事件 |



