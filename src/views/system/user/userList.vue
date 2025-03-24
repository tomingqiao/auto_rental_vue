<template>
    <el-container :style="{ height: containerHeight + 'px' }">
        <el-aside width="18%" class="dept-tree">
            <el-tree ref="tree" :data="deptTree" :props="deptProps" empty-text="未获取到部门数据" highlight-current
                @node-click="handleNodeClick" default-expand-all node-key="id" :expand-on-click-node="false"></el-tree>

        </el-aside>
        <el-main>
            <el-form :model="userModel" :rules="rules" label-width="80px" :inline="true" size="small">
                <el-form-item label="用户账号:">
                    <el-input v-model="userModel.username" placeholder="请输入用户账号"></el-input>
                </el-form-item>
                <el-form-item label="真实姓名:">
                    <el-input v-model="userModel.realname" placeholder="请输入真实姓名"></el-input>
                </el-form-item>
                <el-form-item label="用户昵称:">
                    <el-input v-model="userModel.nickname" placeholder="请输入用户昵称"></el-input>
                </el-form-item>
                <el-form-item label="手机号:">
                    <el-input v-model="userModel.phone" placeholder="请输入手机号"></el-input>
                </el-form-item>
                <el-form-item label="邮箱:">
                    <el-input v-model="userModel.email" placeholder="请输入邮箱"></el-input>
                </el-form-item>
                <el-form-item label="操作:">
                    <el-button type="primary" :icon="getPermissionIcon('sys:user:select')" @click="onSubmit"
                        v-if="hasPermission('sys:user:select')">查询</el-button>
                    <el-button type="warning" :icon="getPermissionIcon('sys:user:reset')" @click="resetForm"
                        v-if="hasPermission('sys:user:reset')">重置</el-button>
                    <el-button type="success" :icon="getPermissionIcon('sys:user:add')" @click="handleCreate"
                        v-if="hasPermission('sys:user:add')">新增</el-button>
                    <el-button type="danger" :icon="getPermissionIcon('sys:user:delete')" @click="deleteBatch"
                        v-if="hasPermission('sys:user:delete')">删除选中</el-button>
                </el-form-item>
            </el-form>
            <el-table :data="tableData" style="width: 100%;margin-bottom: 20px" border stripe
                @selection-change="handleSelectionChange">
                <el-table-column type="selection" width="55" fixed></el-table-column>
                <el-table-column label="序号" width="66" fixed>
                    <template slot-scope="scope">
                        {{ (start - 1) * size + scope.$index + 1 }}
                    </template>
                </el-table-column>
                <el-table-column prop="username" label="用户账号" width="150"></el-table-column>
                <el-table-column prop="realname" label="真实姓名" width="150"></el-table-column>
                <el-table-column prop="nickname" label="用户昵称" width="150"></el-table-column>
                <el-table-column prop="email" label="邮箱" width="180"></el-table-column>
                <el-table-column prop="phone" label="手机号" width="180"></el-table-column>
                <el-table-column prop="gender" label="性别">
                    <template slot-scope="scope">
                        <el-tag type="danger" v-if="scope.row.gender === 1">男</el-tag>
                        <el-tag type="success" v-else>女</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="deptName" label="所在部门" width="200"></el-table-column>
                <el-table-column prop="avatar" label="头像">
                    <template slot-scope="scope">
                        <img :src="scope.row.avatar" alt="" style="width: 40px;height: 40px;border-radius: 50%;">
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="300" fixed="right">
                    <template slot-scope="scope">
                        <el-button type="primary" size="small" @click="handleEdit(scope.row)"
                            :icon="getPermissionIcon('sys:user:edit')"
                            v-if="hasPermission('sys:user:edit')">编辑</el-button>
                        <el-button type="danger" size="small" @click="handleDelete(scope.row)"
                            :icon="getPermissionIcon('sys:user:delete')"
                            v-if="hasPermission('sys:user:delete')">删除</el-button>
                        <el-button type="warning" size="small" @click="handleRole(scope.row)"
                            :icon="getPermissionIcon('sys:user:bindRole')"
                            v-if="hasPermission('sys:user:bindRole')">绑定角色</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <el-pagination background @current-change="search" :current-page="start" :page-size="size"
                layout="total,  prev, pager, next, jumper" :total="total">
            </el-pagination>
            <el-dialog :title="titleMap[dialogStatus]" :visible.sync="dialogFormVisible" width="40%">
                <el-form :model="saveUser" :rules="rules" label-width="100px" size="small" ref="form" :inline="true">
                    <el-form-item label="用户账号:" prop="username">
                        <el-input v-model="saveUser.username" placeholder="请输入用户账号"></el-input>
                    </el-form-item>
                    <el-form-item label="密码:" prop="password" v-if="dialogStatus === 'create'">
                        <el-input v-model="saveUser.password" type="password" placeholder="请输入密码"></el-input>
                    </el-form-item>
                    <el-form-item label="真实姓名:" prop="realname">
                        <el-input v-model="saveUser.realname" placeholder="请输入真实姓名"></el-input>
                    </el-form-item>
                    <el-form-item label="用户昵称:" prop="nickname">
                        <el-input v-model="saveUser.nickname" placeholder="请输入用户昵称"></el-input>
                    </el-form-item>
                    <el-form-item label="手机号:" prop="phone">
                        <el-input v-model="saveUser.phone" placeholder="请输入手机号"></el-input>
                    </el-form-item>
                    <el-form-item label="邮箱:" prop="email">
                        <el-input v-model="saveUser.email" placeholder="请输入邮箱"></el-input>
                    </el-form-item>
                    <el-form-item label="部门:" prop="deptName">
                        <el-input v-model="saveUser.deptName" placeholder="请输入部门"
                            @click.native="handleSelectDept"></el-input>
                    </el-form-item>
                    <el-form-item label="性别:" prop="gender">
                        <el-radio-group v-model="saveUser.gender">
                            <el-radio-button label="1">男</el-radio-button>
                            <el-radio-button label="0">女</el-radio-button>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="头像:" prop="avatar">
                        <!-- <el-upload class="avatar-uploader" action="https://jsonplaceholder.typicode.com/posts/"
                            :show-file-list="false" :on-success="handleAvatarSuccess"
                            :before-upload="beforeAvatarUpload">
                            <img v-if="saveUser.avatar" :src="saveUser.avatar" class="avatar">
                            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                        </el-upload> -->
                        <el-input v-model="saveUser.avatar" placeholder="请输入头像链接"></el-input>
                    </el-form-item>
                </el-form>
                <div slot="footer" class="dialog-footer">
                    <el-button @click="dialogFormVisible = false">取消</el-button>
                    <el-button type="primary"
                        @click="dialogStatus === 'create' ? createData() : updateData()">确定</el-button>
                </div>
            </el-dialog>
            <el-dialog title="选择部门" :visible.sync="dialogDeptVisible" width="30%">
                <el-tree :data="deptTree" :props="deptProps" node-key="id" ref="tree" @node-click="selectDept"
                    :default-expand-all="true" :highlight-current="true" :expand-on-click-node="false"></el-tree>
            </el-dialog>
            <el-dialog title="绑定角色" :visible.sync="dialogRoleVisible">
                <el-checkbox-group v-model="roleIds">
                    <el-checkbox v-for="item in roleList" :label="item.id" :indeterminate="false" border
                        :key="item.id">{{
                            item.roleName
                        }}</el-checkbox>
                </el-checkbox-group>
                <div slot="footer" class="dialog-footer">
                    <el-button @click="dialogRoleVisible = false">取消</el-button>
                    <el-button type="primary" @click="handleRoleSave">确定</el-button>
                </div>
            </el-dialog>
        </el-main>
    </el-container>
</template>
<script>
import userApi from '@/api/auth_user'
import deptApi from '@/api/dept'
import roleApi from '@/api/auth_role'
import getPermissionIcon from '@/api/icon'
export default {
    data() {
        return {
            total: 0,
            start: 1,
            size: 5,
            deptTree: [],
            deptProps: {
                label: 'deptName',
                children: 'children',
            },
            multipleSelection: [],
            dialogFormVisible: false,
            saveUser: {
            },
            dialogStatus: '',
            containerHeight: 0,
            userModel: {
            },
            titleMap: {
                create: '新增用户',
                update: '修改用户'
            },
            rules: {
                username: [
                    { required: true, message: '请输入用户名', trigger: 'blur' },
                ],
                password: [
                    { required: true, message: '请输入密码', trigger: 'blur' },
                ],
                realname: [
                    { required: true, message: '请输入真实姓名', trigger: 'blur' },
                ],
                phone: [
                    { required: true, message: '请输入手机号', trigger: 'blur' },
                ],
                gender: [
                    { required: true, message: '请选择性别', trigger: 'change' },
                ],
                deptName: [
                    { required: true, message: '请选择部门', trigger: 'blur' },
                ],
            },
            deptId: 0,
            tableData: [],
            dialogDeptVisible: false,
            roleList: [],
            dialogRoleVisible: false,
            roleIds: [],
            roleId: 0,
        }
    },
    created() {
        this.getDeptTree()
        this.search()
    },
    mounted() {
        this.containerHeight = window.innerHeight - 130
    },
    methods: {
        async getDeptTree() {
            const res = await deptApi.selectTree()
            if (res.success) {
                this.deptTree = res.data
            }
        },
        async search(start = 1) {
            this.start = start
            const res = await userApi.search(this.start, this.size, this.userModel)
            if (res.success) {
                this.tableData = res.data.records
                this.total = res.data.total
            }
        },
        onSubmit() {
            this.search()
        },
        handleNodeClick(val) {
            this.userModel.deptId = val.id
            this.search()
            if (val.id == 0) {
                this.userModel.deptId = null
            }
        },
        handleCreate() {
            this.dialogStatus = 'create'
            this.dialogFormVisible = true
            this.saveUser = {}
            this.$nextTick(() => {
                this.$refs['form'].clearValidate()
            })
        },
        resetForm() {
            this.userModel = {}
            this.search()
        },
        deleteBatch() {
            if (this.multipleSelection.length == 0) {
                this.$message({
                    type: 'warning',
                    message: '请选择要删除的数据'
                })
                return
            }
            this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                const res = await userApi.delete(this.multipleSelection)
                if (res.success) {
                    this.$message({
                        type: 'success',
                        message: '删除成功!'
                    })
                }
                this.search()
            })
        },
        handleEdit(row) {
            this.dialogStatus = 'update'
            this.dialogFormVisible = true
            this.saveUser = Object.assign({}, row)
            this.$nextTick(() => {
                this.$refs['form'].clearValidate()
            })
        },
        handleDelete(row) {
            if (row.isAdmin == 1) {
                this.$message({
                    type: 'warning',
                    message: '超级管理员不能删除'
                })
            } else {
                this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(async () => {
                    const res = await userApi.delete(row.id)
                    if (res.success) {
                        this.$message({
                            type: 'success',
                            message: '删除成功!'
                        })
                        this.search()
                    }
                })
            }

        },
        handleSelectionChange(val) {
            this.multipleSelection = []
            val.forEach(element => {
                this.multipleSelection.push(element.id)
            });
        },
        async handleRole(row) {
            this.dialogRoleVisible = true
            this.roleIds = []
            const res = await userApi.hasRole(row.id)
            if (res.success) {
                this.roleIds = res.data
            }
            const res2 = await roleApi.list()
            if (res2.success) {
                this.roleList = res2.data
            }
            this.roleId = row.id
        },
        createData() {
            this.$refs['form'].validate(async valid => {
                if (valid) {
                    const res = await userApi.save(this.saveUser)
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
            this.$refs['form'].validate(async valid => {
                if (valid) {
                    const res = await userApi.update(this.saveUser)
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
        handleSelectDept() {
            this.dialogDeptVisible = true
        },
        selectDept(val) {
            this.saveUser.deptId = val.id
            this.saveUser.deptName = val.deptName
            this.dialogDeptVisible = false
            this.$refs['form'].clearValidate("deptName")
        },
        // handleAvatarSuccess(res, file) {
        //     this.saveUser.avatar = URL.createObjectURL(file.raw);
        // },
        // beforeAvatarUpload(file) {
        //     const isJPG = file.type === 'image/jpeg'|| file.type === 'image/png'||file.type === 'image/gif'||file.type === 'image/jpg';
        //     const isLt2M = file.size / 1024 / 1024 < 2;

        //     if (!isJPG) {
        //         this.$message.error('上传头像图片只能是 JPG,PNG,GIF 格式!');
        //     }
        //     if (!isLt2M) {
        //         this.$message.error('上传头像图片大小不能超过 2MB!');
        //     }
        //     return isJPG && isLt2M;
        // }
        async handleRoleSave() {
            if (this.roleIds.length == 0) {
                this.$message({
                    type: 'warning',
                    message: '请选择角色'
                })
                return
            }
            const res = await userApi.bindRole(this.roleId, this.roleIds)
            if (res.success) {
                this.$message({
                    type: 'success',
                    message: '角色绑定成功'
                })
                this.dialogRoleVisible = false
                this.search()
            }
        }
    }
}
</script>
<style scoped>
.dept-tree {
    background-color: white;
    border-right: 2px solid #d8dce5;
    border-top: 2px solid #d8dce5;
}
</style>