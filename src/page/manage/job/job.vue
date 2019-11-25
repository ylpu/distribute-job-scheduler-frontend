<template>
    <div class="main-login">
        <lyz-layout
                :pagination="pagination"
                :label="label"
                @handleSizeChange="handleSizeChange"
                @handleCurrentChange="handleCurrentChange">
            <div slot="banner" class="top-right">
                <el-button type="primary" size="small" @click="createJob" slot="reference">新增</el-button> &nbsp;

                <el-select v-model="jobType" placeholder="请选择任务类型" class="right-select" @change="queryTypeChange"
                           clearable @clear="queryList">
                    <el-option label="shell" value="1">shell</el-option>
                    <el-option label="hive" value="2">hive</el-option>
                    <el-option label="spark" value="3">spark</el-option>
                </el-select>

                <el-input placeholder="任务名称" v-model="jobName" class="input-with-select" clearable>
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
                        style="width: 100%">
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
                            min-width="120">

                            <template slot-scope="scope">
                                <el-button type="text" size="mini"
                                           @click="scheduleJob(scope.row.id)">调度
                                </el-button>
                                <el-button type="text" size="mini"
                                       @click="updateJob(scope.row)">修改
                                </el-button>
                                <el-button type="text" size="mini"
                                           @click="jobTree(scope.row.id)">任务图
                                </el-button>
                                <el-button type="text" size="mini" class="danger-text"
                                           @click="downJob(scope.row.id)">下线
                                </el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>

        </lyz-layout>
        <el-dialog :title="operate==='update'?'修改任务':'添加任务'" :visible.sync="messageVisible" width="70%" center
                   class="user-dialog" @close='closeDialog'>

            <el-form :model="messageForm" :label-width="messageLabelWidth" ref="messageForm" :rules="messageRule"
                     :validate-on-rule-change=false>

                <el-form-item label="任务名称"  prop="jobName">
                    <el-input v-model="messageForm.jobName" placeholder="请输入任务名称"></el-input>
                </el-form-item>
                <el-form-item label="任务描述"  prop="description">
                    <el-input v-model="messageForm.description" placeholder="请输入任务描述"></el-input>
                </el-form-item>
                <el-form-item label="任务依赖"  prop="dependIds">
                    <el-input v-model="messageForm.dependIds" placeholder="请输入任务依赖，任务id以逗号隔开(空表示无依赖)"></el-input>
                </el-form-item>

                    <el-form-item label="任务优先级"  prop="jobPriority">
                        <el-select v-model="messageForm.jobPriority" placeholder="请选择任务优先级">
                            <el-option label="LOW" value="LOW">LOW</el-option>
                            <el-option label="MEDIUM" value="MEDIUM">MEDIUM</el-option>
                        <el-option label="HIGH" value="HIGH">HIGH</el-option>
                        </el-select>
                    </el-form-item>

                <el-form-item label="任务类型"  prop="jobType">
                    <el-select v-model="messageForm.jobType" placeholder="请选择任务类型">
                        <el-option label="SHELL" value="SHELL">SHELL</el-option>
                        <el-option label="HIVE" value="HIVE">HIVE</el-option>
                        <el-option label="SPARK" value="SPARK">SPARK</el-option>
                    </el-select>
                </el-form-item>

                    <el-form-item label="任务责任人"  prop="ownerIds">
                        <el-input v-model="messageForm.ownerIds" placeholder="请输入任务责任人"></el-input>
                    </el-form-item>

                    <el-form-item label="任务告警人"  prop="alertUsers">
                        <el-input v-model="messageForm.alertUsers" placeholder="请输入任务告警人"></el-input>
                    </el-form-item>
                <el-form-item label="告警类型"  prop="alertTypes">
                    <el-select v-model="messageForm.alertTypes" placeholder="请选择告警类型">
                        <el-option label="SMS" value="1">SMS</el-option>
                        <el-option label="WEBCHAT" value="WEBCHAT">WEBCHAT</el-option>
                        <el-option label="EMAIL" value="EMAIL">EMAIL</el-option>
                    </el-select>
                </el-form-item>
                    <el-form-item label="调度时间"  prop="scheduleCron">
                        <el-input v-model="messageForm.scheduleCron" placeholder="调度时间,cron表达式"></el-input>
                    </el-form-item>

                    <el-form-item label="任务周期"  prop="jobCycle">
                        <el-select v-model="messageForm.jobCycle" placeholder="请选择任务周期">
                            <el-option label="MINUTE" value="MINUTE">MINUTE</el-option>
                            <el-option label="HOUR" value="HOUR">HOUR</el-option>
                            <el-option label="DAY" value="DAY">DAY</el-option>
                            <el-option label="WEEK" value="WEEK">WEEK</el-option>
                            <el-option label="MONTH" value="MONTH">MONTH</el-option>
                            <el-option label="YEAR" value="YEAR">YEAR</el-option>
                        </el-select>
                    </el-form-item>

                    <el-form-item label="重试次数"  prop="maxRetrytimes">
                        <el-input v-model="messageForm.maxRetrytimes" placeholder="重试次数"></el-input>
                    </el-form-item>

                    <el-form-item label="超时时间"  prop="executionTimeout">
                        <el-input v-model="messageForm.executionTimeout" placeholder="超时时间"></el-input>
                    </el-form-item>
                    <el-form-item label="任务工作组"  prop="workerGroupname">
                        <el-select v-model="messageForm.workerGroupname" placeholder="任务工作组" class="right-select">
                            <el-option
                                    v-for="item in workerGroupOption"
                                    :key="item"
                                    :label="item"
                                    :value="item">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="任务配置"  prop="jobConfiguration">
                        <el-input type="textarea"  :autosize="{minRows:5}" v-model="messageForm.jobConfiguration" clearable placeholder="请输入任务配置"></el-input>
                    </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click=closeDialog>取 消</el-button>
                <el-button type="primary" @click=saveJob>确 定</el-button>
            </div>
        </el-dialog>
        <el-dialog :title="'任务图'" :visible.sync="jobTreeVisible" width="70%" center
                   class="user-dialog">
            <div class="text-center" style="height: 400px">
                <vue2-org-tree
                        name="jobTree"
                        :data="treeData"
                        :horizontal="horizontal"
                        :collapsable="collapsable"
                        :label-class-name="labelClassName"
                        :render-content="renderContent"
                        @on-expand="onExpand"
                        @on-node-click="onNodeClick"
                />
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
                jobType: '',
                jobName: '',
                pagination: {
                    pageIndex: 1,
                    pageSize: 10,
                    total: 0,
                },
                label: '任务管理',
                messageForm: {},
                treeData: {},
                messageVisible: false,
                jobTreeVisible: false,
                messageLabelWidth: '120px',
                horizontal: true,
                collapsable: true,
                expandAll: false,
                labelClassName: "bg-tomato",
                messageRule: {
                    jobName: [
                        {required: true, message: '请输入任务名称', trigger: 'blur'}
                    ],
                    jobConfiguration: [
                        {required: true, message: '请输入任务配置', trigger: 'blur'}
                    ],
                    ownerIds: [
                        {required: true, message: '请输入任务所有人', trigger: 'blur'}
                    ],
                    jobType: [
                        {required: true, message: '请选择任务类型', trigger: 'blur'}
                    ],
                    jobCycle: [
                        {required: true, message: '请选择任务周期', trigger: 'blur'}
                    ],
                    jobPriority: [
                        {required: true, message: '请选择任务优先级', trigger: 'blur'}
                    ],
                    workerGroupname: [
                        {required: true, message: '请选择任务工作组', trigger: 'blur'}
                    ],
                    scheduleCron: [
                        {required: true, message: '请输入任务调度时间', trigger: 'blur'}
                    ],
                    alertTypes: [
                        {required: true, message: '请选择告警类型', trigger: 'blur'}
                    ]
                },
                operate: '',
                tableData: [],
                workerGroupOption :[],
                loginLoading: false,
                tableHeader: [
                    {
                        prop: 'id',
                        label: '任务ID',
                        'min-width': 40,
                        align: 'center',
                    },
                    {
                        prop: 'jobName',
                        label: '任务名',
                        'min-width': 80,
                        align: 'center',
                    },
                    {
                        prop: 'jobPriority',
                        label: '任务优先级',
                        'min-width': 120,
                        align: 'center',
                    },
                    {
                        prop: 'scheduleCron',
                        label: '任务时间',
                        'min-width': 100,
                        align: 'center',
                    },
                    {
                        prop: 'alertUsers',
                        label: '任务告警人',
                        'min-width': 120,
                        align: 'center',
                    },
                    {
                        prop: 'creatorId',
                        label: '任务创建人',
                        'min-width': 120,
                        align: 'center',
                    },
                    {
                        prop: 'workerGroupname',
                        label: '任务执行组',
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
            this.$watch('jobName', debounce(() => {
                this.pagination.pageIndex = 1;
                this.queryList();
            }, 1000));
        },
        methods: {
            queryTypeChange(val) {
                if (val !== '') {
                    this.jobType = val;
                    this.queryList();
                }
            },
            queryList() {
                this.loginLoading = true;
                let params = {
                    jobType: this.jobType,
                    jobName: this.jobName,
                    pageNo: this.pagination.pageIndex,
                    pageSize: this.pagination.pageSize
                };
                this.$http.get('/job/paging', {params: params}).then(({body}) => {
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
            scheduleJob(id) {
                let params = {
                    id: id,
                };
                this.save('/job/scheduleJob', params);
            },
            downJob(id) {
                let params = {
                    id: id,
                };
                this.save('/job/downJob', params);
            },
            jobTree(id) {
                this.jobTreeVisible = true;
                this.$http.get('/job/queryTreeById/' + id).then(({body}) => {
                    if (body.errorCode === 200) {
                        this.treeData = body.data;
                    }
                }).finally(() => {
                    this.loginLoading = false;
                })
            },
            updateJob(row) {
                console.log(row);
                this.$http.get('/worker/getWorkerGroup').then(({body}) => {
                    if (body.errorCode === 200) {
                        body.data.forEach(element => {
                            this.workerGroupOption.push(element);
                        })
                    }
                }).finally(() => {
                    this.loginLoading = false;
                })
                this.messageVisible = true;
                this.operate = 'update';
                let _form = Object.assign({}, row);
                this.messageForm = _form;
            },
            createJob(row) {
                console.log(row);
                this.$http.get('/worker/getWorkerGroup').then(({body}) => {
                    if (body.errorCode === 200) {
                        body.data.forEach(element => {
                            this.workerGroupOption.push(element);
                        })
                    }
                }).finally(() => {
                    this.loginLoading = false;
                })
                this.messageVisible = true;
                this.operate = 'create';
                let _form = Object.assign({}, row);
                this.messageForm = _form;
            },
            closeDialog() {
                this.messageVisible = false;
                this.workerGroupOption = [];
            },
            saveJob() {
                console.log('save');
                let params = {
                    jobName: this.messageForm.jobName,
                    jobType: this.messageForm.jobType,
                    jobPriority: this.messageForm.jobPriority,
                    ownerIds: this.messageForm.ownerIds,
                    alertUsers: this.messageForm.alertUsers,
                    alertTypes: this.messageForm.alertTypes,
                    scheduleCron: this.messageForm.scheduleCron,
                    jobCycle: this.messageForm.jobCycle,
                    maxRetrytimes: this.messageForm.maxRetrytimes,
                    executionTimeout: this.messageForm.executionTimeout,
                    description: this.messageForm.description,
                    jobConfiguration: this.messageForm.jobConfiguration,
                    dependIds: this.messageForm.dependIds,
                    workerGroupname: this.messageForm.workerGroupname,
                };
                this.$refs['messageForm'].validate((valid) => {
                    if (valid) {
                        if (this.messageForm.id) {
                            params.id = this.messageForm.id;
                            this.save('/job/updateJob', params, 'messageVisible');
                        } else {
                            this.save('/job/addJob', params, 'messageVisible');
                        }
                    }
                })
            },

            renderContent(h, data) {
                return data.jobName;
            },
            onExpand(e, data) {
                if ("expand" in data) {
                    data.expand = !data.expand;
                    if (!data.expand && data.children) {
                        this.collapse(data.children);
                    }
                } else {
                    this.$set(data, "expand", true);
                }
            },
            //点击选项执行的方法，可以用于跳转到其他链接，注意一定要写协议头
            onNodeClick(e, data) {
                if(data.url==null){
                    return false
                }else{
                    window.open(data.url)
                }
            },
            collapse(list) {
                let _this = this;
                list.forEach(function(child) {
                    if (child.expand) {
                        child.expand = false;
                    }
                    child.children && _this.collapse(child.children);
                });
            },
            expandChange() {
                this.toggleExpand(this.data, this.expandAll);
            },
            toggleExpand(data, val) {
                let _this = this;
                if (Array.isArray(data)) {
                    data.forEach(function(item) {
                        _this.$set(item, "expand", val);
                        if (item.children) {
                            _this.toggleExpand(item.children, val);
                        }
                    });
                } else {
                    this.$set(data, "expand", val);
                    if (data.children) {
                        _this.toggleExpand(data.children, val);
                    }
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
