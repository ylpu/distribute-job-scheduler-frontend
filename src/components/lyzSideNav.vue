<template>
  <aside class="el-aside"  :class="{'close-side':collapse}">
    <div class="side-top">
      <span v-show="!collapse">thales任务调度</span>
    </div>
    <div class="side-bottom">
      <el-menu :default-active="$route.path"
               :router="true"
               @select="handleSelect"
               background-color="#545c64"
               text-color="#fff"
               active-text-color="#ffd04b"
               :collapse="collapse"
               collapse-transition>
        <el-menu-item v-for="(item,index) in routerList" :key="index" :index="item.path+''">
          <i :class="item.icon"></i>
          <span>{{item.name}}</span>
        </el-menu-item>
      </el-menu>
    </div>


  </aside>
</template>

<script>
  import {mapState} from 'vuex';

  export default {
    name: "lyzSideNav",
    data(){
      return {
       routerList:[],
      }
    },
    beforeCreate() {
      this.$http.get('/user/current-user',{}).then(({body}) => {
        console.log(body);
        if (body.errorCode === 200 &&  body.data != null) {
            this.getLeftMenus(body.data.roleNames);
        } else {
          window.location.href = '/login.html';
        }
      });
    },

    computed:mapState(['collapse']),
    methods:{
      getLeftMenus(roleNames){
            let menuList = [];
            if(roleNames.indexOf("ROLE_ADMIN") >= 0){
              menuList = [
                {'path':'/chart', 'name':'任务分布','icon':'el-icon-picture'},
                {'path':'/job', 'name':'任务管理','icon':'el-icon-menu'},
                {'path':'/jobInstance', 'name':'任务实例管理','icon':'el-icon-menu'},
                {'path':'/groupStrategy', 'name':'执行组管理','icon':'el-icon-menu'},
                {'path':'/worker', 'name':'节点管理','icon':'el-icon-info'},
                {'path':'/connection', 'name':'连接管理','icon':'el-icon-menu'},
                {'path':'/user', 'name':'用户管理','icon':'el-icon-menu'},
                {'path':'/role', 'name':'角色管理','icon':'el-icon-menu'}
              ];
            }else{
              menuList = [
                {'path':'/chart', 'name':'任务分布','icon':'el-icon-picture'},
                {'path':'/job', 'name':'任务管理','icon':'el-icon-menu'},
                {'path':'/jobInstance', 'name':'任务实例管理','icon':'el-icon-menu'},
              ];
            }
            console.log(menuList);
            this.routerList = menuList;
            this.$store.commit('setRouteList',this.routerList );
      },
      handleSelect(){

      },
    }
  }
</script>

<style scoped lang="scss">
  .el-aside{
    display:flex;
    flex-direction: column;
    &.close-side{
      .side-top{
        width:65px;
        transition: width linear .3s;
      }
      .side-bottom{
        .el-menu--collapse{
          width:65px;
          /*transition: width linear .4s;*/
        }
      }

    }
    .side-top{
      width:210px;
      height:60px;
      background:#1a6a98;
      text-align: center;
      line-height: 60px;
      color: white;
      font-size: 18px;
      /*transition: width linear .1s;*/
    }
    .side-bottom{
      flex:1;
      .el-menu{
        height:100%;
        border:0;
      }
    }

  }
</style>
