import Vue from 'vue';
import {router} from './router';
import store from './store';
import App from './App';
import Vue2OrgTree from 'vue2-org-tree';

// 引入和使用elementUI
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import VueResource from 'vue-resource';
import './config/http'
Vue.use(ElementUI);
Vue.use(Vue2OrgTree);

// 路由判断登录 根据路由配置文件的参数
// router.beforeEach((to, from, next) => {
//   if (to.matched.some(record => record.meta.requireAuth)){ // 判断该路由是否需要登录权限
//     console.log('需要登录');
//     if (localStorage.username) { // 判断当前的token是否存在 ； 登录存入的token
//       next();
//     }
//     else {
//       window.location.href = '/login.html';
//       // next({
//       //   path: '/login.html',
//       //   // query: {redirect: to.fullPath} // 将跳转的路由path作为参数，登录成功后跳转到该路由
//       // })
//     }
//   }
//   else {
//     next();
//   }
// });

router.beforeEach((to, from, next) => {
  if (sessionStorage.username) { //如果有就直接到首页咯
    next();
  } else {
    if (to.path == '/login.html') { //如果是登录页面路径，就直接next()
      next();
    } else { //不然就跳转到登录；
      window.location.href = '/login.html';
    }

  }
})

Vue.use(VueResource);
  new Vue({
    el: '#app',
    router,
    store,
    template:'<App/>',
    components:{ App },
  })



