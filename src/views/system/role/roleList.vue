<template>
    <div class="app-container">
        <el-main>
            <!--查询表单-->
            <el-form :inline="true" :model="roleModel" size="small" label-width="100px">
                <el-form-item label="角色名称:">
                    <el-input v-model="roleModel.roleName" placeholder="请输入角色名称"></el-input>
                </el-form-item>
                <el-form-item label="操作:">
                    <el-button type="primary" :icon="getPermissionIcon('sys:role:select')"
                        v-if="hasPermission('sys:role:select')" @click="onSubmit">查询</el-button>
                    <el-button type="warning" :icon="getPermissionIcon('sys:role:reset')" @click="resetForm"
                        v-if="hasPermission('sys:role:reset')">重置</el-button>
                    <el-button type="success" :icon="getPermissionIcon('sys:role:add')" @click="handleCreate"
                        v-if="hasPermission('sys:role:add')">新增</el-button>
                    <el-button type="danger" :icon="getPermissionIcon('sys:role:delete')" @click="deleteBatch"
                        v-if="hasPermission('sys:role:delete')">删除选中</el-button>
                    <el-button type="primary" :icon="getPermissionIcon('sys:role:export')" @click="exportExcel"
                        v-if="hasPermission('sys:role:export')">导出Excel</el-button>
                </el-form-item>
            </el-form>
            <!--表单结束-->
            <el-table :data="roleList" border @selection-change="handleSelectionChange" stripe
                style="width: 1015px;margin-bottom: 20px">
                <el-table-column type="selection" width="55" fixed></el-table-column>
                <el-table-column label="序号" width="55" fixed>
                    <template slot-scope="scope">
                        {{ (start - 1) * size + scope.$index + 1 }}
                    </template>
                </el-table-column>
                <el-table-column prop="roleName" label="角色名称" width="150"></el-table-column>
                <el-table-column prop="roleCode" label="角色编码" width="150"></el-table-column>
                <el-table-column prop="remark" label="角色描述" width="300"></el-table-column>
                <el-table-column label="操作" width="300">
                    <template slot-scope="scope">
                        <el-button type="primary" size="mini" @click="handleEdit(scope.row)"
                            :icon="getPermissionIcon('sys:role:edit')"
                            v-if="hasPermission('sys:role:edit')">编辑</el-button>
                        <el-button type="danger" size="mini" @click="handleDelete(scope.row)"
                            v-if="hasPermission('sys:role:delete')"
                            :icon="getPermissionIcon('sys:role:delete')">删除</el-button>
                        <el-button type="warning" size="mini" @click="handlePermission(scope.row)"
                            v-if="hasPermission('sys:role:assignPermissions')"
                            :icon="getPermissionIcon('sys:role:assignPermissions')">分配权限</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <el-pagination background @current-change="search" :current-page="start" :page-size="size"
                layout="total,  prev, pager, next, jumper" :total="total">
            </el-pagination>
            <el-dialog :title="titleMap[dialogStatus]" :visible.sync="dialogFormVisible">
                <el-form :model="saveRole" label-width="120px" size="small" ref="form" :rules="rules">
                    <el-form-item label="角色名称" prop="roleName">
                        <el-input v-model="saveRole.roleName" placeholder="请输入角色名称"></el-input>
                    </el-form-item>
                    <el-form-item label="角色编码" prop="roleCode">
                        <el-input v-model="saveRole.roleCode" placeholder="请输入角色编码"></el-input>
                    </el-form-item>
                    <el-form-item label="角色描述" prop="remark">
                        <el-input v-model="saveRole.remark" :rows="3" placeholder="请输入角色描述" type="textarea"></el-input>
                    </el-form-item>
                </el-form>
                <div slot="footer" class="dialog-footer">
                    <el-button @click="dialogFormVisible = false">取 消</el-button>
                    <el-button type="primary" @click="dialogStatus === 'create' ? createData() : updateData()">确 定
                    </el-button>
                </div>
            </el-dialog>
            <el-dialog :title="title" :visible.sync="dialogPermissionVisible">
                <el-main style="height: 500px;">
                    <el-tree ref="tree" :data="treeData" :props="defaultProps" node-key="id" show-checkbox
                        default-expand-all :default-checked-keys="chenckedKeys" check-strictly
                        :expand-on-click-node="false">
                    </el-tree>
                </el-main>

                <div slot="footer" class="dialog-footer">
                    <el-button @click="clearSelect">取 消</el-button>
                    <el-button type="primary" @click="handlePermissionSave">确 定</el-button>
                </div>
            </el-dialog>
        </el-main>
    </div>
</template>
<script>
import roleApi from '@/api/auth_role'
import { getToken } from '@/utils/auth'
export default {
    name: 'roleList',
    data() {
        return {
            roleModel: {
                roleName: ''
            },
            roleList: [],
            multipleSelection: [],
            total: 0,
            start: 1,
            size: 5,
            loading: false,
            dialogFormVisible: false,
            dialogStatus: '',
            textMap: {},
            titleMap: {
                create: '新增角色',
                update: '修改角色'
            },
            rules: {
                roleName: [
                    { required: true, message: '请输入角色名称', trigger: 'blur' },
                ],
                roleCode: [
                    { required: true, message: '请输入角色编码', trigger: 'blur' },
                ]
            },
            saveRole: {},
            title: '分配权限',
            dialogPermissionVisible: false,
            chenckedKeys: [],
            treeData: [],
            defaultProps: {
                label: 'permissionLabel',
                children: 'children',
            },
            roleId: 0

        }
    },
    created() {
        this.search()
    },
    methods: {
        async search(start = 1) {
            this.start = start
            this.roleModel.createrId = this.$store.state.user.createrId
            let res = await roleApi.search(this.start, this.size, this.roleModel)
            if (res.success) {
                this.roleList = res.data.records
                this.total = res.data.total
            }
        },
        handleCreate() {
            this.dialogStatus = 'create'
            this.dialogFormVisible = true
            this.saveRole = {}
            this.$nextTick(() => {
                this.$refs['from'].clearValidate()
            })
        },
        handleEdit(row) {
            this.dialogStatus = 'update'
            this.dialogFormVisible = true
            this.saveRole = Object.assign({}, row)
            this.$nextTick(() => {
                this.$refs['form'].clearValidate()
            })
        },
        async handleDelete(row) {
            const res = await roleApi.hasUser(row.id)
            if (res.success) {
                console.log(res)
                if (res.message === '有用户使用此角色') {
                    this.$message({
                        type: 'warning',
                        message: res.message + '，无法删除'
                    })
                } else if (res.message === '无用户使用此角色') {
                    this.$confirm('确认删除吗？', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(async () => {
                        const res = await roleApi.delete(row.id)
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
            }
        },
        deleteBatch() {
            if (this.multipleSelection.length === 0) {
                this.$message({
                    type: 'warning',
                    message: '请选择要删除的数据'
                })
            } else {
                this.$confirm('确认删除吗？', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(async () => {
                    const res = await roleApi.delete(this.multipleSelection)
                    if (res.success) {
                        this.$message({
                            type: 'success',
                            message: '已删除无用户使用的角色!'
                        })
                        this.search()
                    }
                })
            }
        },
        createData() {
            this.$refs['form'].validate(async (valid) => {
                if (valid) {
                    this.saveRole.createrId = this.$store.state.user.createrId
                    const res = await roleApi.save(this.saveRole)
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
        updateData() {
            this.$refs['form'].validate(async (valid) => {
                if (valid) {
                    const res = await roleApi.update(this.saveRole)
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
        resetForm() {
            this.roleModel = {}
            this.search()
        },
        onSubmit() {
            this.search()
        },
        handleSelectionChange(val) {
            this.multipleSelection = []
            val.forEach(element => {
                this.multipleSelection.push(element.id)
            });
        },
        async handlePermission(row) {
            this.roleId = row.id
            this.dialogPermissionVisible = true
            this.title = `${row.roleName}权限分配`
            const permissionTree = {
                userId: this.$store.state.user.createrId,
                roleId: row.id
            }
            const res = await roleApi.permissionTree(permissionTree)
            if (res.success) {
                this.treeData = res.data.permissionList
                this.chenckedKeys = res.data.checkedList
            }
        },
        clearSelect() {
            this.dialogPermissionVisible = false
        },
        async handlePermissionSave() {
            let permissionIds = this.$refs.tree.getCheckedKeys()
            const res = await roleApi.assignPermission(this.roleId, permissionIds)
            if (res.success) {
                this.$message.success('权限分配成功')
                this.dialogPermissionVisible = false
            } else {
                this.$message.error('权限分配失败')
            }
        },
        exportExcel() {
            let url = `${process.env.VUE_APP_BASE_API}/rental/role/exportExcel?token=${getToken()}`
            window.open(url)
        }
    }
}
</script>
<style scoped></style>
