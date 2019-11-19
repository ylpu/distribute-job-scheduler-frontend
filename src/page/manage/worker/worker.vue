<template>
    <div class="main-login">
        <lyz-layout
                :pagination="pagination"
                :label="label"
                @handleSizeChange="handleSizeChange"
                @handleCurrentChange="handleCurrentChange">
            <div slot="banner" class="top-right">

                <el-select v-model="nodeGroup" placeholder="请选择执行组" class="right-select" @change="queryTypeChange"
                           clearable @clear="queryList">
                    <el-option label="hive" value="hive">hive</el-option>
                    <el-option label="spark" value="spark">spark</el-option>
                    <el-option label="shell" value="shell">shell</el-option>
                </el-select>

                <el-input placeholder="任务指执行机器" v-model="worker" class="input-with-select" clearable>
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
                </el-table>
            </div>

        </lyz-layout>
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
                nodeGroup: '',
                worker: '',
                pagination: {
                    pageIndex: 1,
                    pageSize: 10,
                    total: 0,
                },
                label: '资源管理',
                messageForm: {},
                messageVisible: false,
                messageLabelWidth: '90px',
                tableData: [],
                loginLoading: false,
                tableHeader: [
                    {
                        prop: 'id',
                        label: 'ID',
                        'min-width': 40,
                        align: 'center',
                    },
                    {
                        prop: 'host',
                        label: '执行机器',
                        'min-width': 80,
                        align: 'center',
                    },
                    {
                        prop: 'nodeGroup',
                        label: '执行机器组',
                        'min-width': 120,
                        align: 'center',
                    },
                    {
                        prop: 'cpuUsage',
                        label: 'cpu使用率',
                        'min-width': 100,
                        align: 'center',
                    },
                    {
                        prop: 'memoryUsage',
                        label: '内存使用率',
                        'min-width': 120,
                        align: 'center',
                    },
                    {
                        prop: 'lastHeartbeatTime',
                        label: '心跳时间',
                        'min-width': 120,
                        align: 'center',
                    },
                    {
                        prop: 'nodeStatus',
                        label: '节点状态',
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
            this.$watch('worker', debounce(() => {
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
                    nodeGroup: this.nodeGroup,
                    worker: this.worker,
                    pageNo: this.pagination.pageIndex,
                    pageSize: this.pagination.pageSize
                };
                this.$http.get('/worker/paging', {params: params}).then(({body}) => {
                    if (body.errorCode === 200) {
                        this.tableData = responseText(body.data.records);
                        this.pagination.total = body.data.records ? body.data.total : 0;
                    } else {
                        this.$message.error(body.errorMsg);
                    }
                }).finally(() => {
                    this.loginLoading = false;
                })
            }
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
