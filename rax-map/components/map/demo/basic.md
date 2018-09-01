---
title: 基本用法
order: 1
---

Map 的父组件必须具有宽度和高度；

[JSFIDDLE 在线示例](https://jsfiddle.net/ioslh/y9cv20cv/)

```jsx
     import {Map} from 'rax-map';
     import View from 'rax-view';
     import {createElement, Component, PureComponent, render, findComponentInstance} from 'rax';

     class App extends PureComponent{
       render(){
         return <div style={{width: '100%', height: '100%'}}>
           <Map amapkey={'788e08def03f95c670944fe2c78fa76f'}/>
         </div>
       }
     }

     render(<App />,mountNode)
```