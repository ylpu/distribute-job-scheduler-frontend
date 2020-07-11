<template>
    <div class="main-login">
        <lyz-layout
                :pagination="pagination"
                :label="label"
                @handleSizeChange="handleSizeChange"
                @handleCurrentChange="handleCurrentChange">
            <div slot="banner" class="top-right">
                <el-button type="primary" size="small" @click="createGroup" slot="reference">新增</el-button> &nbsp;
                <el-input placeholder="执行组名称" v-model="groupName" class="input-with-select" clearable>
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
                                       @click="updateGroup(scope.row)">修改
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>

        </lyz-layout>
        <el-dialog :title="operate==='update'?'修改执行组':'添加执行组'" :visible.sync="messageVisible" width="50%" center
                   class="user-dialog" @close='closeFormDialog'>
            <el-form :model="messageForm" :label-width="messageLabelWidth" ref="messageForm" :rules="messageRule"
                     :validate-on-rule-change=false>
                <el-row gutter="100" justify="start">
                        <el-col span="50">
                            <el-form-item label="执行组名称"  prop="groupName">
                                <el-input v-model="messageForm.groupName" placeholder="请输入执行组名称"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col span="50">
                            <el-form-item label="执行组策略"  prop="groupStrategy">
                                <el-select v-model="messageForm.groupStrategy" placeholder="请选择执行组策略">
                                    <el-option label="MEMORY" value="MEMORY">MEMORY</el-option>
                                    <el-option label="CPU" value="CPU">CPU</el-option>
                                    <el-option label="TASK" value="TASK">TASK</el-option>
                                    <el-option label="RANDOM" value="RANDOM">RANDOM</el-option>
                                    <el-option label="ROBIN" value="ROBIN">ROBIN</el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                    </el-row>

            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click=closeFormDialog>取 消</el-button>
                <el-button type="primary" @click=saveGroup>确 定</el-button>
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
                groupName: '',
                pagination: {
                    pageIndex: 1,
                    pageSize: 10,
                    total: 0,
                },
                label: '执行组管理',
                messageForm: {},
                messageVisible: false,
                messageLabelWidth: '120px',
                tableData: [],
                loginLoading: false,
                operate: '',
                messageRule: {
                    groupName: [
                        {required: true, message: '请输入执行组名称', trigger: 'blur'}
                    ],
                    groupStrategy: [
                        {required: true, message: '请输入执行组策略', trigger: 'blur'}
                    ]
                },
                tableHeader: [
                    {
                        prop: 'groupName',
                        label: '执行组名称',
                        'min-width': 80,
                        align: 'center',
                    },
                    {
                        prop: 'groupStrategy',
                        label: '执行组策略',
                        'min-width': 120,
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
            this.$watch('groupName', debounce(() => {
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
                    groupName: this.groupName,
                    pageNo: this.pagination.pageIndex,
                    pageSize: this.pagination.pageSize
                };
                this.$http.get('/groupStrategy/paging', {params: params}).then(({body}) => {
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
            updateGroup(row) {
                console.log(row);
                this.messageVisible = true;
                this.operate = 'update';
                let _form = Object.assign({}, row);
                this.messageForm = _form;
            },
            createGroup(row) {
                console.log(row);
                this.messageVisible = true;
                this.operate = 'create';
                let _form = Object.assign({}, row);
                this.messageForm = _form;
            },
            saveGroup() {
                console.log('save');
                let params = {
                    groupName: this.messageForm.groupName,
                    groupStrategy: this.messageForm.groupStrategy
                };
                this.$refs['messageForm'].validate((valid) => {
                    if (valid) {
                        if (this.messageForm.id) {
                            params.id = this.messageForm.id;
                            this.save('/groupStrategy/updateGroupStrategy', params, 'messageVisible');
                        } else {
                            this.save('/groupStrategy/addGroupStrategy', params, 'messageVisible');
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
