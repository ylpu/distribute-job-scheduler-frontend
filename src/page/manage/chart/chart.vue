<template>
    <section class="chart-container">
        <el-row>
            <el-col :span="12">
                <div id="chartPie" style="width:100%; height:300px;"></div>
            </el-col>
            <el-col :span="12">
                <div id="workerChart" style="width:100%; height:300px;"></div>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="12">
                <div id="jobTypeChart" style="width:100%; height:300px;"></div>
            </el-col>
            <el-col :span="12">
                <div id="masterUsageChart" style="width:100%; height:300px;"></div>
            </el-col>
        </el-row>
    </section>
</template>
<script>
    import echarts from 'echarts'

    export default {
        data() {
            return {
                chartPie: null,
                workerBar: null,
                taskBar: null,
                usageChart : null
            }
        },
        methods: {
            drawPieChart() {
                this.chartPie = echarts.init(document.getElementById('chartPie'));
                this.chartPie.setOption({
                    title: {
                        text: '任务状态分布',
                        x: 'center'
                    },
                    tooltip: {
                        trigger: 'item',
                        formatter: "{a} <br/>{b} : {c}"
                    },
                    legend: {
                        orient: 'vertical',
                        left: 'left',
                        data: ['SUBMIT', 'SCHEDULED', 'WAITING_DEPENDENCY', 'QUEUED', 'WAITING_RESOURCE', 'RUNNING', 'KILL', 'SUCCESS', 'FAIL']
                    },
                    series: [],
                    color: ['#B22222','#069f71','#8E388E','rgb(113,171,246)','rgb(255,193,134)']
                });
                this.$http.get('/chart/getTaskSummary').then(({body}) => {
                    if (body.errorCode === 200) {
                        let seriesData = [];
                        body.data.forEach(item => {
                            let outObj = {};
                            outObj.name = item.taskState;
                            outObj.value = item.taskCount;
                            seriesData.push(outObj);
                        })
                        this.chartPie.setOption({
                            series: [
                                {
                                    name: '任务分布',
                                    type: 'pie',
                                    radius: '55%',
                                    center: ['50%', '60%'],
                                    data: seriesData,
                                    itemStyle: {
                                        emphasis: {
                                            shadowBlur: 10,
                                            shadowOffsetX: 0,
                                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                                        }
                                    }
                                }
                            ]
                        });
                    }else{
                        this.$message.error(body.errorMsg);
                    }
                }).finally(() => {
                    this.loginLoading = false;
                })
            },
            drawBar() {
                this.workerBar = echarts.init(document.getElementById("workerChart"));
                let nameArray = [];
                let dataArray = [];
                this.$http.get('/chart/getWorkerSummary').then(({body}) => {
                    if (body.errorCode === 200) {
                        body.data.forEach(item => {
                            nameArray.push(item.worker);
                            dataArray.push(item.taskCount);
                        })
                        this.workerBar.setOption({
                            series: [
                                {
                                    name     : "name",
                                    type     : "bar",
                                    barWidth : "60%",
                                    data     : dataArray,
                                    itemStyle: {
                                        normal: {
                                            color: "#069f71"
                                        }
                                    }
                                }
                            ],
                            xAxis: [
                                {
                                    type    : "category",
                                    data    : nameArray,
                                    axisTick: {
                                        alignWithLabel: true
                                    }
                                }
                            ],
                            yAxis: [
                                {
                                    type: "value"
                                }
                            ],
                            title: {
                                text     : "任务节点分布",
                                left     : "center",
                                top      : 20,
                                textStyle: {
                                    color: "#000"
                                }
                            }
                        });
                    }else{
                        this.$message.error(body.errorMsg);
                    }
                }).finally(() => {
                    this.loginLoading = false;
                })
            },
            drawJobTypeBar() {
                this.taskBar = echarts.init(document.getElementById("jobTypeChart"));
                let nameArray = [];
                let dataArray = [];
                this.$http.get('/chart/getJobTypeSummary').then(({body}) => {
                    if (body.errorCode === 200) {
                        body.data.forEach(item => {
                            nameArray.push(item.jobType);
                            dataArray.push(item.taskCount);
                        })
                        this.taskBar.setOption({
                            series: [
                                {
                                    name     : "name",
                                    type     : "bar",
                                    barWidth : "60%",
                                    data     : dataArray,
                                    itemStyle: {
                                        normal: {
                                            color: "#069f71"
                                        }
                                    }
                                }
                            ],
                            xAxis: [
                                {
                                    type    : "category",
                                    data    : nameArray,
                                    axisTick: {
                                        alignWithLabel: true
                                    }
                                }
                            ],
                            yAxis: [
                                {
                                    type: "value"
                                }
                            ],
                            title: {
                                text     : "任务类型分布",
                                left     : "center",
                                top      : 20,
                                textStyle: {
                                    color: "#000"
                                }
                            }
                        });
                    }else{
                        this.$message.error(body.errorMsg);
                    }
                }).finally(() => {
                    this.loginLoading = false;
                })
            },
            drawMasterUsageLine() {
                this.usageChart = echarts.init(document.getElementById('masterUsageChart'))
                this.memoryData = [];
                this.$http.get('/chart/getMasterCpuUsage').then(({body}) => {
                    if (body.errorCode === 200) {
                        this.xdata = [];
                        this.cpuData = [];
                        body.data.forEach(item => {
                            this.xdata.push(item.hostName);
                            this.cpuData.push(item.value);
                        })
                        this.$http.get('/chart/getMasterMemoryUsage').then(({body}) => {
                            if (body.errorCode === 200) {
                                body.data.forEach(item => {
                                    this.memoryData.push(item.value);
                                })
                                this.usageChart.setOption({
                                    tooltip: {
                                        trigger: 'axis'
                                    },
                                    legend: {
                                        data: ['master节点cpu使用率','master节点内存使用率']
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
                                        name: '节点cpu使用率',
                                        type: 'line',
                                        stack: '节点cpu使用率',
                                        data: this.cpuData
                                    },{
                                        name: '节点内存使用率',
                                        type: 'line',
                                        stack: '节点内存使用率',
                                        data: this.memoryData
                                    }]
                                });
                            }
                        }).finally(() => {
                            this.loginLoading = false;
                        })
                    }
                }).finally(() => {
                    this.loginLoading = false;
                })
            }
        },

        mounted: function () {
            this.drawPieChart();
            this.drawBar();
            this.drawJobTypeBar();
            this.drawMasterUsageLine();
        },
    }
</script>

<style scoped>
    .chart-container {
        width: 100%;
        float: left;
    }
    .el-col {
        padding: 30px 20px;
    }
</style>
