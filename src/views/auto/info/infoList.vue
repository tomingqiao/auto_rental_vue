<template>
    <div>
        <el-main>
            <el-form :model="autoInfoModel" size="small" :inline="true">
                <el-form-item label="厂商名称">
                    <el-select v-model="autoInfoModel.makerId" placeholder="请选择厂商名称"
                        @change="handleMakerChange(autoInfoModel.makerId)">
                        <el-option v-for="item in makerList" :key="item.id" :label="item.name" :value="item.id">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="品牌名称" v-if="autoInfoModel.makerId">
                    <el-select v-model="autoInfoModel.brandId" placeholder="请选择品牌名称">
                        <el-option v-for="item in brandList" :key="item.id" :label="item.brandName" :value="item.id">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="车牌号码">
                    <el-input v-model="autoInfoModel.autoNum" placeholder="请输入车牌号码"></el-input>
                </el-form-item>
                <el-form-item label="车辆类型">
                    <el-select v-model="autoInfoModel.infoType" placeholder="请选择车辆类型">
                        <el-option v-for="item in autoTypeList" :key="item.id" :label="item.name" :value="item.id">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="车辆状态">
                    <el-select v-model="autoInfoModel.status" placeholder="请选择车辆状态">
                        <el-option v-for="item in autoStatusList" :key="item.id" :label="item.name" :value="item.id">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="租金">
                    <el-input-number v-model="autoInfoModel.lowRent" :min="0" placeholder="最低租金"></el-input-number>
                    <el-input-number v-model="autoInfoModel.highRent" :min="0" placeholder="最高租金"></el-input-number>
                </el-form-item>
                <el-form-item label="上牌日期">
                    <el-date-picker v-model="autoInfoModel.registrationDateVal" type="daterange" align="right"
                        unlink-panels range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"
                        :picker-options="pickerOptions" value-format="yyyy-MM-dd">
                    </el-date-picker>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" icon="el-icon-search" size="small" @click="onSubmit">查询</el-button>
                    <el-button type="warning" icon="el-icon-refresh" size="small" @click="resetForm">重置</el-button>
                    <el-button type="success" icon="el-icon-plus" size="small" @click="handleCreate">新增</el-button>
                    <el-button type="danger" icon="el-icon-delete" size="small" @click="deleteBatch">批量删除</el-button>
                </el-form-item>
            </el-form>
            <el-table :data="autoInfoList" stripe border style="width: 100%;margin-bottom: 20px"
                @selection-change="handleSelectionChange">
                <el-table-column type="selection" width="40"></el-table-column>
                <el-table-column prop="id" label="序号" width="50">
                    <template slot-scope="scope">
                        {{ scope.$index + 1 + (start - 1) * size }}
                    </template>
                </el-table-column>
                <el-table-column prop="autoNum" label="车牌号码"></el-table-column>
                <el-table-column prop="makerName" label="厂商名称"></el-table-column>
                <el-table-column prop="brandName" label="品牌名称"></el-table-column>
                <el-table-column prop="infoType" label="车辆类型">
                    <template slot-scope="scope">
                        <el-tag :type="colorList[item.id]" v-for="item in autoTypeList" :key="item.id"
                            v-if="scope.row.infoType == item.id">{{
                                item.name }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="status" label="车辆状态">
                    <template slot-scope="scope">
                        <el-tag :type="colorList[item.id]" v-for="item in autoStatusList" :key="item.id"
                            v-if="scope.row.status == item.id">{{
                                item.name }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="registrationDate" label="上牌日期"></el-table-column>
                <el-table-column prop="color" label="颜色">
                    <template slot-scope="scope">
                        <el-color-picker v-model="scope.row.color" disabled></el-color-picker>
                    </template>
                </el-table-column>
                <el-table-column prop="displacement" label="排量">
                    <template slot-scope="scope">
                        {{ scope.row.displacement }}{{ scope.row.unit }}
                    </template>
                </el-table-column>
                <el-table-column prop="mileage" label="行驶里程"> </el-table-column>
                <el-table-column prop="rent" label="租金"></el-table-column>
                <el-table-column prop="deposit" label="押金"></el-table-column>
                <el-table-column prop="pic" label="车辆图片">
                    <template slot-scope="scope">
                        <el-image :src="scope.row.pic" style="width: 70px; height: 50px"></el-image>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="200">
                    <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit" size="small"
                            @click="handleEdit(scope.row)">修改</el-button>
                        <el-button type="danger" icon="el-icon-delete" size="small"
                            @click="handleDelete(scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <el-pagination background @current-change="search" :current-page="start" :page-size="size"
                layout="total,  prev, pager, next, jumper" :total="total"></el-pagination>
            <el-dialog :title="titleMap[dialogStatus]" :visible.sync="dialogFormVisible">
                <el-form :model="saveAutoInfo" label-width="100px" ref="form" :rules="rules" :inline="true">
                    <el-form-item label="车牌号码" prop="autoNum">
                        <el-input v-model="saveAutoInfo.autoNum" placeholder="请输入车牌号码"></el-input>
                    </el-form-item>
                    <el-form-item label="厂商名称" prop="makerId">
                        <el-select v-model="saveAutoInfo.makerId" placeholder="请选择厂商名称"
                            @change="handleMakerChange2(saveAutoInfo.makerId)">
                            <el-option v-for="item in makerList" :key="item.id" :label="item.name" :value="item.id">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="品牌名称" v-if="saveAutoInfo.makerId" prop="brandId">
                        <el-select v-model="saveAutoInfo.brandId" placeholder="请选择品牌名称">
                            <el-option v-for="item in brandList2" :key="item.id" :label="item.brandName"
                                :value="item.id">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="车辆类型" prop="infoType">
                        <el-select v-model="saveAutoInfo.infoType" placeholder="请选择车辆类型">
                            <el-option v-for="item in autoTypeList" :key="item.id" :label="item.name" :value="item.id">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="车辆状态" prop="status">
                        <el-select v-model="saveAutoInfo.status" placeholder="请选择车辆状态">
                            <el-option v-for="item in autoStatusList" :key="item.id" :label="item.name"
                                :value="item.id"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="租金" prop="rent">
                        <el-input-number :min="0" v-model="saveAutoInfo.rent" placeholder="请输入租金"></el-input-number>
                    </el-form-item>
                    <el-form-item label="上牌日期" prop="registrationDate">
                        <el-date-picker v-model="saveAutoInfo.registrationDate" type="date" placeholder="选择日期"
                            value-format="yyyy-MM-dd"></el-date-picker>
                    </el-form-item>
                    <el-form-item label="行驶里程" prop="mileage">
                        <el-input-number :min="0" v-model="saveAutoInfo.mileage"
                            placeholder="请输入行驶里程"></el-input-number>
                    </el-form-item>
                    <el-form-item label="排量" prop="displacement">
                        <el-input-number :min="0" :step="0.1" v-model="saveAutoInfo.displacement"
                            placeholder="请输入排量"></el-input-number>
                    </el-form-item>
                    <el-form-item label="单位" prop="unit">
                        <el-radio-group v-model="saveAutoInfo.unit">
                            <el-radio-button label="L">L</el-radio-button>
                            <el-radio-button label="T">T</el-radio-button>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="押金" prop="deposit">
                        <el-input-number :min="0" v-model="saveAutoInfo.deposit" placeholder="请输入押金"></el-input-number>
                    </el-form-item>
                    <el-form-item label="车辆图片" prop="pic">
                        <el-input v-model="saveAutoInfo.pic" placeholder="请输入车辆图片"></el-input>
                    </el-form-item>
                    <el-form-item label="颜色" prop="color">
                        <el-color-picker v-model="saveAutoInfo.color"></el-color-picker>
                    </el-form-item>
                </el-form>
                <div slot="footer">
                    <el-button @click="dialogFormVisible = false">取 消</el-button>
                    <el-button type="primary" @click="dialogStatus === 'create' ? createData() : updateData()">确
                        定</el-button>
                </div>
            </el-dialog>
        </el-main>
    </div>
</template>
<script>
import autoInfoApi from '@/api/auto_info'
import makerApi from '@/api/auto_maker'
import brandApi from '@/api/auto_brand'
export default {
    name: 'autoInfoList',
    data() {
        return {
            autoInfoList: [],
            total: 0,
            start: 1,
            size: 5,
            autoInfoModel: {

            },
            makerList: [],
            brandList: [],
            colorList: [
                'success',
                'primary',
                'warning',
                'danger',
            ],
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
            saveAutoInfo: {

            },
            dialogFormVisible: false,
            dialogStatus: '',
            rules: {
                autoNum: [
                    { required: true, message: '请输入车牌号码', trigger: 'blur' }
                ],
                makerId: [
                    { required: true, message: '请选择厂商', trigger: 'change' }
                ],
                brandId: [
                    { required: true, message: '请选择品牌', trigger: 'change' }
                ],
                infoType: [
                    { required: true, message: '请选择车辆类型', trigger: 'change' }
                ],
                status: [
                    { required: true, message: '请选择车辆状态', trigger: 'change' }
                ],
                rent: [
                    { required: true, message: '请输入租金', trigger: 'blur' }
                ],
                registrationDate: [
                    { required: true, message: '请选择上牌日期', trigger: 'change' }
                ],
                displacement: [
                    { required: true, message: '请输入排量', trigger: 'blur' }
                ],
                mileage: [
                    { required: true, message: '请输入行驶里程', trigger: 'blur' }
                ],
                deposit: [
                    { required: true, message: '请输入押金', trigger: 'blur' }
                ],
                unit: [
                    { required: true, message: '请输入单位', trigger: 'blur' }
                ],
            },
            titleMap: {
                create: '新增',
                update: '编辑'
            },
            multipleSelection: [],
            brandList2: []
        }
    },
    created() {
        this.search()
        this.selectMaker()
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
        async handleMakerChange(val) {
            const res = await brandApi.selectByMakerId(val)
            if (res.success) {
                this.brandList = res.data
            }
        },
        async handleMakerChange2(val) {
            const res = await brandApi.selectByMakerId(val)
            if (res.success) {
                this.brandList2 = res.data
            }
        },
        handleCreate() {
            this.saveAutoInfo = {}
            this.dialogStatus = 'create'
            this.dialogFormVisible = true
            this.$nextTick(() => {
                this.$refs['form'].clearValidate()
            })
        },
        onSubmit() {
            this.search()
        },
        resetForm() {
            this.autoInfoModel = {}
            this.search()
        },
        async deleteBatch() {
            if (this.multipleSelection.length == 0) {
                this.$message({
                    type: 'warning',
                    message: '请选择要删除的数据'
                })
                return
            }
            this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                const res = await autoInfoApi.delete(this.multipleSelection)
                if (res.success) {
                    this.$message({
                        type: 'success',
                        message: '删除成功!'
                    })
                    this.search()
                }
            })
        },
        handleSelectionChange(val) {
            this.multipleSelection = []
            val.forEach(element => {
                this.multipleSelection.push(element.id)
            });
        },
        async handleDelete(row) {
            this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                const res = await autoInfoApi.delete(row.id)
                if (res.success) {
                    this.$message({
                        type: 'success',
                        message: '删除成功!'
                    })
                    this.search()
                }
            })
        },
        async handleEdit(row) {
            this.dialogFormVisible = true
            this.dialogStatus = 'update'
            this.handleMakerChange2(row.makerId)
            this.saveAutoInfo = Object.assign({}, row)
            this.$nextTick(() => {
                this.$refs['form'].clearValidate()
            })
        },
        createData() {
            this.$refs['form'].validate(async (valid) => {
                if (valid) {
                    const res = await autoInfoApi.save(this.saveAutoInfo)
                    if (res.success) {
                        this.$message({
                            type: 'success',
                            message: '保存成功'
                        })
                        this.dialogFormVisible = false
                        this.search()
                    }
                }
            })
        },
        updateData() {
            this.$refs['form'].validate(async (valid) => {
                if (valid) {
                    const res = await autoInfoApi.update(this.saveAutoInfo)
                    if (res.success) {
                        this.$message({
                            type: 'success',
                            message: '修改成功'
                        })
                        this.dialogFormVisible = false
                        this.search()
                    }
                }
            })
        },
    }
}
</script>
<style></style>