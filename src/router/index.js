import Vue from 'vue'
import Router from 'vue-router';
import job from '@/page/manage/job/job'
import jobInstance from '@/page/manage/jobInstance/jobInstance'
import worker from '@/page/manage/worker/worker'
import chart from '@/page/manage/chart/chart'

Vue.use(Router);
const routerConfig = [
    {
        path: '/',
        redirect: '/job',

    },
    {
        path: '/chart',
        name: '任务分布',
        icon: 'el-icon-menu',
        component: chart,
        meta: {
            requireAuth: true, // 判断是否需要登录
        },
    },
    {
        path: '/job',
        name: '任务管理',
        icon: 'el-icon-menu',
        component: job,
        meta: {
            requireAuth: true, // 判断是否需要登录
        },
    },
    {
        path: '/jobInstance',
        name: '任务实例管理',
        icon: 'el-icon-menu',
        component: jobInstance,
        meta: {
            requireAuth: true, // 判断是否需要登录
        },
    },
    {
        path: '/worker',
        name: '资源管理',
        icon: 'el-icon-menu',
        component: worker,
        meta: {
            requireAuth: true, // 判断是否需要登录
        },
    },
]
const router = new Router({
    mode: 'history',
    routes: routerConfig
})
export {routerConfig, router}
//export的语法，可以先定义变量，然后再export {要导出的变量}
//第二种方法： exports.变量名 = ......
