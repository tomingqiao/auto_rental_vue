<template>
    <div>
        <el-main>
            <el-form :model="customerModel" label-width="100px" :inline="true" size="small">
                <el-form-item label="客户名称:">
                    <el-input v-model="customerModel.name" placeholder="请输入客户名称"></el-input>
                </el-form-item>
                <el-form-item label="客户电话:">
                    <el-input v-model="customerModel.tel" placeholder="请输入客户电话"></el-input>
                </el-form-item>
                <el-form-item label="身份证号码:">
                    <el-input v-model="customerModel.idNum" placeholder="请输入身份证号码"></el-input>
                </el-form-item>
                <el-form-item label="性别:">
                    <el-select v-model="customerModel.gender" placeholder="请选择性别">
                        <el-option label="男" value="1"></el-option>
                        <el-option label="女" value="0"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="客户状态:">
                    <el-select v-model="customerModel.status" placeholder="请选择客户状态">
                        <el-option label="白名单" value="1"></el-option>
                        <el-option label="黑名单" value="0"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="年龄:">
                    <el-input-number :min="0" v-model="customerModel.lowAge" placeholder="请输入最低年龄"></el-input-number>
                    <el-input-number :min="0" v-model="customerModel.highAge" placeholder="请输入最高年龄"></el-input-number>
                </el-form-item>
                <el-form-item label="操作:">
                    <el-button type="primary" @click="onSubmit" :icon="getPermissionIcon('busi:customer:select')"
                        v-if="hasPermission('busi:customer:select')">查询</el-button>
                    <el-button type="warning" @click="resetForm" :icon="getPermissionIcon('busi:customer:reset')"
                        v-if="hasPermission('busi:customer:reset')">重置</el-button>
                    <el-button type="success" @click="handleCreate" :icon="getPermissionIcon('busi:customer:add')"
                        v-if="hasPermission('busi:customer:add')">新增</el-button>
                    <el-button type="danger" @click="deleteBatch" :icon="getPermissionIcon('busi:customer:delete')"
                        v-if="hasPermission('busi:customer:delete')">批量删除</el-button>
                </el-form-item>
            </el-form>
            <el-table :data="tableData" style="width: 1095px;margin-bottom: 20px" border stripe
                @selection-change="handelSelectChange">
                <el-table-column type="selection" width="55" fixed></el-table-column>
                <el-table-column label="序号" width="55" fixed>
                    <template slot-scope="scope">
                        {{ (start - 1) * size + scope.$index + 1 }}
                    </template>
                </el-table-column>
                <el-table-column prop="name" label="客户名称" width="130"></el-table-column>
                <el-table-column prop="tel" label="客户电话" width="130"></el-table-column>
                <el-table-column prop="idNum" label="身份证号码" width="150"></el-table-column>
                <el-table-column prop="age" label="年龄" width="60"></el-table-column>
                <el-table-column prop="birthday" label="出生日期" width="150"></el-table-column>
                <el-table-column prop="gender" label="性别" width="60">
                    <template slot-scope="scope">
                        <el-tag type="danger" size="normal" v-if="scope.row.gender === 1">男</el-tag>
                        <el-tag type="success" size="normal" v-if="scope.row.gender === 0">女</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="status" label="客户状态" width="100">
                    <template slot-scope="scope">
                        <el-tag type="success" size="normal" v-if="scope.row.status === 1">白名单</el-tag>
                        <el-tag type="danger" size="normal" v-if="scope.row.status === 0">黑名单</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="200">
                    <template slot-scope="scope">
                        <el-button type="primary" size="mini" @click="handleEdit(scope.row)"
                            :icon="getPermissionIcon('busi:customer:edit')"
                            v-if="hasPermission('busi:customer:edit')">编辑</el-button>
                        <el-button type="danger" size="mini" @click="handleDelete(scope.row)"
                            :icon="getPermissionIcon('busi:customer:delete')"
                            v-if="hasPermission('busi:customer:delete')">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <el-pagination background layout="total, prev, pager, next, jumper" :current-page="start" :page-size="size"
                :total="total" @current-change="search"></el-pagination>
            <el-dialog :title="titleMap[dialogStatus]" :visible.sync="dialogFormVisible">
                <el-form :model="saveCustomer" label-width="100px" :rules="rules" ref="form">
                    <el-form-item label="客户名称" prop="name">
                        <el-input v-model="saveCustomer.name" placeholder="请输入客户名称"></el-input>
                    </el-form-item>
                    <el-form-item label="客户电话" prop="tel">
                        <el-input v-model="saveCustomer.tel" placeholder="请输入客户电话"></el-input>
                    </el-form-item>
                    <el-form-item label="身份证号码" prop="idNum">
                        <el-input v-model="saveCustomer.idNum" placeholder="请输入身份证号码"
                            @change="setCustomerInfo"></el-input>
                    </el-form-item>
                    <el-form-item label="性别" prop="gender">
                        <el-radio-group v-model="saveCustomer.gender" disabled>
                            <el-radio-button label="1">男</el-radio-button>
                            <el-radio-button label="0">女</el-radio-button>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="年龄" prop="age">
                        <el-input-number :min="0" v-model="saveCustomer.age" placeholder="请输入年龄"
                            disabled></el-input-number>
                    </el-form-item>
                    <el-form-item label="出生日期" prop="birthday">
                        <el-date-picker v-model="saveCustomer.birthday" type="date" placeholder="选择日期"
                            value-format="yyyy-MM-dd" readonly></el-date-picker>
                    </el-form-item>
                    <el-form-item label="客户状态" prop="status">
                        <el-radio-group v-model="saveCustomer.status">
                            <el-radio-button label="1">白名单</el-radio-button>
                            <el-radio-button label="0">黑名单</el-radio-button>
                        </el-radio-group>
                    </el-form-item>
                </el-form>
                <div slot="footer" class="dialog-footer">
                    <el-button @click="dialogFormVisible = false">取 消</el-button>
                    <el-button type="primary" @click="dialogStatus === 'create' ? createData() : updateData()">确
                        定</el-button>
                </div>
            </el-dialog>
        </el-main>
    </div>
</template>
<script>
import customerApi from '@/api/customer';
export default {
    name: 'customerList',
    data() {
        return {
            customerModel: {
            },
            tableData: [],
            start: 1,
            size: 10,
            total: 0,
            dialogFormVisible: false,
            dialogStatus: '',
            rules: {
                name: [
                    { required: true, message: '请输入客户名称', trigger: 'blur' },
                ],
                tel: [
                    { required: true, message: '请输入客户电话', trigger: 'blur' },
                    { min: 11, max: 11, message: '手机号码长度必须为11位', trigger: 'blur' }
                ],
                idNum: [
                    { required: true, message: '请输入身份证号码', trigger: 'blur' },
                    { min: 18, max: 18, message: '身份证号码长度必须为18位', trigger: 'blur' }
                ],
                age: [
                    { required: true, message: '请输入年龄', trigger: 'blur' },
                ],
                gender: [
                    { required: true, message: '请选择性别', trigger: 'change' },
                ],
                status: [
                    { required: true, message: '请选择客户状态', trigger: 'change' },
                ],
                birthday: [
                    { required: true, message: '请选择出生日期', trigger: 'blur' }
                ],
            },
            saveCustomer: {},
            titleMap: {
                create: '新增',
                update: '编辑'
            }
        }
    },
    created() {
        this.search()
    },
    methods: {
        async search(start = 1) {
            this.start = start
            const res = await customerApi.search(this.start, this.size, this.customerModel)
            if (res.success) {
                this.tableData = res.data.records
                this.total = res.data.total
            }
        },
        onSubmit() {
            this.search()
        },
        resetForm() {
            this.customerModel = {}
            this.search()
        },
        deleteBatch() {
            if (this.multipleSelection.length === 0) {
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
                const res = await customerApi.delete(this.multipleSelection)
                if (res.success) {
                    this.$message({
                        type: 'success',
                        message: '删除成功!'
                    })
                    this.search()
                }
            })

        },
        handelSelectChange(val) {
            this.multipleSelection = []
            val.forEach(element => {
                this.multipleSelection.push(element.id)
            });
        },
        handleEdit(row) {
            this.dialogStatus = 'update'
            this.dialogFormVisible = true
            this.saveCustomer = Object.assign({}, row)
            this.$nextTick(() => {
                this.$refs['form'].clearValidate()
            })
        },
        async updateData() {
            this.$refs['form'].validate(async (valid) => {
                if (valid) {
                    const res = await customerApi.update(this.saveCustomer)
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
        async handleDelete(row) {
            this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                const res = await customerApi.delete(row.id)
                if (res.success) {
                    this.$message({
                        type: 'success',
                        message: '删除成功'
                    })
                    this.search()
                }
            })
        },
        handleCreate() {
            this.dialogStatus = 'create'
            this.dialogFormVisible = true
            this.saveCustomer = {}
            this.$nextTick(() => {
                this.$refs['form'].clearValidate()
            })
        },
        async createData() {
            this.$refs['form'].validate(async (valid) => {
                if (valid) {
                    const res = await customerApi.save(this.saveCustomer)
                    if (res.success) {
                        this.$message({
                            type: 'success',
                            message: '新增成功'
                        })
                        this.dialogFormVisible = false
                        this.search()
                    }
                }
            })
        },
        setCustomerInfo(val) {
            let idNum = val
            if (idNum.length === 18) {
                this.saveCustomer.birthday = idNum.substring(6, 10) + '-' + idNum.substring(10, 12) + '-' + idNum.substring(12, 14)
                this.saveCustomer.gender = idNum.substring(16, 17) % 2 === 0 ? 0 : 1
                this.saveCustomer.age = new Date().getFullYear() - parseInt(idNum.substring(6, 10))
            }
        }
    }
}
</script>
<style></style>