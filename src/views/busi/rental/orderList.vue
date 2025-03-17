<template>
    <div>
        <el-main>
            <el-form :inline="true" size="small" label-width="100px" :model="orderModel">
                <el-form-item label="订单编号">
                    <el-input v-model="orderModel.orderNum" placeholder="请输入订单编号"></el-input>
                </el-form-item>
                <el-form-item label="车牌号码">
                    <el-input v-model="orderModel.autoNum" placeholder="车牌号码"></el-input>
                </el-form-item>
                <el-form-item label="客户名称">
                    <el-input v-model="orderModel.customerName" placeholder="请输入客户名称"></el-input>
                </el-form-item>
                <el-form-item label="客户电话">
                    <el-input v-model="orderModel.customerTel" placeholder="请输入客户电话"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" icon="el-icon-search" @click="onSubmit">查询</el-button>
                    <el-button type="warning" icon="el-icon-refresh" @click="resetForm">重置</el-button>
                </el-form-item>
            </el-form>
            <el-table stripe border :data="tableData" style="width: 100%;margin-bottom: 20px">
                <el-table-column prop="id" label="序号" width="50">
                    <template slot-scope="scope">
                        {{ scope.$index + 1 + (start - 1) * size }}
                    </template>
                </el-table-column>
                <el-table-column prop="autoNum" label="车牌号码" width="100"></el-table-column>
                <el-table-column prop="customerName" label="客户名称" width="130"></el-table-column>
                <el-table-column prop="rentalTime" label="出租时间"></el-table-column>
                <el-table-column prop="returnTime" label="归还时间"></el-table-column>
                <el-table-column prop="typeName" label="出租类型" width="100"></el-table-column>
                <el-table-column prop="deposit" label="押金" width="100"></el-table-column>
                <el-table-column prop="mileage" label="起租里程" width="100"></el-table-column>
                <el-table-column prop="returnMileage" label="还车里程" width="100"></el-table-column>
                <el-table-column prop="rentPayable" label="应付租金" width="100"></el-table-column>
                <el-table-column prop="rentActual" label="实付租金" width="100"></el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-button type="primary" size="mini" @click="handleDetail(scope.row)">详情</el-button>
                        <el-button type="danger" v-if="scope.row.depositReturn === 0" size="mini"
                            @click="handleReturnDeposit(scope.row)">返还押金</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <el-pagination background layout="total, prev, pager, next, jumper" :current-page="start" :page-size="size"
                :total="total" @current-change="search"></el-pagination>
            <el-drawer title="订单详情" :visible.sync="drawer" :direction="direction">
                <el-main>
                    <el-form size="small" :model="orderInfo">
                        <el-form-item label="订单编号:">
                            <span>{{ orderInfo.orderNum }}</span>
                        </el-form-item>
                        <el-form-item label="车牌号码:">
                            <span>{{ orderInfo.autoNum }}</span>
                        </el-form-item>
                        <el-form-item label="客户名称:">
                            <span>{{ orderInfo.customerName }}</span>
                        </el-form-item>
                        <el-form-item label="客户电话:">
                            <span>{{ orderInfo.customerTel }}</span>
                        </el-form-item>
                        <el-form-item label="出租时间:">
                            <span>{{ orderInfo.rentalTime }}</span>
                        </el-form-item>
                        <el-form-item label="归还时间:">
                            <span>{{ orderInfo.returnTime }}</span>
                        </el-form-item>
                        <el-form-item label="出租类型:">
                            <span>{{ orderInfo.typeName }}</span>
                        </el-form-item>
                        <el-form-item label="折扣:">
                            <span>{{ orderInfo.typeDiscount }}</span>
                        </el-form-item>
                        <el-form-item label="日租金额:">
                            <span>{{ orderInfo.rent }}</span>
                        </el-form-item>
                        <el-form-item label="押金:">
                            <span>{{ orderInfo.deposit }}</span>
                        </el-form-item>
                        <el-form-item label="起租里程:">
                            <span>{{ orderInfo.mileage }}</span>
                        </el-form-item>
                        <el-form-item label="还车里程:">
                            <span>{{ orderInfo.returnMileage }}</span>
                        </el-form-item>
                        <el-form-item label="应付租金:">
                            <span>{{ orderInfo.rentPayable }}</span>
                        </el-form-item>
                        <el-form-item label="实付租金:">
                            <span>{{ orderInfo.rentActual }}</span>
                        </el-form-item>
                        <el-form-item label="押金返还状态:">
                            <span>
                                <el-tag type="danger" v-if="orderInfo.depositReturn === 0">未返还</el-tag>
                                <el-tag type="success" v-else-if="orderInfo.depositReturn === 1">已返还</el-tag>
                            </span>
                        </el-form-item>
                    </el-form>
                </el-main>
            </el-drawer>
        </el-main>
    </div>
</template>
<script>
import orderApi from '@/api/order'
export default {
    name: 'orderList',
    data() {
        return {
            orderModel: {

            },
            start: 1,
            size: 10,
            tableData: [],
            total: 0,
            drawer: false,
            direction: 'rtl',
            orderInfo: {}
        }
    },
    created() {
        this.search();
    },
    methods: {
        async search(start = 1) {
            this.start = start
            const res = await orderApi.selectAll(this.start, this.size, this.orderModel)
            if (res.success) {
                this.tableData = res.data.records
                this.total = res.data.total
            }
        },
        onSubmit() {
            this.search()
        },
        resetForm() {
            this.orderModel = {}
            this.search()
        },
        handleDetail(row) {
            this.drawer = true
            this.orderInfo = row
        },
        async handleReturnDeposit(row) {
            if (row.returnTime === null) {
                this.$notify({
                    title: '警告',
                    message: '车辆未归还，不能返还押金',
                    type: 'warning'
                });
                return
            }
            const res1 = await orderApi.returnDeposit(row.autoId)
            if (res1.success) {
                if (res1.data === 0) {
                    const res2 = await orderApi.updateStatus(row.id)
                    if (res2.success) {
                        this.$message({
                            type: 'success',
                            message: '返还成功'
                        })
                        this.search()
                    }
                } else {
                    this.$notify({
                        title: '警告',
                        message: '在出租期间有违章未处理，不能返还押金',
                        type: 'warning'
                    });
                }
            }
        }
    }
}
</script>
<style></style>