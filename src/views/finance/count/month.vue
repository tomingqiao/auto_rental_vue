<template>
    <div>
        <el-main>
            <el-form :model="dateModel" size="small" inline>
                <el-form-item label="日期:">
                    <el-date-picker v-model="dateModel.date" type="month" placeholder="选择日期" @change="updateData"
                        value-format="yyyy-MM-dd"></el-date-picker>
                </el-form-item>
                <el-form-item label="当月应收金额:">
                    <el-tag type="success">{{ rentPayable }}</el-tag>
                </el-form-item>
                <el-form-item label="当月实收金额:">
                    <el-tag type="info">{{ rentActual }}</el-tag>
                </el-form-item>
                <el-form-item label="当月收到押金:">
                    <el-tag type="danger">{{ deposit }}</el-tag>
                </el-form-item>
            </el-form>
            <el-card :style="{ width: ' 80%', height: '450px' }">
                <div ref="myChart" :style="{ width: ' 100%', height: '400px' }">
                </div>
            </el-card>
        </el-main>

    </div>
</template>
<script>
import financeApi from '@/api/finance'
import * as echarts from 'echarts';
export default {
    name: 'month',
    data() {
        return {
            dateModel: {
                date: ''
            },
            chart: null,
            days: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31],
            rentalData: [],
            returnData: [],
            option: {
                title: {
                    text: '月报数据统计',
                    subtext: new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit' })
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow',
                    }
                },
                legend: {
                    data: ['出租数量', '归还数量']
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                toolbox: {
                    show: true,
                    orient: 'horizontal',
                    right: '4%',
                    // top: 'center',
                    feature: {
                        mark: { show: true },
                        dataView: {
                            show: true, readOnly: false,
                            optionToContent: function (opt) {
                                var axisData = opt.xAxis[0].data;
                                var series = opt.series;
                                var table = '<table style="text-align:center"><tbody><tr>'
                                    + '<td>时间</td>'
                                    + '<td>' + series[0].name + '</td>'
                                    + '<td>' + series[1].name + '</td>'
                                    + '</tr>';
                                for (var i = 0, l = axisData.length; i < l; i++) {
                                    table += '<tr>'
                                        + '<td>' + axisData[i] + '</td>'
                                        + '<td>' + series[0].data[i] + '</td>'
                                        + '<td>' + series[1].data[i] + '</td>'
                                        + '</tr>';
                                }
                                table += '</tbody></table>';
                                return table;
                            }
                        },
                        magicType: {
                            show: true,
                            type: ['line', 'bar']
                        },
                        restore: {
                            show: true
                        },
                        saveAsImage: {
                            show: true
                        }
                    }
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: []
                },
                yAxis: {
                    type: 'value'
                },
                series: [
                    {
                        name: '出租数量',
                        type: 'line',
                        barGap: 0,
                        emphasis: {
                            focus: 'series'
                        },
                        data: []
                    },
                    {
                        name: '归还数量',
                        type: 'line',
                        barGap: 0,
                        emphasis: {
                            focus: 'series'
                        },
                        data: []
                    },
                ]
            },
            rentPayable: 0,
            rentActual: 0,
            deposit: 0,
        }
    },
    mounted() {
        this.initChart();
        this.updateData();
    },
    created() {
        this.dateModel.date = this.getNowDate();
    },
    methods: {
        async getData() {
            const res = await financeApi.countMonth(this.dateModel.date);
            if (res.success) {
                this.days = res.data[0];
                this.rentalData = res.data[1];
                this.returnData = res.data[2];
            }
            const resCost = await financeApi.countMonthCost(this.dateModel.date);
            if (resCost.success) {
                if (resCost.data != null) {
                    this.rentPayable = resCost.data.rentPayable;
                    this.rentActual = resCost.data.rentActual;
                    this.deposit = resCost.data.deposit;
                } else {
                    this.rentPayable = 0;
                    this.rentActual = 0;
                    this.deposit = 0;
                }
            }
        },
        async updateData() {
            await this.getData();
            this.chart.setOption({
                title: {
                    subtext: new Date(this.dateModel.date).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit' })
                },
                xAxis: {
                    data: this.days
                },
                series: [{
                    data: this.rentalData
                }, {
                    data: this.returnData
                }]
            });
        },
        initChart() {
            this.chart = echarts.init(this.$refs.myChart);
            this.chart.setOption(this.option)
        },
        getNowDate() {
            const date = new Date();
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始，需要+1
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        },
    }
}
</script>
<style></style>