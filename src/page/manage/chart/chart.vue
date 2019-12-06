<template>
    <section class="chart-container">
        <el-row>
            <el-col :span="12">
                <div id="chartPie" style="width:100%; height:400px;"></div>
            </el-col>
        </el-row>
    </section>
</template>
<script>
    import echarts from 'echarts'

    export default {
        data() {
            return {
                chartPie: null
            }
        },
        methods: {
            drawPieChart() {
                this.chartPie = echarts.init(document.getElementById('chartPie'));
                this.chartPie.setOption({
                    title: {
                        text: '任务运行概况',
                        x: 'center'
                    },
                    tooltip: {
                        trigger: 'item',
                        formatter: "{a} <br/>{b} : {c}"
                    },
                    legend: {
                        orient: 'vertical',
                        left: 'left',
                        data: ['SUBMIT', 'WAITING', 'RUNNING', 'KILL', 'SUCCESS', 'FAIL']
                    },
                    series: []
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
            drawCharts() {
                this.drawPieChart()
            },
        },

        mounted: function () {
            this.drawCharts()
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