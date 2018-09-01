'use strict';

module.exports = {
  lazyLoad: false,
  home: '/',
  routes: [{
    path: '/',
    //component: './template/Redirect'
    component: './template/Cover'
  }, {
    path: '/rax-map/components/:doc',
    component: './template/Components',
    // indexRoute: { component: './template/Articles' },
    childRoutes: [{
      path: ':children',
      component: './template/ComponentNodes',
    }]
  }, {
    path: '/articles/:doc',
    component: './template/Articles'
  }, {
    path: '/404',
    component: './template/NotFound'
  }
  ]
};
