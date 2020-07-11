<template>
    <div class="main-login">
        <lyz-layout
                :pagination="pagination"
                :label="label"
                @handleSizeChange="handleSizeChange"
                @handleCurrentChange="handleCurrentChange">
            <div slot="banner" class="top-right">
                <el-button type="primary" size="small" @click="createUser" slot="reference">创建</el-button> &nbsp;
                <el-input placeholder="用户名" v-model="userName" class="input-with-select" clearable>
                    <el-button slot="append" icon="el-icon-search" @click="queryList"></el-button>
                </el-input>

            </div>
            <div slot="main" class="main-body">
                <el-table
                        :data="tableData"
                        stripe
                        v-loading="loginLoading"
                        tooltip-effect="light"
                        height="100%"
                        style="width: 100%"
                >
                    <el-table-column
                            v-for="(data,index) in tableHeader"
                            :show-overflow-tooltip="true"
                            :key="index"
                            :prop="data.prop"
                            :label="data.label"
                            :min-width="data['min-width']"
                            :align="data.align">
                    </el-table-column>
                    <el-table-column
                            fixed="right"
                            label="操作"
                            min-width="100">

                        <template slot-scope="scope">
                            <el-button type="text" size="mini"
                                       @click="updateUser(scope.row)">修改
                            </el-button>
                            <el-button type="text" size="mini"
                                       @click="setRole(scope.row)">设置角色
                            </el-button>
                            <el-button type="text" size="mini"
                                       @click="deleteUser(scope.row)">删除
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>

        </lyz-layout>
        <el-dialog :title="operate==='update'?'修改用户':'添加用户'" :visible.sync="messageVisible" width="60%" center
                   class="user-dialog" @close='closeFormDialog'>
            <el-form :model="messageForm" :label-width="messageLabelWidth" ref="messageForm" :rules="messageRule"
                     :validate-on-rule-change=false>
                <el-row gutter="80" justify="start">
                    <el-col span="12">
                        <el-form-item label="用户名"  prop="userName">
                            <el-input v-model="messageForm.userName" placeholder="请输入用户名"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col span="12">
                        <el-form-item label="邮箱地址"  prop="email">
                            <el-input v-model="messageForm.email" placeholder="请输入邮箱"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row gutter="80" justify="start">
                    <el-col span="12">
                        <el-form-item label="密码"  prop="password">
                            <el-input v-model="messageForm.password" placeholder="请输入密码" type="password"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col span="12">
                        <el-form-item label="确认密码"  prop="confirmPass">
                            <el-input v-model="messageForm.confirmPass" placeholder="请输入确认密码" type="password"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click=closeFormDialog>取 消</el-button>
                <el-button type="primary" @click=saveUser>确 定</el-button>
            </div>
        </el-dialog>
        <el-dialog :title="'设置权限'" :visible.sync="roleVisible" width="35%" center
                   class="user-dialog" @close='closeRoleDialog'>

            <el-form :model="roleForm" :label-width="messageLabelWidth" ref="roleForm" :rules="roleRule"
                     :validate-on-rule-change=false>
                <el-row gutter="80" justify="start">
                    <el-col span="24">
                        <el-form-item label="用户角色"  prop="roleIds">
                            <el-select v-model="roleForm.roleIds" placeholder="权限" class="right-select" multiple style="width:360px">
                                <el-option
                                        v-for="item in roleOption"
                                        :key="item.id"
                                        :label="item.roleName"
                                        :value="item.id">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>

            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click=closeRoleDialog>取 消</el-button>
                <el-button type="primary" @click=saveRole>确 定</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    import lyzLayout from '@/components/lyzLayout';
    import manage from '../manage.component';
    import {formatDateTime, responseText, debounce} from '../../../config/utils.js';

    export default {
        name: "server",
        data() {
            return {
                userName: '',
                pagination: {
                    pageIndex: 1,
                    pageSize: 10,
                    total: 0,
                },
                label: '用户管理',
                roleForm: {},
                messageForm: {},
                messageVisible: false,
                messageLabelWidth: '90px',
                tableData: [],
                roleOption:[],
                roleVisible: false,
                loginLoading: false,
                operate: '',
                messageRule: {
                    userName: [
                        {required: true, userName: '请输入连接名称', trigger: 'blur'}
                    ],
                    password: [
                        {required: true, password: '请输入连接类型', trigger: 'blur'}
                    ],
                    confirmPass: [
                        {required: true, confirmPass: '请输入主机名', trigger: 'blur'}
                    ],
                    email: [
                        {required: true, message: '请输入邮箱', trigger: 'blur'}
                    ]
                },
                roleRule: {
                    roleIds: [
                        {required: true, roleIds: '请输入角色', trigger: 'blur'}
                    ]
                },
                tableHeader: [
                    {
                        prop: 'userName',
                        label: '用户名',
                        'min-width': 80,
                        align: 'center',
                    },
                    {
                        prop: 'email',
                        label: '邮箱',
                        'min-width': 120,
                        align: 'center',
                    },
                    {
                        prop: 'roleNames',
                        label: '用户角色',
                        'min-width': 120,
                        align: 'center',
                    },
                ]
            };
        },
        components: {
            lyzLayout,
        },
        mixins: [manage],
        created() {
            this.queryList();
        },
        mounted() {
            this.$watch('userName', debounce(() => {
                this.pagination.pageIndex = 1;
                this.queryList();
            }, 1000));
        },
        methods: {
            queryTypeChange(val) {
                if (val !== '') {
                    this.taskState = val;
                    this.queryList();
                }
            },
            queryList() {
                this.loginLoading = true;
                let params = {
                    userName: this.userName,
                    pageNo: this.pagination.pageIndex,
                    pageSize: this.pagination.pageSize
                };
                this.$http.get('/user/paging', {params: params}).then(({body}) => {
                    if (body.errorCode === 200) {
                        this.tableData = responseText(body.data.list);
                        this.pagination.total = body.data.list ? body.data.total : 0;
                    } else {
                        this.$message.error(body.errorMsg);
                    }
                }).finally(() => {
                    this.loginLoading = false;
                })
            },
            closeFormDialog() {
                this.messageVisible = false;
                this.$refs['messageForm'].resetFields();
            },
            closeRoleDialog() {
                this.roleVisible = false;
                this.roleOption = [];
            },
            updateUser(row) {
                console.log(row);
                this.messageVisible = true;
                this.operate = 'update';
                let _form = Object.assign({}, row);
                this.messageForm = _form;
            },
            setRole(row) {
                console.log(row);
                this.roleVisible = true;
                let _form = Object.assign({}, row);
                this.roleForm = _form;
                this.initRoleDialog();
            },
            saveRole() {
                let params = {
                    id: this.roleForm.id,
                    roleIds: this.roleForm.roleIds
                };
                this.save('/user/setRoles', params, 'roleVisible');
            },
            createUser(row) {
                console.log(row);
                this.messageVisible = true;
                this.operate = 'create';
                let _form = Object.assign({}, row);
                this.messageForm = _form;
            },
            deleteUser(row) {
                let params = {
                    id: row.id,
                };
                this.delete('/user/deleteUser',params);
            },
            saveUser() {
                console.log('save');
                let params = {
                    userName: this.messageForm.userName,
                    password: this.messageForm.password,
                    confirmPass: this.messageForm.confirmPass,
                    email: this.messageForm.email
                };
                this.$refs['messageForm'].validate((valid) => {
                    if (valid) {
                        if (this.messageForm.id) {
                            params.id = this.messageForm.id;
                            this.save('/user/updateUser', params, 'messageVisible');
                        } else {
                            this.save('/user/addUser', params, 'messageVisible');
                        }
                    }
                })
            },
            initRoleDialog(){
                this.$http.get('/role/findAllRole').then(({body}) => {
                    if (body.errorCode === 200) {
                        body.data.forEach(element => {
                            this.roleOption.push(element);
                        })
                    }
                }).finally(() => {
                    this.loginLoading = false;
                });
            },
        }
    }
</script>

<style scoped>
    .main-login {
        height: 100%;
    }

    .danger-text {
        color: #F56C6C;
    }

</style>
