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
                    <el-option label="WAITING" value="3">WAITING</el-option>
                    <el-option label="RUNNING" value="4">RUNNING</el-option>
                    <el-option label="KILL" value="5">KILL</el-option>
                    <el-option label="SUCCESS" value="6">SUCCESS</el-option>
                    <el-option label="FAIL" value="7">FAIL</el-option>
                </el-select>

                <el-input placeholder="任务名称" v-model="jobName" class="input-with-select" clearable>
                    <el-button slot="append" icon="el-icon-search" @click="queryList"></el-button>
                </el-input>
                <el-button type="primary" size="small" @click="batchRerun" slot="reference">批量重跑</el-button> &nbsp;

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
                            min-width="260">
                        <template slot-scope="scope">

                            <el-button type="text" size="mini" :disabled="isKillDisabled(scope.row.jobType,scope.row.taskState)"
                                       @click="kill(scope.row.id)">杀任务
                            </el-button>
                            <el-button type="text" size="mini" :disabled="isActionDisabled(scope.row.jobReleasestate)"
                                       @click="rerun(scope.row.id)">重跑
                            </el-button>
                            <el-button type="text" size="mini" :disabled="isActionDisabled(scope.row.jobReleasestate)"
                                       @click="rerunAll(scope.row.id)">重跑所有
                            </el-button>
                            <el-button type="text" size="mini" :disabled="isActionDisabled(scope.row.jobReleasestate)"
                                       @click="markSuccess(scope.row.id)">标识成功
                            </el-button>
                            <el-button type="text" size="mini" :disabled="isActionDisabled(scope.row.jobReleasestate)"
                                       @click="markFail(scope.row.id)">标识失败
                            </el-button>
                            <el-button type="text" size="mini" :disabled="isLogDisabled(scope.row.logUrl)"
                                       @click="viewLog(scope.row.logUrl)">日志
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>

        </lyz-layout>
        <el-dialog :title="'日志详情'" :visible.sync="logVisible" width="70%" center
                   class="user-dialog" @close='closeLogDialog'>
            <div ref = "content" id="content" v-html="content" style="width: 1200px"></div>
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
                taskState: '',
                jobName: '',
                pagination: {
                    pageIndex: 1,
                    pageSize: 10,
                    total: 0,
                },
                label: '任务实例管理',
                messageForm: {},
                content: '',
                messageVisible: false,
                logVisible:false,
                messageLabelWidth: '90px',
                multipleSelection: [],//多选的数据
                tableData: [],
                loginLoading: false,
                tableHeader: [
                    {
                        prop: 'jobName',
                        label: '任务名称',
                        'min-width': 60,
                        align: 'center',
                    },
                    {
                        prop: 'taskState',
                        label: '实例状态',
                        'min-width': 80,
                        align: 'center',
                    },
                    {
                        prop: 'scheduleTime',
                        label: '实例调度时间',
                        'min-width': 120,
                        align: 'center',
                    },
                    {
                        prop: 'startTime',
                        label: '实例开始时间',
                        'min-width': 100,
                        align: 'center',
                    },
                    {
                        prop: 'endTime',
                        label: '实例结束时间',
                        'min-width': 120,
                        align: 'center',
                    },
                    {
                        prop: 'worker',
                        label: '实例执行节点',
                        'min-width': 120,
                        align: 'center',
                    },
                    {
                        prop: 'retryTimes',
                        label: '重试次数',
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
            this.$watch('jobName', debounce(() => {
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
                    jobName: this.jobName,
                    pageNo: this.pagination.pageIndex,
                    pageSize: this.pagination.pageSize
                };
                this.$http.get('/jobInstance/paging', {params: params}).then(({body}) => {
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

            handleSelectionChange(val) {
                this.multipleSelection = val;
            },
            batchRerun() {
                let ids = '';
                this.multipleSelection.forEach(selectedItem => {
                    ids += selectedItem.id + ',';
                });
                let params = {
                    ids: ids
                };
                this.$http.post("/jobInstance/batchRerun", {}, {params: params}).then(({body}) => {
                    if (body.errorCode === 200) {
                        this.queryList();
                        this.$message.success(body.errorMsg);
                    } else {
                        this.$message.error(body.errorMsg);
                    }
                })
            },
            kill(id) {
                let params = {
                    id: id,
                };
                this.save('/jobInstance/kill', params);
            },
            markSuccess(id) {
                let params = {
                    id: id,
                };
                this.save('/jobInstance/markSuccess', params);
            },
            markFail(id) {
                let params = {
                    id: id,
                };
                this.save('/jobInstance/markFail', params);
            },
            viewLog(url) {
                let params = {
                    logPath: url
                };
                this.$http.get('/jobInstance/viewLog', {params: params}).then(({body}) => {
                    if (body.errorCode === 200) {
                        this.content = body.data.replace(/\n/g,"<br/>");
                        this.logVisible = true;
                    } else {
                        this.$message.error(body.errorMsg);
                    }
                }).finally(() => {
                    this.loginLoading = false;
                })
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
            },
            closeLogDialog(){
                this.content='';
                this.logVisible = false;
            },
            isKillDisabled(jobType,taskState) {
                if (jobType == 'HTTP' || taskState !='RUNNING'){
                    return true;
                }else{
                    return false;
                }
            },
            isLogDisabled(logUrl) {
                if (logUrl == '' || logUrl == null){
                    return true;
                }else{
                    return false;
                }
            },
            isActionDisabled(jobReleaseState){
                if (jobReleaseState == 'OFFLINE'){
                    return true;
                }else{
                    return false;
                }
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
