<template>
    <div class="main-login">
        <lyz-layout
                :pagination="pagination"
                :label="label"
                @handleSizeChange="handleSizeChange"
                @handleCurrentChange="handleCurrentChange">
            <div slot="banner" class="top-right">
                <el-button type="primary" size="small" @click="createRole" slot="reference">创建</el-button> &nbsp;
                <el-input placeholder="角色名" v-model="roleName" class="input-with-select" clearable>
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
                                       @click="updateRole(scope.row)">修改
                            </el-button>
                            <el-button type="text" size="mini"
                                       @click="deleteRole(scope.row)">删除
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>

        </lyz-layout>
        <el-dialog :title="operate==='update'?'修改角色':'添加角色'" :visible.sync="messageVisible" width="35%" center
                   class="user-dialog" @close='closeFormDialog'>
            <el-form :model="messageForm" :label-width="messageLabelWidth" ref="messageForm" :rules="messageRule"
                     :validate-on-rule-change=false>
                <el-row gutter="80" justify="start">
                    <el-col span="20">
                        <el-form-item label="角色名"  prop="roleName">
                            <el-input v-model="messageForm.roleName" placeholder="请输入角色名" style="width:360px"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click=closeFormDialog>取 消</el-button>
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
                roleName: '',
                pagination: {
                    pageIndex: 1,
                    pageSize: 10,
                    total: 0,
                },
                label: '角色管理',
                messageForm: {},
                messageVisible: false,
                messageLabelWidth: '90px',
                tableData: [],
                loginLoading: false,
                operate: '',
                messageRule: {
                    roleName: [
                        {required: true, roleName: '请输入角色名', trigger: 'blur'}
                    ]
                },
                tableHeader: [
                    {
                        prop: 'roleName',
                        label: '角色名',
                        'min-width': 80,
                        align: 'center',
                    }
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
            this.$watch('roleName', debounce(() => {
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
                    roleName: this.roleName,
                    pageNo: this.pagination.pageIndex,
                    pageSize: this.pagination.pageSize
                };
                this.$http.get('/role/paging', {params: params}).then(({body}) => {
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
            updateRole(row) {
                console.log(row);
                this.messageVisible = true;
                this.operate = 'update';
                let _form = Object.assign({}, row);
                this.messageForm = _form;
            },
            createRole(row) {
                console.log(row);
                this.messageVisible = true;
                this.operate = 'create';
                let _form = Object.assign({}, row);
                this.messageForm = _form;
            },
            deleteRole(row) {
                let params = {
                    id: row.id,
                };
                this.delete('/role/deleteRole',params);
            },
            saveRole() {
                console.log('save');
                let params = {
                    roleName: this.messageForm.roleName
                };
                this.$refs['messageForm'].validate((valid) => {
                    if (valid) {
                        if (this.messageForm.id) {
                            params.id = this.messageForm.id;
                            this.save('/role/updateRole', params, 'messageVisible');
                        } else {
                            this.save('/role/addRole', params, 'messageVisible');
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
