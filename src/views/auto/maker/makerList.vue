<template>
    <div class="">
        <el-main>
            <!--查询表单-->
            <el-form :inline="true" :model="makerModel" size="small" label-width="100px">
                <el-form-item label="汽车厂商名称:">
                    <el-input v-model="makerModel.name" placeholder="请输入汽车厂商名称"></el-input>
                </el-form-item>
                <el-form-item label="操作:">
                    <el-button type="primary" :icon="getPermissionIcon('auto:maker:select')"
                        v-if="hasPermission('auto:maker:select')" @click="onSubmit">查询</el-button>
                    <el-button type="warning" :icon="getPermissionIcon('auto:maker:reset')" @click="resetForm"
                        v-if="hasPermission('auto:maker:reset')">重置</el-button>
                    <el-button type="success" :icon="getPermissionIcon('auto:maker:add')" @click="handleCreate"
                        v-if="hasPermission('auto:maker:add')">新增</el-button>
                    <el-button type="danger" :icon="getPermissionIcon('auto:maker:delete')" @click="deleteBatch"
                        v-if="hasPermission('auto:maker:delete')">删除选中</el-button>
                </el-form-item>
            </el-form>
            <!--表单结束-->
            <!--数据表格-->
            <el-table :data="tableData" style="width: 615px;margin-bottom: 20px" border stripe
                @selection-change="handelSelectChange">
                <el-table-column type="selection" width="55"> </el-table-column>
                <el-table-column label="序号" width="55">
                    <template slot-scope="scope">
                        {{ (start - 1) * size + scope.$index + 1 }}
                    </template>
                </el-table-column>
                <el-table-column prop="name" label="汽车厂商名称" width="200">
                </el-table-column>
                <el-table-column prop="orderLetter" label="排序字母" width="100">
                </el-table-column>
                <el-table-column label="操作" width="200">
                    <template slot-scope="scope">
                        <el-button type="primary" :icon="getPermissionIcon('auto:maker:edit')" size="mini"
                            v-if="hasPermission('auto:maker:edit')" @click="handleEdit(scope.row)">编辑</el-button>
                        <el-button type="danger" :icon="getPermissionIcon('auto:maker:delete')" size="mini"
                            v-if="hasPermission('auto:maker:delete')" @click="handleDelete(scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <!--表格结束-->
            <!--分页组件-->
            <el-pagination background layout="total, prev, pager, next, jumper" :current-page="start" :page-size="size"
                :total="total" @current-change="search">
            </el-pagination>
            <!--组件结束-->
            <!--对话框-->
            <el-dialog :title="titleMap[dialogStatus]" :visible.sync="dialogFormVisible">
                <el-form :model="saveMaker" ref="form" :rules="rules" label-width="120px">
                    <el-form-item label="汽车厂商名称：" prop="name">
                        <el-input v-model="saveMaker.name" autocomplete="off"></el-input>
                    </el-form-item>
                </el-form>
                <div slot="footer" class="dialog-footer">
                    <el-button @click="dialogFormVisible = false">取 消</el-button>
                    <el-button type="primary" @click="dialogStatus === 'create' ? createData() : updateData()">确
                        定</el-button>
                </div>
            </el-dialog>
            <!--对话框结束-->
        </el-main>
    </div>
</template>
<script>
import makerApi from '@/api/auto_maker'
export default {
    name: 'makerList',
    data() {
        return {
            makerModel: {
                name: ''
            },
            start: 1,
            size: 5,
            total: 0,
            tableData: [],
            multipleSelection: [],
            dialogFormVisible: false,
            saveMaker: {
                name: '',
            },
            dialogStatus: '',
            rules: {
                name: [
                    { required: true, message: '请输入汽车厂商名称', trigger: 'blur' },
                ]
            },
            titleMap: {
                create: '新增汽车厂商',
                update: '修改汽车厂商'
            }
        }
    },
    created() {
        this.search()
    },
    methods: {
        search(start = 1) {
            this.start = start
            makerApi.search(this.start, this.size, this.makerModel)
                .then(res => {
                    this.tableData = res.data.records
                    this.total = res.data.total
                }).catch(err => {
                    console.log(err)
                })
        },
        onSubmit() {
            this.search()
        },
        resetForm() {
            this.makerModel.name = ''
            this.search()
        },
        handleCreate() {
            this.saveMaker.name = ''
            this.dialogStatus = 'create'
            this.dialogFormVisible = true
            this.$nextTick(() => {
                this.$refs['form'].clearValidate()
            })
        },
        deleteBatch() {
            if (this.multipleSelection.length == 0) {
                this.$message({
                    type: 'warning',
                    message: '请选择要删除的数据'
                })
                return
            } else if (this.multipleSelection.length > 0) {
                this.$confirm('确认删除吗？', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    makerApi.delete(this.multipleSelection).then(res => {
                        this.$message({
                            type: 'success',
                            message: '删除成功!'
                        })
                        this.search()
                    }).catch(err => {
                        console.log(err)
                    })

                }).catch(() => { })
            }
        },
        handleEdit(row) {
            this.dialogStatus = 'update'
            this.dialogFormVisible = true
            this.saveMaker.id = row.id
            this.saveMaker.name = row.name
            this.$nextTick(() => {
                this.$refs['form'].clearValidate()
            })
        },
        handleDelete(row) {
            this.$confirm('确认删除吗？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                makerApi.delete(row.id).then(res => {
                    this.$message({
                        type: 'success',
                        message: '删除成功!'
                    })
                    this.search()
                }).catch(err => {
                    console.log(err)
                })
            }).catch(() => { })
        },
        handelSelectChange(val) {
            this.multipleSelection = []
            val.forEach(element => {
                this.multipleSelection.push(element.id)
            });
        },
        createData() {
            this.$refs['form'].validate((valid) => {
                if (valid) {
                    makerApi.add(this.saveMaker).then(res => {
                        this.dialogFormVisible = false
                        this.$message({
                            message: '新增成功',
                            type: 'success',
                        })
                        this.search()
                    }).catch(err => {
                        console.log(err)
                    })
                }
            })
        },
        updateData() {
            this.$refs['form'].validate((valid) => {
                if (valid) {
                    makerApi.update(this.saveMaker).then(res => {
                        this.dialogFormVisible = false
                        this.$message({
                            message: '修改成功',
                            type: 'success',
                        })
                        this.search()
                    }).catch(err => {
                        console.log(err)
                    })
                }
            })
        },
    }
}
</script>
<style scoped></style>
