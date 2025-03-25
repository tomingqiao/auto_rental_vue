<template>
    <div>
        <el-main>
            <el-form :model="rentalTypeModel" size="small" :inline="true" label-width="100px">
                <el-form-item label="出租类型名称:">
                    <el-input v-model="rentalTypeModel.typeName" placeholder="出租类型名称"></el-input>
                </el-form-item>
                <el-form-item label="最低折扣:">
                    <el-input-number :max="1" :min="0" :step="0.01" v-model="rentalTypeModel.lowDiscount"
                        placeholder="最低折扣"></el-input-number>
                </el-form-item>
                <el-form-item label="最高折扣:">
                    <el-input-number :max="1" :min="0" :step="0.01" v-model="rentalTypeModel.highDiscount"
                        placeholder="最高折扣"></el-input-number>
                </el-form-item>
                <el-form-item label="操作:">
                    <el-button type="primary" @click="onSubmit" :icon="getPermissionIcon('busi:rentalType:select')"
                        v-if="hasPermission('busi:rentalType:select')">查询</el-button>
                    <el-button type="warning" @click="resetForm" :icon="getPermissionIcon('busi:rentalType:reset')"
                        v-if="hasPermission('busi:rentalType:reset')">重置</el-button>
                    <el-button type="success" @click="handleCreate" :icon="getPermissionIcon('busi:rentalType:add')"
                        v-if="hasPermission('busi:rentalType:add')">新增</el-button>
                    <el-button type="danger" @click="deleteBatch" :icon="getPermissionIcon('busi:rentalType:delete')"
                        v-if="hasPermission('busi:rentalType:delete')">删除选中</el-button>
                    <el-button type="primary" @click="exportExcel" :icon="getPermissionIcon('busi:rentalType:export')"
                        v-if="hasPermission('busi:rentalType:export')">导出Excel</el-button>
                </el-form-item>
            </el-form>
            <el-table :data="tableData" style="width: 885px;margin-bottom: 20px" border stripe
                @selection-change="handelSelectChange">
                <el-table-column type="selection" width="55"></el-table-column>
                <el-table-column label="序号" width="55">
                    <template slot-scope="scope">
                        {{ (start - 1) * size + scope.$index + 1 }}
                    </template>
                </el-table-column>
                <el-table-column prop="typeName" label="出租类型名称" width="150"></el-table-column>
                <el-table-column prop="typeDiscount" label="折扣" width="70"></el-table-column>
                <el-table-column prop="remark" label="备注" width="300"></el-table-column>
                <el-table-column label="操作" width="250">
                    <template slot-scope="scope">
                        <el-button type="primary" :icon="getPermissionIcon('busi:rentalType:edit')"
                            @click="handleEdit(scope.row)" v-if="hasPermission('busi:rentalType:edit')">编辑</el-button>
                        <el-button type="danger" :icon="getPermissionIcon('busi:rentalType:delete')"
                            @click="handleDelete(scope.row)"
                            v-if="hasPermission('busi:rentalType:delete')">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <el-pagination background layout="total, prev, pager, next, jumper" :current-page="start" :page-size="size"
                :total="total" @current-change="search"></el-pagination>
            <el-dialog :title="titleMap[dialogStatus]" :visible.sync="dialogFormVisible">
                <el-form :model="saveRentalType" :rules="rules" ref="form" label-width="120px">
                    <el-form-item label="出租类型名称" prop="typeName">
                        <el-input v-model="saveRentalType.typeName" placeholder="出租类型名称"></el-input>
                    </el-form-item>
                    <el-form-item label="折扣" prop="typeDiscount">
                        <el-input-number :max="1" :min="0" :step="0.01" v-model="saveRentalType.typeDiscount"
                            placeholder="折扣"></el-input-number>
                    </el-form-item>
                    <el-form-item label="备注" prop="remark">
                        <el-input type="textarea" v-model="saveRentalType.remark" placeholder="备注"></el-input>
                    </el-form-item>
                </el-form>
                <div slot="footer" class="dialog-footer">
                    <el-button @click="dialogFormVisible = false">取消</el-button>
                    <el-button type="primary"
                        @click="dialogStatus === 'create' ? createData() : updateData()">保存</el-button>
                </div>
            </el-dialog>
        </el-main>
    </div>
</template>
<script>
import rentalTypeApi from '@/api/rental_type'
import { getToken } from '@/utils/auth'
export default {
    name: 'rentalTypeList',
    data() {
        return {
            tableData: [],
            total: 0,
            start: 1,
            size: 5,
            rentalTypeModel: {
                lowDiscount: 0,
                highDiscount: 1
            },
            dialogFormVisible: false,
            dialogStatus: '',
            rules: {
                typeName: [{ required: true, message: '请输入名称', trigger: 'blur' },],
                typeDiscount: [{ required: true, message: '请输入折扣', trigger: 'blur' },
                { type: 'number', message: '请输入数字', trigger: 'blur' },
                ]
            },
            titleMap: {
                create: '新增出租类型',
                update: '修改出租类型'
            },
            multipleSelection: [],
            saveRentalType: {
            }
        }
    },
    created() {
        this.search()
    },
    methods: {
        async search(start = 1) {
            this.start = start
            const res = await rentalTypeApi.search(this.start, this.size, this.rentalTypeModel)
            if (res.success) {
                this.tableData = res.data.records
                this.total = res.data.total
            }
        },
        handleCreate() {
            this.dialogStatus = 'create'
            this.dialogFormVisible = true
            this.saveRentalType = {
                typeDiscount: 1
            }
            this.$nextTick(() => {
                this.$refs['form'].clearValidate()
            })
        },
        onSubmit() {
            this.search()
        },
        resetForm() {
            this.rentalTypeModel = {
                lowDiscount: 0,
                highDiscount: 1
            }
            this.search()
        },
        async deleteBatch() {
            if (this.multipleSelection.length === 0) {
                this.$message({
                    type: 'warning',
                    message: '请选择至少一条数据'
                })
                return
            }
            this.$confirm('此操作将永久删除该出租类型, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                const res = await rentalTypeApi.delete(this.multipleSelection)
                if (res.success) {
                    this.$message({
                        type: 'success',
                        message: '删除成功!'
                    })
                }
                this.search()

            })
        },
        async handleEdit(row) {
            this.dialogStatus = 'update'
            this.dialogFormVisible = true
            this.saveRentalType = Object.assign({}, row)
            this.$nextTick(() => {
                this.$refs['form'].clearValidate()
            })
        },
        async handleDelete(row) {
            this.$confirm('此操作将永久删除该出租类型, 是否继续?', '提示', {})
                .then(async () => {
                    const res = await rentalTypeApi.delete(row.id)
                    if (res.success) {
                        this.$message({
                            type: 'success',
                            message: '删除成功!'
                        })
                    }
                    this.search()
                })
        },
        handelSelectChange(val) {
            this.multipleSelection = []
            val.forEach(element => {
                this.multipleSelection.push(element.id)
            });
        },
        createData() {
            this.$refs['form'].validate(async (valid) => {
                if (valid) {
                    const res = await rentalTypeApi.save(this.saveRentalType)
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
                    const res = await rentalTypeApi.update(this.saveRentalType)
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
        exportExcel() {
            let url = `${process.env.VUE_APP_BASE_API}/rental/rentalType/exportExcel?token=${getToken()}`
            window.open(url)
        }
    }
}
</script>
<style></style>