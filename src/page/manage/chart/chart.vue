<template>
    <section class="chart-container">
        <el-row>
            <el-col :span="12">
                <div id="chartPie" style="width:100%; height:300px;"></div>
            </el-col>
            <el-col :span="12">
                <div id="bar" style="width:100%; height:300px;"></div>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="12">
                <div id="cpuChart" style="width:100%; height:300px;"></div>
            </el-col>
            <el-col :span="12">
                <div id="memoryChart" style="width:100%; height:300px;"></div>
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
                bar: null,
                cpuChart : null,
                memoryChart : null
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
                    color: ['#069f71','#B22222','#8E388E','rgb(113,171,246)','rgb(255,193,134)']
                });
                this.$http.get('/jobInstance/getTaskSummary').then(({body}) => {
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
                this.bar = echarts.init(document.getElementById("bar"));
                let nameArray = [];
                let dataArray = [];
                this.$http.get('/jobInstance/getWorkerSummary').then(({body}) => {
                    if (body.errorCode === 200) {
                        body.data.forEach(item => {
                            nameArray.push(item.worker);
                            dataArray.push(item.taskCount);
                        })
                        this.bar.setOption({
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
            drawCpuLine() {

                this.cpuChart = echarts.init(document.getElementById('cpuChart'))
                this.$http.get('/worker/getWorkerCpuUsage').then(({body}) => {
                    if (body.errorCode === 200) {
                        this.xdata = [];
                        this.ydata = [];
                        body.data.forEach(item => {
                            this.xdata.push(item.worker);
                            this.ydata.push(item.usage);
                        })
                        this.cpuChart.setOption({
                            tooltip: {
                                trigger: 'axis'
                            },
                            legend: {
                                data: ['节点cpu使用率']
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
                                data: this.ydata
                            }]
                        });

                    }
                }).finally(() => {
                    this.loginLoading = false;
                })
            },
            drawMemoryLine() {

                this.memoryChart = echarts.init(document.getElementById('memoryChart'))
                this.$http.get('/worker/getWorkerMemoryUsage').then(({body}) => {
                    if (body.errorCode === 200) {
                        this.xdata = [];
                        this.ydata = [];
                        body.data.forEach(item => {
                            this.xdata.push(item.worker);
                            this.ydata.push(item.usage);
                        })
                        this.memoryChart.setOption({
                            tooltip: {
                                trigger: 'axis'
                            },
                            legend: {
                                data: ['节点内存使用率']
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
                                name: '节点内存使用率',
                                type: 'line',
                                stack: '节点内存使用率',
                                data: this.ydata
                            }]
                        });

                    }
                }).finally(() => {
                    this.loginLoading = false;
                })
            }
        },

        mounted: function () {
            this.drawPieChart();
            this.drawBar();
            this.drawCpuLine();
            this.drawMemoryLine();
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