<template>
    <div>
        <el-main>
            <el-form inline :model="autoInfoModel" size="small" label-width="100px">
                <el-form-item label="厂商名称:">
                    <el-select v-model="autoInfoModel.makerId" placeholder="请选择厂商名称"
                        @change="handleMakerChange(autoInfoModel.makerId)">
                        <el-option v-for="item in makerList" :key="item.id" :label="item.name" :value="item.id">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="品牌名称:" v-if="autoInfoModel.makerId">
                    <el-select v-model="autoInfoModel.brandId" placeholder="请选择品牌名称">
                        <el-option v-for="item in brandList" :key="item.id" :label="item.brandName" :value="item.id">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="车牌号码:">
                    <el-input v-model="autoInfoModel.autoNum" placeholder="请输入车牌号码"></el-input>
                </el-form-item>
                <el-form-item label="车辆类型:">
                    <el-select v-model="autoInfoModel.infoType" placeholder="请选择车辆类型">
                        <el-option v-for="item in autoTypeList" :key="item.id" :label="item.name" :value="item.id">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="租金:">
                    <el-input-number v-model="autoInfoModel.lowRent" :min="0" placeholder="最低租金"></el-input-number>
                    <el-input-number v-model="autoInfoModel.highRent" :min="0" placeholder="最高租金"></el-input-number>
                </el-form-item>
                <el-form-item label="上牌日期:">
                    <el-date-picker v-model="autoInfoModel.registrationDateVal" type="daterange" align="right"
                        unlink-panels range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"
                        :picker-options="pickerOptions" value-format="yyyy-MM-dd">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="操作:">
                    <el-button type="primary" :icon="getPermissionIcon('busi:rental:select')" size="small"
                        v-if="hasPermission('busi:rental:select')" @click="onSubmit">查询</el-button>
                    <el-button type="warning" :icon="getPermissionIcon('busi:rental:reset')" size="small"
                        @click="resetForm" v-if="hasPermission('busi:rental:reset')">重置</el-button>
                </el-form-item>
            </el-form>
            <el-table :data="autoInfoList" stripe border style="width: 1195px;margin-bottom: 20px">
                <el-table-column prop="id" label="序号" width="50" fixed>
                    <template slot-scope="scope">
                        {{ scope.$index + 1 + (start - 1) * size }}
                    </template>
                </el-table-column>
                <el-table-column prop="autoNum" label="车牌号码" width="100"></el-table-column>
                <el-table-column prop="makerName" label="厂商名称" width="100"></el-table-column>
                <el-table-column prop="brandName" label="品牌名称" width="100"></el-table-column>
                <el-table-column prop="infoType" label="车辆类型" width="100">
                    <template slot-scope="scope">
                        <el-tag v-for="item in autoTypeList" :key="item.id" v-if="scope.row.infoType == item.id">{{
                            item.name }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="registrationDate" label="上牌日期" width="120"></el-table-column>
                <el-table-column prop="color" label="颜色" width="60">
                    <template slot-scope="scope">
                        <el-color-picker v-model="scope.row.color" disabled></el-color-picker>
                    </template>
                </el-table-column>
                <el-table-column prop="displacement" label="排量" width="60">
                    <template slot-scope="scope">
                        {{ scope.row.displacement }}{{ scope.row.unit }}
                    </template>
                </el-table-column>
                <el-table-column prop="mileage" label="行驶里程" width="100"> </el-table-column>
                <el-table-column prop="rent" label="租金" width="100"></el-table-column>
                <el-table-column prop="deposit" label="押金" width="100"></el-table-column>
                <el-table-column prop="pic" label="车辆图片" width="100">
                    <template slot-scope="scope">
                        <el-image :src="scope.row.pic" style="width: 70px; height: 50px"></el-image>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="100">
                    <template slot-scope="scope">
                        <el-button type="primary" :icon="getPermissionIcon('busi:rental:rental')" size="small"
                            v-if="hasPermission('busi:rental:rental')" @click="handleRental(scope.row)">出租</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <el-pagination background @current-change="search" :current-page="start" :page-size="size"
                layout="total,  prev, pager, next, jumper" :total="total"></el-pagination>
            <el-dialog title="车辆信息" :visible.sync="dialogRentalVisible">
                <el-form :model="saveAutoInfo" label-width="100px" ref="autoInfoForm" :rules="rules" inline>
                    <el-form-item label="车牌号码" prop="autoNum">
                        <el-input v-model="saveAutoInfo.autoNum" placeholder="请输入车牌号码" readonly></el-input>
                    </el-form-item>
                    <el-form-item label="厂商名称" prop="makerId">
                        <el-input v-model="saveAutoInfo.makerName" placeholder="请输入厂商名称" readonly></el-input>
                    </el-form-item>
                    <el-form-item label="品牌名称" v-if="saveAutoInfo.makerId" prop="brandId">
                        <el-input v-model="saveAutoInfo.brandName" placeholder="请输入品牌名称" readonly></el-input>
                    </el-form-item>
                    <el-form-item label="车辆类型" prop="infoType">
                        <el-input value="燃油车" v-if="saveAutoInfo.infoType == 0" readonly> </el-input>
                        <el-input value="电动车" v-if="saveAutoInfo.infoType == 1" readonly> </el-input>
                        <el-input value="混动车" v-if="saveAutoInfo.infoType == 2" readonly> </el-input>
                    </el-form-item>
                    <el-form-item label="排量" prop="displacement">
                        <el-input v-model="saveAutoInfo.displacement" placeholder="请输入排量" readonly></el-input>
                    </el-form-item>
                    <el-form-item label="单位" prop="unit">
                        <el-input v-model="saveAutoInfo.unit" readonly></el-input>
                    </el-form-item>
                    <el-form-item label="上牌日期" prop="registrationDate">
                        <el-input v-model="saveAutoInfo.registrationDate" readonly></el-input>
                    </el-form-item>
                    <el-form-item label="出租类型" prop="typeId">
                        <el-select v-model="saveAutoInfo.typeId" placeholder="请选择出租类型">
                            <el-option v-for="item in rentalTypeList" :key="item.id" :label="item.typeName"
                                :value="item.id">
                                <span>{{ item.typeName }}</span>
                                <span style="color:red;float:right">折扣：{{ item.typeDiscount }}</span>
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="行驶里程" prop="mileage">
                        <el-input-number :min="0" v-model="saveAutoInfo.mileage"
                            placeholder="请输入行驶里程"></el-input-number>
                    </el-form-item>
                    <el-form-item label="租金" prop="rent">
                        <el-input-number :min="0" v-model="saveAutoInfo.rent" placeholder="请输入租金"></el-input-number>
                    </el-form-item>
                    <el-form-item label="押金" prop="deposit">
                        <el-input-number :min="0" v-model="saveAutoInfo.deposit" placeholder="请输入押金"></el-input-number>
                    </el-form-item>
                    <el-form-item label="车辆图片" prop="pic">
                        <el-image :src="saveAutoInfo.pic" style="width: 70px; height: 50px"></el-image>
                    </el-form-item>
                    <el-form-item label="颜色" prop="color">
                        <el-color-picker v-model="saveAutoInfo.color" disabled></el-color-picker>
                    </el-form-item>
                </el-form>
                <div slot="footer" class="dialog-footer">
                    <el-button @click="dialogRentalVisible = false">取 消</el-button>
                    <el-button type="primary" @click="doNext">下一步</el-button>
                </div>
            </el-dialog>
            <el-dialog title="客户信息" :visible.sync="dialogCustomerVisible">
                <el-form :model="saveCustomer" label-width="100px" :rules="rules" ref="customerForm" inline>
                    <el-form-item label="客户电话" prop="tel">
                        <el-input v-model="saveCustomer.tel" placeholder="请输入客户电话" @change="setCustomerInfo"></el-input>
                    </el-form-item>
                    <el-form-item label="客户名称" prop="name">
                        <el-input v-model="saveCustomer.name" readonly></el-input>
                    </el-form-item>
                    <el-form-item label="身份证号码" prop="idNum">
                        <el-input v-model="saveCustomer.idNum" readonly></el-input>
                    </el-form-item>
                    <el-form-item label="性别" prop="gender">
                        <el-input value="男" v-if="saveCustomer.gender == 1" readonly></el-input>
                        <el-input value="女" v-else-if="saveCustomer.gender == 0" readonly></el-input>
                        <el-input value="" v-else readonly></el-input>
                    </el-form-item>
                    <el-form-item label="年龄" prop="age">
                        <el-input v-model="saveCustomer.age" readonly></el-input>
                    </el-form-item>
                    <el-form-item label="出生日期" prop="birthday">
                        <el-input v-model="saveCustomer.birthday" readonly></el-input>
                    </el-form-item>
                    <el-form-item label="客户状态" prop="status">
                        <el-input value="白名单" v-if="saveCustomer.status == 1" readonly></el-input>
                        <el-input value="黑名单" v-else-if="saveCustomer.status == 0" readonly></el-input>
                        <el-input value="" v-else readonly></el-input>
                    </el-form-item>
                </el-form>
                <div slot="footer" class="dialog-footer">
                    <el-button @click="dialogCustomerVisible = false">取 消</el-button>
                    <el-button type="primary"
                        @click="dialogCustomerVisible = false; dialogRentalVisible = true">上一步</el-button>
                    <el-button type="primary" @click="createOrder">提交订单</el-button>
                </div>
            </el-dialog>
        </el-main>
    </div>
</template>
<script>
import autoInfoApi from '@/api/auto_info'
import makerApi from '@/api/auto_maker'
import brandApi from '@/api/auto_brand'
import rentalTypeApi from '@/api/rental_type'
import customerApi from '@/api/customer'
import orderApi from '@/api/order'
export default {
    name: 'rentalList',
    data() {
        return {
            autoInfoModel: {
                status: 0
            },
            makerList: [],
            brandList: [],
            autoTypeList: [
                { id: 0, name: '燃油车' },
                { id: 1, name: '电动车' },
                { id: 2, name: '混动车' },
            ],
            autoStatusList: [
                { id: 0, name: '未租' },
                { id: 1, name: '已租' },
                { id: 2, name: '维保' },
                { id: 3, name: '自用' },
            ],
            pickerOptions: {
                shortcuts: [{
                    text: '最近一周',
                    onClick(picker) {
                        const end = new Date();
                        const start = new Date();
                        start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                        picker.$emit('pick', [start, end]);
                    }
                }, {
                    text: '最近一个月',
                    onClick(picker) {
                        const end = new Date();
                        const start = new Date();
                        start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                        picker.$emit('pick', [start, end]);
                    }
                }, {
                    text: '最近三个月',
                    onClick(picker) {
                        const end = new Date();
                        const start = new Date();
                        start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
                        picker.$emit('pick', [start, end]);
                    }
                }]
            },
            autoInfoList: [],
            start: 1,
            size: 10,
            total: 0,
            dialogRentalVisible: false,
            saveAutoInfo: {
            },
            rules: {
                mileage: [
                    { required: true, message: '请输入行驶里程', trigger: 'blur' },
                ],
                rent: [
                    { required: true, message: '请输入租金', trigger: 'blur' },
                ],
                deposit: [
                    { required: true, message: '请输入押金', trigger: 'blur' },
                ],
                typeId: [
                    { required: true, message: '请选择出租类型', trigger: 'change' },
                ],
                tel: [
                    { required: true, message: '请输入客户电话', trigger: 'blur' },
                    {
                        async validator(rule, value, callback) {
                            // 验证手机号格式
                            const phonePattern = /^1[3-9]\d{9}$/;
                            if (!phonePattern.test(value)) {
                                return callback('请输入正确的手机号');
                            }
                            try {
                                const res = await customerApi.selectByTel(value);
                                // 严格检查 API 响应
                                if (res && res.success && res.data) {
                                    callback(); // 验证通过
                                } else {
                                    callback('该客户不存在，请先添加客户');
                                }
                            } catch (error) {
                                console.error('API 请求失败:', error);
                                callback('系统繁忙，请稍后再试');
                            }
                        }
                    }
                ],
            },
            brandList2: [],
            rentalTypeList: [],
            saveOrder: {

            },
            dialogCustomerVisible: false,
            saveCustomer: {

            }
        }
    },
    created() {
        this.selectMaker()
        this.search()
        this.selectRentalType()
    },
    methods: {
        async search(start = 1) {
            this.start = start
            if (this.autoInfoModel.registrationDateVal != undefined) {
                this.autoInfoModel.lowRegistrationDate = this.autoInfoModel.registrationDateVal[0]
                this.autoInfoModel.highRegistrationDate = this.autoInfoModel.registrationDateVal[1]
            }
            const res = await autoInfoApi.search(this.start, this.size, this.autoInfoModel)
            if (res.success) {
                this.autoInfoList = res.data.records
                this.total = res.data.total
            }
        },
        async selectMaker() {
            const res = await makerApi.selectAll()
            if (res.success) {
                this.makerList = res.data
            }
        },
        async selectRentalType() {
            const res = await rentalTypeApi.selectAll()
            if (res.success) {
                this.rentalTypeList = res.data
            }
        },
        onSubmit() {
            this.search()
        },
        resetForm() {
            this.autoInfoModel = {
                status: 0
            }
            this.search()
        },
        async handleMakerChange(val) {
            if (val) {
                const res = await brandApi.selectByMakerId(val)
                if (res.success) {
                    this.brandList = res.data
                }
            } else {
                this.brandList = []
            }
        },
        handleRental(row) {
            this.saveAutoInfo = Object.assign({}, row)
            this.dialogRentalVisible = true
            this.$nextTick(() => {
                this.$refs['autoInfoForm'].clearValidate()
            })
            this.saveCustomer = {}
        },
        doNext() {
            this.$refs['autoInfoForm'].validate(async (valid) => {
                if (valid) {
                    this.saveOrder = {
                        autoId: this.saveAutoInfo.id,
                        typeId: this.saveAutoInfo.typeId,
                        rent: this.saveAutoInfo.rent,
                        deposit: this.saveAutoInfo.deposit,
                        mileage: this.saveAutoInfo.mileage,
                    }
                    this.dialogRentalVisible = false
                    this.dialogCustomerVisible = true
                    this.$nextTick(() => {
                        this.$refs['customerForm'].clearValidate()
                    })
                }
            })
        },
        createOrder() {
            this.$refs['customerForm'].validate(async (valid) => {
                if (valid) {
                    this.saveOrder.customerId = this.saveCustomer.id
                    const res = await orderApi.save(this.saveOrder)
                    if (res.success) {
                        this.dialogCustomerVisible = false
                        this.$message({
                            type: 'success',
                            message: '下单成功'
                        })
                        this.search()
                    }
                }
            })
        },
        async setCustomerInfo(val) {
            this.$refs.customerForm.validate(async (valid) => {
                if (valid) {
                    const res = await customerApi.selectByTel(val);
                    // 严格检查 API 响应
                    if (res && res.success && res.data) {
                        this.saveCustomer = res.data;
                    }
                }
                else {
                    this.saveCustomer = {
                        tel: val
                    };
                }
            })
        },
    }
}
</script>
<style scoped></style>
