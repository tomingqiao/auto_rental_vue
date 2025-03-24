<template>
    <div>
        <el-main>
            <!--查询表单-->
            <el-form :inline="true" size="small" label-width="100px">
                <el-form-item label="操作:">
                    <el-button type="success" :icon="getPermissionIcon('sys:permission:add')"
                        v-if="hasPermission('sys:permission:add')" @click="handleCreate">新增</el-button>
                </el-form-item>
            </el-form>
            <!--表单结束-->
            <!--数据表格-->
            <el-table :data="tableData" style="width: 1285px;margin-bottom: 20px" border stripe
                :tree-props="{ children: 'children', hasChildren: 'hasChildren' }" default-expand-all row-key="id"
                :height="height">
                <el-table-column prop="permissionLabel" label="菜单名称" fixed width="150">
                </el-table-column>
                <!-- <el-table-column prop="parentLabel" label="上级菜单名称">
                </el-table-column> -->
                <el-table-column prop="permissionType" label="菜单类型" width="100">
                    <template slot-scope="scope">
                        <el-tag v-if="scope.row.permissionType === 0">根目录</el-tag>
                        <el-tag v-else-if="scope.row.permissionType === 1" type="success">子目录</el-tag>
                        <el-tag v-else-if="scope.row.permissionType === 2" type="danger">按钮</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="permissionCode" label="权限标识" width="200">
                </el-table-column>
                <el-table-column prop="routePath" label="路由地址" width="150">
                </el-table-column>
                <el-table-column prop="routeName" label="路由名称" width="150">
                </el-table-column>
                <el-table-column prop="routeUrl" label="组件路径" width="250">
                </el-table-column>
                <el-table-column prop="icon" label="菜单图标" width="100">
                    <template slot-scope="scope">
                        <i :class="scope.row.icon" v-if="isValidElIcon(scope.row.icon)"></i>
                        <svg-icon v-else :icon-class="scope.row.icon"></svg-icon>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="180px">
                    <template slot-scope="scope">
                        <el-button type="primary" :icon="getPermissionIcon('sys:permission:edit')" size="mini"
                            v-if="hasPermission('sys:permission:edit')" @click="handleEdit(scope.row)">编辑</el-button>
                        <el-button type="danger" :icon="getPermissionIcon('sys:permission:delete')" size="mini"
                            v-if="hasPermission('sys:permission:delete')"
                            @click="handleDelete(scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <!--表格结束-->
            <!--对话框-->
            <el-dialog :title="titleMap[dialogStatus]" :visible.sync="dialogFormVisible">
                <el-form :model="savePermission" ref="form" :rules="rules" label-width="120px">
                    <el-form-item label="上级菜单名称:" prop="parentLabel">
                        <el-input v-model="savePermission.parentLabel" autocomplete="off" readonly
                            @click.native="selectPermission"></el-input>
                    </el-form-item>
                    <el-form-item label="菜单名称：" prop="permissionLabel">
                        <el-input v-model="savePermission.permissionLabel" autocomplete="off"></el-input>
                    </el-form-item>
                    <el-form-item label="菜单类型：" prop="permissionType">
                        <el-radio-group v-model="savePermission.permissionType">
                            <el-radio-button v-for="(item, index) in permissionTypeList" :label="item.value"
                                :key="index">{{
                                    item.label
                                }}</el-radio-button>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="权限标识：" prop="permissionCode">
                        <el-input v-model="savePermission.permissionCode" autocomplete="off"></el-input>
                    </el-form-item>
                    <el-form-item label="组件路径：" prop="routeUrl" v-if="savePermission.permissionType != 2">
                        <el-input v-model="savePermission.routeUrl" autocomplete="off"></el-input>
                    </el-form-item>
                    <el-form-item label="图标：" prop="icon">
                        <el-select v-model="savePermission.icon" placeholder="请选择图标">
                            <el-option v-for="(item, index) in icons" :key="index" :label="item.label"
                                :value="item.value">
                                <span style="float: left">{{ item.label }}</span>
                                <i :class="item.value" v-if="isValidElIcon(item.value)" style=""></i>
                                <svg-icon v-else :icon-class="item.value" style=""></svg-icon></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="菜单排序：" prop="orderNum">
                        <el-input-number v-model="savePermission.orderNum" autocomplete="off"></el-input-number>
                    </el-form-item>
                </el-form>
                <div slot="footer" class="dialog-footer">
                    <el-button @click="dialogFormVisible = false">取 消</el-button>
                    <el-button type="primary" @click="dialogStatus === 'create' ? createData() : updateData()">确
                        定</el-button>
                </div>
            </el-dialog>
            <!--对话框结束-->
            <el-dialog title="请选择上级菜单" :visible.sync="dialogTreeVisible">
                <el-tree :data="treeData" :props="defaultProps" @node-click="handleNodeClick" default-expand-all
                    empty-text="未获取到菜单数据" highlight-current :expand-on-click-node="false"></el-tree>
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
import permissionApi from "@/api/permission"
export default {
    name: 'permissionList',
    data() {
        return {
            height: 0,
            tableData: [],
            savePermission: {

            },
            multipleSelection: [],
            dialogStatus: '',
            dialogFormVisible: false,
            titleMap: {
                create: '新增部门',
                update: '修改部门'
            },
            parentPermissionList: [],
            rules: {
                permissionLabel: [
                    { required: true, message: '请输入菜单名称', trigger: 'blur' },
                ],
                parentLabel: [
                    { required: true, message: '请选择上级菜单名称', trigger: 'blur' },
                ],
                permissionCode: [
                    { required: true, message: '请输入权限标识', trigger: 'blur' },
                ],
                routeUrl: [
                    { required: true, message: '请输入组件路径', trigger: 'blur' },
                ],
                permissionType: [
                    { required: true, message: '请选择菜单类型', trigger: 'blur' },
                ],
            },
            dialogTreeVisible: false,
            treeData: [],
            defaultProps: {
                label: 'permissionLabel',
                children: 'children',
            },
            selectParentPermission: {
            },
            permissionTypeList: [
                { label: '根目录', value: 0 },
                { label: '子目录', value: 1 },
                { label: '按钮', value: 2 },
            ],
            icons: [
                {
                    label: '删除',
                    value: 'el-icon-delete',
                },
                {
                    label: '编辑',
                    value: 'el-icon-edit',
                },
                {
                    label: '新增',
                    value: 'el-icon-plus',
                },
                {
                    label: '重置',
                    value: 'el-icon-refresh',
                },
                {
                    label: '搜索',
                    value: 'el-icon-search',
                },
                {
                    label: '导出',
                    value: 'el-icon-upload',
                },
                {
                    label: '根目录',
                    value: 'component',
                },
                {
                    label: '子目录',
                    value: 'guide'
                },
                {
                    label: '设置',
                    value: 'el-icon-setting'
                },
                {
                    label: '出租',
                    value: 'el-icon-sold-out'
                },
                {
                    label: '还车',
                    value: 'el-icon-goods'
                },
                {
                    label: '详情',
                    value: 'el-icon-info'
                },
                {
                    label: '归还押金',
                    value: 'el-icon-sell'
                },
            ]
        }
    },
    created() {
        this.search()
    },
    mounted() {
        this.$nextTick(() => {
            this.height = window.innerHeight - 180
        })
    },
    methods: {
        async search() {
            const res = await permissionApi.search()
            if (res.success) {
                this.tableData = res.data
            }
        },
        handleCreate() {
            this.savePermission = {}
            this.dialogStatus = 'create'
            this.dialogFormVisible = true
            this.$nextTick(() => {
                this.$refs['form'].clearValidate()
            })
        },
        handleEdit(row) {
            this.dialogStatus = 'update'
            this.dialogFormVisible = true
            this.savePermission = Object.assign({}, row)
            this.$nextTick(() => {
                this.$refs['form'].clearValidate()
            })
        },
        async handleDelete(row) {
            const res = await permissionApi.hasChildren(row.id)
            if (res.message === '有子菜单') {
                this.$message({
                    type: 'warning',
                    message: '该菜单存在子菜单，不能删除'
                })
            } else {
                this.$confirm('确认删除吗？', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(async () => {
                    const res = await permissionApi.delete(row.id)
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
                    const res = await permissionApi.save(this.savePermission)
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
                    const res = await permissionApi.update(this.savePermission)
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
            this.selectParentPermission = val
        },
        handleTreeConfirm() {
            this.savePermission.pid = this.selectParentPermission.id
            this.savePermission.parentLabel = this.selectParentPermission.permissionLabel
            this.dialogTreeVisible = false
            this.$refs['form'].clearValidate("parentLabel")
        },
        closeTree() {
            this.dialogTreeVisible = false
            if (this.savePermission.pid != null) {
                this.$refs['form'].clearValidate("parentLabel")
            }
        },
        async selectPermission() {
            this.dialogTreeVisible = true
            const res = await permissionApi.selectTree()
            if (res.success) {
                this.treeData = res.data
            }
        },
        isValidElIcon(str) {
            if (str != '') {
                if (str.includes('el-icon')) {
                    return true
                }
            }
            return false
        }
    }
}
</script>
<style scoped></style>