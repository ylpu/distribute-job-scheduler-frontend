import Vue from 'vue'
import Router from 'vue-router';
import job from '@/page/manage/job/job'
import jobInstance from '@/page/manage/jobInstance/jobInstance'
import worker from '@/page/manage/worker/worker'
import groupStrategy from '@/page/manage/worker/groupStrategy'
import chart from '@/page/manage/chart/chart'
import connection from '@/page/manage/connection/connection'
import user from '@/page/manage/user/user'
import role from '@/page/manage/role/role'

Vue.use(Router);
const routerConfig = [
    {
        path: '/',
        redirect: '/chart',

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
        path: '/groupStrategy',
        name: '执行组管理',
        icon: 'el-icon-menu',
        component: groupStrategy,
        meta: {
            requireAuth: true, // 判断是否需要登录
        },
    },
    {
        path: '/worker',
        name: '执行器管理',
        icon: 'el-icon-menu',
        component: worker,
        meta: {
            requireAuth: true, // 判断是否需要登录
        },
    },
    {
        path: '/connection',
        name: '连接管理',
        icon: 'el-icon-menu',
        component: connection,
        meta: {
            requireAuth: true, // 判断是否需要登录
        },
    },
    {
        path: '/user',
        name: '用户管理',
        icon: 'el-icon-menu',
        component: user,
        meta: {
            requireAuth: true, // 判断是否需要登录
        },
    },
    {
        path: '/role',
        name: '角色管理',
        icon: 'el-icon-menu',
        component: role,
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
