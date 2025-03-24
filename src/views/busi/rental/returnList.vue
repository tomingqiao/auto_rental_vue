<template>
    <div class="app-container">
        <el-main>
            <el-form inline :model="orderModel" size="small" label-width="100px">
                <el-form-item label="订单编号:">
                    <el-input v-model="orderModel.orderNum" placeholder="请输入订单编号"></el-input>
                </el-form-item>
                <el-form-item label="车牌号码:">
                    <el-input v-model="orderModel.autoNum" placeholder="车牌号码"></el-input>
                </el-form-item>
                <el-form-item label="客户名称:">
                    <el-input v-model="orderModel.customerName" placeholder="请输入客户名称"></el-input>
                </el-form-item>
                <el-form-item label="客户电话:">
                    <el-input v-model="orderModel.customerTel" placeholder="请输入客户电话"></el-input>
                </el-form-item>
                <el-form-item label="操作:">
                    <el-button type="primary" :icon="getPermissionIcon('busi:rentalReturn:select')"
                        v-if="hasPermission('busi:rentalReturn:select')" @click="onSubmit">查询</el-button>
                    <el-button type="warning" :icon="getPermissionIcon('busi:rentalReturn:reset')"
                        v-if="hasPermission('busi:rentalReturn:reset')" @click="resetForm">重置</el-button>
                </el-form-item>
            </el-form>
            <el-table stripe border :data="tableData" style="width: 1295px;margin-bottom: 20px">
                <el-table-column prop="id" label="序号" width="50" fixed>
                    <template slot-scope="scope">
                        {{ scope.$index + 1 + (start - 1) * size }}
                    </template>
                </el-table-column>
                <el-table-column prop="orderNum" label="订单编号" width="200"></el-table-column>
                <el-table-column prop="autoNum" label="车牌号码" width="100"></el-table-column>
                <el-table-column prop="customerName" label="客户名称" width="100"></el-table-column>
                <el-table-column prop="customerTel" label="客户电话" width="110"></el-table-column>
                <el-table-column prop="rentalTime" label="出租时间" width="160"></el-table-column>
                <el-table-column prop="typeName" label="出租类型" width="100"></el-table-column>
                <el-table-column prop="typeDiscount" label="折扣" width="70"></el-table-column>
                <el-table-column prop="rent" label="日租金额" width="100"></el-table-column>
                <el-table-column prop="deposit" label="押金" width="100"></el-table-column>
                <el-table-column prop="mileage" label="起租里程" width="100"></el-table-column>
                <el-table-column label="操作" width="100">
                    <template slot-scope="scope">
                        <el-button type="primary" size="mini" @click="handleReturn(scope.row)"
                            :icon="getPermissionIcon('busi:rentalReturn:return')"
                            v-if="hasPermission('busi:rentalReturn:return')">还车</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <el-pagination background layout="total, prev, pager, next, jumper" :current-page="start" :page-size="size"
                :total="total" @current-change="search"></el-pagination>
            <el-dialog title="还车" :visible.sync="dialogVisible">
                <el-form label-width="100px" :model="saveOrder" :rules="rules" ref="form" inline>
                    <el-form-item label="订单编号">
                        <el-input v-model="saveOrder.orderNum" readonly></el-input>
                    </el-form-item>
                    <el-form-item label="车牌号码">
                        <el-input v-model="saveOrder.autoNum" readonly></el-input>
                    </el-form-item>
                    <el-form-item label="客户名称">
                        <el-input v-model="saveOrder.customerName" readonly></el-input>
                    </el-form-item>
                    <el-form-item label="客户电话">
                        <el-input v-model="saveOrder.customerTel" readonly></el-input>
                    </el-form-item>
                    <el-form-item label="出租类型">
                        <el-input v-model="saveOrder.typeName" readonly></el-input>
                    </el-form-item>
                    <el-form-item label="折扣">
                        <el-input v-model="saveOrder.typeDiscount" readonly></el-input>
                    </el-form-item>
                    <el-form-item label="日租金额">
                        <el-input v-model="saveOrder.rent" readonly></el-input>
                    </el-form-item>
                    <el-form-item label="押金">
                        <el-input v-model="saveOrder.deposit" readonly></el-input>
                    </el-form-item>
                    <el-form-item label="起租里程">
                        <el-input v-model="saveOrder.mileage" readonly></el-input>
                    </el-form-item>
                    <el-form-item label="出租时间">
                        <el-input v-model="saveOrder.rentalTime" readonly></el-input>
                    </el-form-item>
                    <el-form-item label="还车里程" prop="returnMileage">
                        <el-input-number :min="saveOrder.mileage" v-model="saveOrder.returnMileage"
                            placeholder="请输入还车里程"></el-input-number>
                    </el-form-item>
                    <el-form-item label="还车时间" prop="returnTime">
                        <el-date-picker v-model="saveOrder.returnTime" type="datetime" placeholder="选择日期时间"
                            value-format="yyyy-MM-dd HH:mm:ss" @change="countRent"></el-date-picker>
                    </el-form-item>
                    <el-form-item label="应付租金" prop="rentPayable">
                        <el-input v-model="saveOrder.rentPayable" readonly></el-input>
                    </el-form-item>
                    <el-form-item label="实付租金" prop="rentActual">
                        <el-input v-model="saveOrder.rentActual" readonly></el-input>
                    </el-form-item>
                </el-form>
                <div slot="footer" class="dialog-footer">
                    <el-button @click="dialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="returnAuto">还车</el-button>
                </div>
            </el-dialog>
        </el-main>
    </div>
</template>
<script>
import orderApi from '@/api/order'
export default {
    name: 'returnList',
    data() {
        return {
            orderModel: {

            },
            tableData: [],
            total: 0,
            start: 1,
            size: 10,
            saveOrder: {
            },
            dialogVisible: false,
            rules: {
                returnMileage: [
                    { required: true, message: '请输入还车里程', trigger: 'blur' },
                ],
                returnTime: [
                    { required: true, message: '请选择还车时间', trigger: 'change' },
                ],
                rentPayable: [
                    { required: true, message: '还车时间请大于出租时间', trigger: 'blur' },
                ],
                rentActual: [
                    { required: true, message: '还车时间请大于出租时间', trigger: 'blur' },
                ],
            },
        }
    },
    created() {
        this.search()
    },
    methods: {
        async search(start = 1) {
            this.start = start
            const res = await orderApi.selectUnfinished(this.start, this.size, this.orderModel)
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
        handleReturn(row) {
            this.saveOrder = Object.assign({}, row)
            this.dialogVisible = true
            this.saveOrder.returnTime = this.getNowDate()
            this.countRent()
            this.$nextTick(() => {
                this.$refs['form'].clearValidate()
            })
        },
        getNowDate() {
            const date = new Date();
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始，需要+1
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');
            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        },
        countRent() {
            const rentalTime = new Date(this.saveOrder.rentalTime)
            const returnTime = new Date(this.saveOrder.returnTime)
            if (returnTime > rentalTime) {
                let days = Math.abs(returnTime.getTime() - rentalTime.getTime())
                days = Math.ceil(days / (24 * 3600 * 1000))
                this.saveOrder.rentPayable = days * this.saveOrder.rent
                this.saveOrder.rentActual = parseInt(this.saveOrder.rentPayable * this.saveOrder.typeDiscount)
            }
            else {
                this.saveOrder.rentPayable = null
                this.saveOrder.rentActual = null
            }
        },
        returnAuto() {
            this.$refs['form'].validate(async valid => {
                if (valid) {
                    const res = await orderApi.updateOrder(this.saveOrder)
                    if (res.success) {
                        this.dialogVisible = false
                        this.$message({
                            type: 'success',
                            message: '归还成功'
                        })
                        this.search()
                    }
                }
            })
        }
    }
}
</script>
<style></style>