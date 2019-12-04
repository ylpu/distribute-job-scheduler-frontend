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
                    <el-option label="command" value="4">command</el-option>
                    <el-option label="http" value="5">http</el-option>
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
                            min-width="240">

                            <template slot-scope="scope">
                                <el-button type="text" size="mini"
                                           @click="scheduleJob(scope.row.id)">调度
                                </el-button>
                                <el-button type="text" size="mini"
                                       @click="updateJob(scope.row)">修改
                                </el-button>
                                <el-button type="text" size="mini"
                                           @click="rescheduleJob(scope.row.id)">重新调度
                                </el-button>
                                <el-button type="text" size="mini" class="danger-text"
                                           @click="downJob(scope.row.id)">下线
                                </el-button>

                                <el-button type="text" size="mini"
                                           @click="jobTree(scope.row.id)">依赖图
                                </el-button>
                                <el-button type="text" size="mini"
                                           @click="drawLines(scope.row.id)">实例图
                                </el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>

        </lyz-layout>
        <el-dialog :title="operate==='update'?'修改任务':'添加任务'" :visible.sync="messageVisible" width="65%" center
                   class="user-dialog" @close='closeFormDialog'>

            <el-form :model="messageForm" :label-width="messageLabelWidth" ref="messageForm" :rules="messageRule"
                     :validate-on-rule-change=false>
               <el-row gutter="80" justify="start">
                   <el-col span="12">
                        <el-form-item label="任务名称"  prop="jobName">
                             <el-input v-model="messageForm.jobName" placeholder="请输入任务名称"></el-input>
                        </el-form-item>
                   </el-col>
                   <el-col span="12">
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
                   </el-col>
               </el-row>
                <el-row gutter="80" justify="start">
                    <el-col span="12">
                        <el-form-item label="任务依赖"  prop="dependIds">
                            <el-select v-model="messageForm.dependIds" placeholder="任务依赖" class="right-select" multiple style="width:360px">
                                <el-option
                                    v-for="item in jobIdOption"
                                    :key="item.id"
                                    :label="item.jobName"
                                    :value="item.id">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col span="12">
                         <el-form-item label="任务优先级"  prop="jobPriority">
                            <el-select v-model="messageForm.jobPriority" placeholder="请选择任务优先级">
                                <el-option label="LOW" value="LOW">LOW</el-option>
                                <el-option label="MEDIUM" value="MEDIUM">MEDIUM</el-option>
                                <el-option label="HIGH" value="HIGH">HIGH</el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row gutter="80" justify="start">
                    <el-col span="12">
                        <el-form-item label="任务责任人"  prop="ownerIds">
                            <el-input v-model="messageForm.ownerIds" placeholder="请输入任务责任人"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col span="12">
                         <el-form-item label="任务类型"  prop="jobType">
                              <el-select v-model="messageForm.jobType" placeholder="请选择任务类型">
                                   <el-option label="SHELL" value="SHELL">SHELL</el-option>
                                   <el-option label="HIVE" value="HIVE">HIVE</el-option>
                                   <el-option label="SPARK" value="SPARK">SPARK</el-option>
                                   <el-option label="COMMAND" value="COMMAND">COMMAND</el-option>
                                   <el-option label="HTTP" value="HTTP">HTTP</el-option>
                              </el-select>
                          </el-form-item>
                    </el-col>
                </el-row>
                <el-row gutter="80" justify="start">
                    <el-col span="12">
                        <el-form-item label="任务告警人"  prop="alertUsers">
                            <el-input v-model="messageForm.alertUsers" placeholder="请输入任务告警人"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col span="12">
                         <el-form-item label="告警类型"  prop="alertTypes">
                              <el-select v-model="messageForm.alertTypes" placeholder="请选择告警类型">
                                  <el-option label="SMS" value="1">SMS</el-option>
                                  <el-option label="WEBCHAT" value="WEBCHAT">WEBCHAT</el-option>
                                 <el-option label="EMAIL" value="EMAIL">EMAIL</el-option>
                             </el-select>
                         </el-form-item>
                    </el-col>
                </el-row>
                <el-row gutter="80" justify="start">
                    <el-col span="12">
                         <el-form-item label="调度时间"  prop="scheduleCron">
                             <el-input v-model="messageForm.scheduleCron" placeholder="调度时间,cron表达式"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col span="12">
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
                    </el-col>
                </el-row>
                <el-row gutter="80" justify="start">
                    <el-col span="12">
                        <el-form-item label="重试次数"  prop="maxRetrytimes">
                            <el-input v-model="messageForm.maxRetrytimes" placeholder="重试次数"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col span="8">
                        <el-form-item label="超时时间"  prop="executionTimeout">
                            <el-input v-model="messageForm.executionTimeout" placeholder="超时时间"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row gutter="80" justify="start">
                    <el-col span="21">
                        <el-form-item label="任务描述"  prop="description">
                            <el-input v-model="messageForm.description" placeholder="请输入任务描述"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row gutter="80" justify="start" >
                    <el-col span="21">
                        <el-form-item label="任务配置"  prop="jobConfiguration">
                            <el-input type="textarea"  :autosize="{minRows:5}" v-model="messageForm.jobConfiguration" clearable placeholder="请输入任务配置"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click=closeFormDialog>取 消</el-button>
                <el-button type="primary" @click=saveJob>确 定</el-button>
            </div>
        </el-dialog>
        <el-dialog :title="'任务图'" :visible.sync="jobTreeVisible" width="70%" center
                   class="user-dialog" @close='closeDag'>
            <div id="tree">
                <div class="container">
                    <div class="col-md-10 col-md-offset-1">
                        <div class="page-header">
                            <h3>任务依赖图</h3>
                        </div>
                        <div class="row">
                            <div class="col-md-8 col-md-offset-2">
                                <form class="form-horizontal row" ref="dagForm">
                                    <div class="col-md-4">
                                        <div class="checkbox">
                                            <label>
                                                <input type="checkbox" v-model="horizontal" /> 横排
                                            </label>
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="checkbox">
                                            <label>
                                                <input type="checkbox" v-model="collapsable" /> 竖排
                                            </label>
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="checkbox">
                                            <label>
                                                <input type="checkbox" v-model="expandAll" @change="expandChange" /> 显示所有项
                                            </label>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                        <p>
                            <br />
                        </p>
                        <div class="text-center">
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
                    </div>
                </div>
            </div>

        </el-dialog>
        <el-dialog :title="'任务实例运行情况'" :visible.sync="jobRunVisible" width="75%" center
                   class="job-dialog" @close='closeJobDialog'>
            <div id="jobChart" style="width: 1200px;height: 500px;"></div>
        </el-dialog>
    </div>
</template>

<script>
    import lyzLayout from '@/components/lyzLayout';
    import manage from '../manage.component';
    import {formatDateTime, responseText, debounce} from '../../../config/utils.js';
    import echarts from 'echarts';
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
                charts: '',
                xdata:[],
                ydata:[],
                messageVisible: false,
                jobTreeVisible: false,
                jobRunVisible: false,
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
                jobIdOption:[],
                loginLoading: false,
                tableHeader: [
                    {
                        prop: 'jobName',
                        label: '任务名',
                        'min-width': 80,
                        align: 'center',
                    },
                    {
                        prop: 'ownerIds',
                        label: '任务拥有人',
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
                        prop: 'executionTimeout',
                        label: '超时时间',
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
            drawLine(id) {

                this.charts = echarts.init(document.getElementById('jobChart'))
                this.$http.get('/jobInstance/getTaskLineByJobId/' + id).then(({body}) => {
                    if (body.errorCode === 200) {
                        this.xdata = [];
                        this.ydata = [];
                        body.data.forEach(item => {
                            this.xdata.push(item.scheduleTime);
                            this.ydata.push(item.elapseTime);
                        })
                        this.charts.setOption({
                            tooltip: {
                                trigger: 'axis'
                            },
                            legend: {
                                data: ['近30次运行时间']
                            },
                            grid: {
                                left: '10%',
                                right: '4%',
                                bottom: '3%',
                                containLabel: true
                            },

                            toolbox: {
                                feature: {
                                    saveAsImage: {}
                                }
                            },
                            xAxis: {
                                type: 'category',
                                boundaryGap: false,
                                data: this.xdata

                            },
                            yAxis: {
                                type: 'value'
                            },

                            series: [{
                                name: '近30次运行时间',
                                type: 'line',
                                stack: '运行时间',
                                data: this.ydata
                            }]
                        });

                    }
                }).finally(() => {
                    this.loginLoading = false;
                })
            },

            drawLines(id){
                this.jobRunVisible = true;
                this.$nextTick(() => {
                    this.drawLine(id);
                });
            },

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
            rescheduleJob(id) {
                let params = {
                    id: id,
                };
                this.save('/job/rescheduleJob', params);
            },
            downJob(id) {
                let params = {
                    id: id,
                };
                this.$confirm('确定要下线任务？', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                }).then(() => {
                    this.$http.post('/job/downJob', params).then(({body}) => {
                        if (body.errorCode === 200) {
                            this.queryList();
                        } else {
                            this.$message.error(body.errorMsg);
                        }
                    }).catch(() => {
                        this.$message.error('删除失败');
                    })
                }).catch(() => {
                    this.$message.info('已取消下线')
                })
            },
            jobTree(id) {
                this.jobTreeVisible = true;
                let params = {
                    id: id,
                };
                this.$http.get('/job/queryTreeById?id='+id).then(({body}) => {
                    if (body.errorCode === 200) {
                        this.treeData = body.data;
                    }
                }).finally(() => {
                    this.loginLoading = false;
                })
            },
            updateJob(row) {
                console.log(row);
                this.messageVisible = true;
                this.operate = 'update';
                let _form = Object.assign({}, row);
                this.messageForm = _form;
                this.initDialog();
            },
            createJob(row) {
                console.log(row);
                this.messageVisible = true;
                this.operate = 'create';
                let _form = Object.assign({}, row);
                this.messageForm = _form;
                this.initDialog();
            },
            closeFormDialog() {
                this.messageVisible = false;
                this.$refs['messageForm'].resetFields();
            },
            initDialog(){
                this.$http.get('/worker/getWorkerGroup').then(({body}) => {
                    if (body.errorCode === 200) {
                        body.data.forEach(element => {
                            this.workerGroupOption.push(element);
                        })
                    }
                }).finally(() => {
                    this.loginLoading = false;
                });

                this.$http.get('/job/getAllJobs').then(({body}) => {
                    if (body.errorCode === 200) {
                        body.data.forEach(element => {
                            this.jobIdOption.push(element);
                        })
                    }
                }).finally(() => {
                    this.loginLoading = false;
                });
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
                this.toggleExpand(this.treeData, this.expandAll);
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
            },
            closeJobDialog(){
                this.xdata = [];
                this.ydata = [];
                this.jobRunVisible = false;
            },
            closeDag(){
                this.treeData = {};
                this.horizontal = true;
                this.collapsable = true;
                this.expandAll = false;
                this.jobTreeVisible = false;
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
