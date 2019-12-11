<template>
    <div class="main-login">
        <lyz-layout
                :pagination="pagination"
                :label="label"
                @handleSizeChange="handleSizeChange"
                @handleCurrentChange="handleCurrentChange">
            <div slot="banner" class="top-right">
                <el-button type="primary" size="small" @click="createConnection" slot="reference">新增</el-button> &nbsp;
                <el-input placeholder="连接名称" v-model="connectionId" class="input-with-select" clearable>
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
                                       @click="updateConnection(scope.row)">修改
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>

        </lyz-layout>
        <el-dialog :title="operate==='update'?'修改连接':'添加连接'" :visible.sync="messageVisible" width="60%" center
                   class="user-dialog" @close='closeFormDialog'>
            <el-form :model="messageForm" :label-width="messageLabelWidth" ref="messageForm" :rules="messageRule"
                     :validate-on-rule-change=false>
                <el-row gutter="80" justify="start">
                    <el-col span="20">
                        <el-form-item label="连接名称"  prop="connectionId">
                            <el-input v-model="messageForm.connectionId" placeholder="请输入任务名称"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row gutter="80" justify="start">
                    <el-col span="10">
                        <el-form-item label="连接类型"  prop="connectionType">
                            <el-select v-model="messageForm.connectionType" placeholder="请选择连接类型">
                                <el-option label="MYSQL" value="MYSQL">MYSQL</el-option>
                                <el-option label="ORACLE" value="ORACLE">ORACLE</el-option>
                                <el-option label="SQLSERVER" value="SQLSERVER">SQLSERVER</el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col span="10">
                        <el-form-item label="主机名称"  prop="hostname">
                            <el-input v-model="messageForm.hostname" placeholder="主机名称"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row gutter="80" justify="start">
                    <el-col span="10">
                        <el-form-item label="端口号"  prop="port">
                            <el-input v-model="messageForm.port" placeholder="端口号"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col span="10">
                        <el-form-item label="数据库"  prop="dbSchema">
                            <el-input v-model="messageForm.dbSchema" placeholder="数据库"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row gutter="80" justify="start">
                    <el-col span="10">
                        <el-form-item label="用户名"  prop="username">
                            <el-input v-model="messageForm.username" placeholder="用户名"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col span="10">
                        <el-form-item label="密码"  prop="password">
                            <el-input v-model="messageForm.password" placeholder="密码" type="password"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>

            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click=closeFormDialog>取 消</el-button>
                <el-button type="primary" @click=saveConnection>确 定</el-button>
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
                connectionId: '',
                pagination: {
                    pageIndex: 1,
                    pageSize: 10,
                    total: 0,
                },
                label: '连接管理',
                messageForm: {},
                messageVisible: false,
                messageLabelWidth: '90px',
                tableData: [],
                loginLoading: false,
                operate: '',
                messageRule: {
                    connectionId: [
                        {required: true, message: '请输入连接名称', trigger: 'blur'}
                    ],
                    connectionType: [
                        {required: true, message: '请输入连接类型', trigger: 'blur'}
                    ],
                    hostname: [
                        {required: true, message: '请输入主机名', trigger: 'blur'}
                    ],
                    dbSchema: [
                        {required: true, message: '请输入数据库', trigger: 'blur'}
                    ],
                    port: [
                        {required: true, message: '请输入端口', trigger: 'blur'}
                    ],
                    username: [
                        {required: true, message: '请输入用户名', trigger: 'blur'}
                    ]
                },
                tableHeader: [
                    {
                        prop: 'connectionId',
                        label: '连接名称',
                        'min-width': 80,
                        align: 'center',
                    },
                    {
                        prop: 'connectionType',
                        label: '连接类型',
                        'min-width': 120,
                        align: 'center',
                    },
                    {
                        prop: 'hostname',
                        label: '主机名称',
                        'min-width': 100,
                        align: 'center',
                    },
                    {
                        prop: 'port',
                        label: '端口',
                        'min-width': 120,
                        align: 'center',
                    },
                    {
                        prop: 'dbSchema',
                        label: '数据库',
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
            this.$watch('connectionId', debounce(() => {
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
                    connectionId: this.connectionId,
                    pageNo: this.pagination.pageIndex,
                    pageSize: this.pagination.pageSize
                };
                this.$http.get('/connection/paging', {params: params}).then(({body}) => {
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
            updateConnection(row) {
                console.log(row);
                this.messageVisible = true;
                this.operate = 'update';
                let _form = Object.assign({}, row);
                this.messageForm = _form;
            },
            createConnection(row) {
                console.log(row);
                this.messageVisible = true;
                this.operate = 'create';
                let _form = Object.assign({}, row);
                this.messageForm = _form;
            },
            saveConnection() {
                console.log('save');
                let params = {
                    connectionId: this.messageForm.connectionId,
                    connectionType: this.messageForm.connectionType,
                    hostname: this.messageForm.hostname,
                    dbSchema: this.messageForm.dbSchema,
                    port: this.messageForm.port,
                    username: this.messageForm.username,
                    password: this.messageForm.password
                };
                this.$refs['messageForm'].validate((valid) => {
                    if (valid) {
                        if (this.messageForm.id) {
                            params.id = this.messageForm.id;
                            this.save('/connection/updateConnection', params, 'messageVisible');
                        } else {
                            this.save('/connection/addConnection', params, 'messageVisible');
                        }
                    }
                })
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
