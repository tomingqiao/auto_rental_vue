<template>
    <div>
        <el-main>
            <!--查询表单-->
            <el-form :inline="true" :model="deptModel" size="small" label-width="100px">
                <el-form-item label="部门名称:">
                    <el-input v-model="deptModel.deptName" placeholder="请输入部门名称"></el-input>
                </el-form-item>
                <el-form-item label="操作:">
                    <el-button type="primary" :icon="getPermissionIcon('sys:dept:select')"
                        v-if="hasPermission('sys:dept:select')" @click="onSubmit">查询</el-button>
                    <el-button type="warning" :icon="getPermissionIcon('sys:dept:reset')"
                        v-if="hasPermission('sys:dept:reset')" @click="resetForm">重置</el-button>
                    <el-button type="success" :icon="getPermissionIcon('sys:dept:add')"
                        v-if="hasPermission('sys:dept:add')" @click="handleCreate">新增</el-button>
                </el-form-item>
            </el-form>
            <!--表单结束-->
            <!--数据表格-->
            <el-table :data="tableData" style="width:1105px;margin-bottom: 20px" border stripe
                :tree-props="{ children: 'children', hasChildren: 'hasChildren' }" default-expand-all row-key="id">
                <el-table-column prop="deptName" label="部门名称" width="200" fixed>
                </el-table-column>
                <el-table-column prop="parentName" label="上级部门名称" width="200">
                </el-table-column>
                <el-table-column prop="phone" label="部门电话" width="200">
                </el-table-column>
                <el-table-column prop="address" label="部门地址" width="300">
                </el-table-column>
                <el-table-column label="操作" width="200">
                    <template slot-scope="scope">
                        <el-button type="primary" :icon="getPermissionIcon('sys:dept:edit')" size="mini"
                            v-if="hasPermission('sys:dept:edit')" @click="handleEdit(scope.row)">编辑</el-button>
                        <el-button type="danger" :icon="getPermissionIcon('sys:dept:delete')" size="mini"
                            v-if="hasPermission('sys:dept:delete')" @click="handleDelete(scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <!--表格结束-->
            <!--对话框-->
            <el-dialog :title="titleMap[dialogStatus]" :visible.sync="dialogFormVisible">
                <el-form :model="saveDept" ref="form" :rules="rules" label-width="120px">
                    <el-form-item label="上级部门名称:" prop="parentName">
                        <el-input v-model="saveDept.parentName" autocomplete="off" readonly
                            @click.native="selectDept"></el-input>
                    </el-form-item>
                    <el-form-item label="部门名称：" prop="deptName">
                        <el-input v-model="saveDept.deptName" autocomplete="off"></el-input>
                    </el-form-item>
                    <el-form-item label="部门电话：" prop="phone">
                        <el-input v-model="saveDept.phone" autocomplete="off"></el-input>
                    </el-form-item>
                    <el-form-item label="部门地址：" prop="address">
                        <el-input v-model="saveDept.address" autocomplete="off"></el-input>
                    </el-form-item>
                    <el-form-item label="部门排序：" prop="orderNum">
                        <el-input-number v-model="saveDept.orderNum" autocomplete="off"></el-input-number>
                    </el-form-item>
                </el-form>
                <div slot="footer" class="dialog-footer">
                    <el-button @click="dialogFormVisible = false">取 消</el-button>
                    <el-button type="primary" @click="dialogStatus === 'create' ? createData() : updateData()">确
                        定</el-button>
                </div>
            </el-dialog>
            <!--对话框结束-->
            <el-dialog title="请选择上级部门" :visible.sync="dialogTreeVisible">
                <el-tree :data="treeData" :props="defaultProps" @node-click="handleNodeClick" default-expand-all
                    empty-text="未获取到部门数据" highlight-current :expand-on-click-node="false"></el-tree>
                <div slot="footer" class="dialog-footer">
                    <el-button @click="closeTree">取 消</el-button>
                    <el-button type="primary" @click="handleTreeConfirm">确
                        定</el-button>
                </div>
            </el-dialog>

        </el-main>
    </div>
</template>
<script>
import deptApi from "@/api/dept"
export default {
    name: 'deptList',
    data() {
        return {
            deptModel: {
                deptName: ''
            },
            tableData: [],
            saveDept: {

            },
            multipleSelection: [],
            dialogStatus: '',
            dialogFormVisible: false,
            titleMap: {
                create: '新增部门',
                update: '修改部门'
            },
            parentDeptList: [],
            rules: {
                deptName: [
                    { required: true, message: '请输入部门名称', trigger: 'blur' },
                ],
                parentName: [
                    { required: true, message: '请选择上级部门名称', trigger: 'blur' },
                ]
            },
            dialogTreeVisible: false,
            treeData: [],
            defaultProps: {
                label: 'deptName',
                children: 'children',
            },
            selectParentDept: {
            },
        }
    },
    created() {
        this.search()
    },
    methods: {
        async search() {
            const res = await deptApi.search(this.deptModel)
            if (res.success) {
                this.tableData = res.data
            }
        },
        onSubmit() {
            this.search()
        },
        resetForm() {
            this.deptModel = {}
            this.search()
        },
        handleCreate() {
            this.saveDept = {}
            this.dialogStatus = 'create'
            this.dialogFormVisible = true
            this.$nextTick(() => {
                this.$refs['form'].clearValidate()
            })
        },
        handleEdit(row) {
            this.dialogStatus = 'update'
            this.dialogFormVisible = true
            this.saveDept = {
                id: row.id,
                pid: row.pid,
                deptName: row.deptName,
                parentName: row.parentName,
                phone: row.phone,
                address: row.address,
                orderNum: row.orderNum
            }
            this.$nextTick(() => {
                this.$refs['form'].clearValidate()
            })
        },
        async handleDelete(row) {
            const res = await deptApi.hasChildren(row.id)
            if (res.message === '有子部门') {
                this.$message({
                    type: 'warning',
                    message: '该部门存在子部门，不能删除'
                })
            } else {
                this.$confirm('确认删除吗？', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(async () => {
                    const res = await deptApi.delete(row.id)
                    if (res.success) {
                        this.$message({
                            type: 'success',
                            message: '删除成功!'
                        })
                        this.search()
                    }
                }).catch(err => {
                    console.log(err)
                })
            }
        },
        createData() {
            this.$refs['form'].validate(async (valid) => {
                if (valid) {
                    const res = await deptApi.save(this.saveDept)
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
                    const res = await deptApi.update(this.saveDept)
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
        handleNodeClick(val) {
            this.selectParentDept = val
        },
        handleTreeConfirm() {
            this.saveDept.pid = this.selectParentDept.id
            this.saveDept.parentName = this.selectParentDept.deptName
            this.dialogTreeVisible = false
            this.$refs['form'].clearValidate("parentName")
        },
        closeTree() {
            this.dialogTreeVisible = false
            if (this.saveDept.pid != null) {
                this.$refs['form'].clearValidate("parentName")
            }
        },
        async selectDept() {
            this.dialogTreeVisible = true
            const res = await deptApi.selectTree()
            if (res.success) {
                this.treeData = res.data
            }
        }
    }
}
</script>
<style scoped></style>