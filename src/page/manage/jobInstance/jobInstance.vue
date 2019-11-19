<template>
    <div class="main-login">
        <lyz-layout
                :pagination="pagination"
                :label="label"
                @handleSizeChange="handleSizeChange"
                @handleCurrentChange="handleCurrentChange">
            <div slot="banner" class="top-right">

                <el-select v-model="taskState" placeholder="请选择任务状态" class="right-select" @change="queryTypeChange"
                           clearable @clear="queryList">
                    <el-option label="SUBMIT" value="1">SUBMIT</el-option>
                    <el-option label="PENDING" value="2">PENDING</el-option>
                    <el-option label="WAITING" value="3">WAITING</el-option>
                    <el-option label="RUNNING" value="4">RUNNING</el-option>
                    <el-option label="KILL" value="5">KILL</el-option>
                    <el-option label="SUCCESS" value="6">SUCCESS</el-option>
                    <el-option label="FAIL" value="7">FAIL</el-option>
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
                        @selection-change="handleSelectionChange">
                    <el-table-column type="selection" width="55"></el-table-column>
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
                            min-width="150">
                        <template slot-scope="scope">

                            <el-button type="text" size="mini"
                                       @click="kill(scope.row.id)">杀任务
                            </el-button>
                            <el-button type="text" size="mini"
                                       @click="rerun(scope.row.id)">重跑
                            </el-button>
                            <el-button type="text" size="mini"
                                       @click="rerunAll(scope.row.id)">重跑所有
                            </el-button>
                            <el-button type="text" size="mini"
                                       @click="viewLog(scope.row.logUrl)">日志
                            </el-button>
                        </template>
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
                taskState: '',
                worker: '',
                pagination: {
                    pageIndex: 1,
                    pageSize: 10,
                    total: 0,
                },
                label: '任务实例管理',
                messageForm: {},
                messageVisible: false,
                messageLabelWidth: '90px',
                multipleSelection: [],//多选的数据
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
                        prop: 'taskState',
                        label: '任务状态',
                        'min-width': 80,
                        align: 'center',
                    },
                    {
                        prop: 'scheduleTime',
                        label: '任务调度时间',
                        'min-width': 120,
                        align: 'center',
                    },
                    {
                        prop: 'startTime',
                        label: '任务开始时间',
                        'min-width': 100,
                        align: 'center',
                    },
                    {
                        prop: 'endTime',
                        label: '任务结束时间',
                        'min-width': 120,
                        align: 'center',
                    },
                    {
                        prop: 'worker',
                        label: '任务执行节点',
                        'min-width': 120,
                        align: 'center',
                    },
                    {
                        prop: 'pid',
                        label: '任务进程号',
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
                    taskState: this.taskState,
                    worker: this.worker,
                    pageNo: this.pagination.pageIndex,
                    pageSize: this.pagination.pageSize
                };
                this.$http.get('/jobInstance/paging', {params: params}).then(({body}) => {
                    if (body.errorCode === 200) {
                        this.tableData = responseText(body.data.records);
                        this.pagination.total = body.data.records ? body.data.total : 0;
                    } else {
                        this.$message.error(body.errorMsg);
                    }
                }).finally(() => {
                    this.loginLoading = false;
                })
            },

            handleSelectionChange(val) {
                this.multipleSelection = val;
            },
            batchRemove() {
                let ids = '';
                this.multipleSelection.forEach(selectedItem => {
                    // 删除请求
                    ids += selectedItem.id + ',';
                });
                let params = {
                    ids: ids
                };
                this.$http.post("/jobInstance/batchRemove", {}, {params: params}).then(({body}) => {
                    if (body.success === true) {
                        this.queryList();
                        this.$message.success(body.errorMsg);
                    } else {
                        this.$message.error(body.errorMsg);
                    }
                }).catch(() => {
                    this.$message.error('删除失败');
                })
            },
            kill(id) {
                let params = {
                    id: id,
                };
                this.save('/jobInstance/kill', params);
            },
            viewLog(url) {
                this.save(url);
            },
            rerun(id) {
                let params = {
                    id: id,
                };
                this.save('/jobInstance/rerun', params);
            },
            rerunAll(id) {
                let params = {
                    id: id,
                };
                this.save('/jobInstance/rerunAll', params);
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
