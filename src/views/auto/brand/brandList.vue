<template>
    <div class="">
        <el-main>
            <!--查询表单-->
            <el-form :inline="true" :model="brandModel" size="small" label-width="100px">
                <el-form-item label="汽车厂商名称">
                    <el-select v-model="brandModel.mid" placeholder="请选择汽车厂商名称">
                        <el-option v-for="item in makerList" :key="item.id" :label="item.name"
                            :value="item.id"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="汽车品牌名称">
                    <el-input v-model="brandModel.brandName" placeholder="请输入汽车品牌名称"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" icon="el-icon-search" @click="onSubmit">查询</el-button>
                    <el-button type="warning" icon="el-icon-refresh" @click="resetForm">重置</el-button>
                    <el-button type="success" icon="el-icon-plus" @click="handleCreate">新增</el-button>
                    <el-button type="danger" icon="el-icon-delete" @click="deleteBatch">删除选中</el-button>
                    <el-button type="primary" icon="el-icon-download" @click="exportExcel">导出Excel</el-button>
                </el-form-item>
            </el-form>
            <!--表单结束-->
            <!--数据表格-->
            <el-table :data="tableData" style="width: 100%;margin-bottom: 20px" border stripe
                @selection-change="handelSelectChange">
                <el-table-column type="selection" width="55"> </el-table-column>
                <el-table-column label="序号" width="88">
                    <template slot-scope="scope">
                        {{ (start - 1) * size + scope.$index + 1 }}
                    </template>
                </el-table-column>
                <el-table-column prop="brandName" label="汽车品牌名称">
                </el-table-column>
                <el-table-column prop="makerName" label="汽车厂商名称">
                </el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit" size="mini"
                            @click="handleEdit(scope.row)">编辑</el-button>
                        <el-button type="danger" icon="el-icon-delete" size="mini"
                            @click="handleDelete(scope.row)">删除</el-button>
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
                <el-form :model="saveBrand" ref="form" :rules="rules" label-width="130px">
                    <el-form-item label="汽车厂商名称：" prop="mid">
                        <el-select v-model="saveBrand.mid" placeholder="请选择汽车厂商名称">
                            <el-option v-for="item in makerList" :key="item.id" :label="item.name"
                                :value="item.id"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="汽车品牌名称：" prop="brandName">
                        <el-input v-model="saveBrand.brandName" autocomplete="off"></el-input>
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
import brandApi from '@/api/auto_brand'
import makerApi from '@/api/auto_maker'
import { getToken } from '@/utils/auth'
export default {
    name: 'brandList',
    data() {
        return {
            brandModel: {
                brandName: ''
            },
            start: 1,
            size: 10,
            total: 0,
            tableData: [],
            multipleSelection: [],
            dialogFormVisible: false,
            saveBrand: {
                brandName: '',
                mid: null,
            },
            dialogStatus: '',
            rules: {
                brandName: [
                    { required: true, message: '请输入汽车品牌名称', trigger: 'blur' },
                ],
                mid: [
                    { required: true, message: '请选择汽车厂商名称', trigger: 'change' },
                ]
            },
            titleMap: {
                create: '新增汽车品牌',
                update: '修改汽车品牌'
            },
            makerList: []
        }
    },
    created() {
        this.search()
        this.selectMaker()
    },
    methods: {
        search(start = 1) {
            this.start = start
            brandApi.search(this.start, this.size, this.brandModel)
                .then(res => {
                    this.tableData = res.data.records
                    this.total = res.data.total
                }).catch(err => {
                    console.log(err)
                })
        },
        selectMaker() {
            makerApi.selectAll()
                .then(res => {
                    this.makerList = res.data
                }).catch(err => {
                    console.log(err)
                })
        },
        onSubmit() {
            this.search()
        },
        resetForm() {
            this.brandModel = {}
            this.search()
        },
        handleCreate() {
            this.saveBrand = {}
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
                    brandApi.delete(this.multipleSelection).then(res => {
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
            this.saveBrand.id = row.id
            this.saveBrand.mid = row.mid
            this.saveBrand.brandName = row.brandName
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
                brandApi.delete(row.id).then(res => {
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
                    brandApi.add(this.saveBrand).then(res => {
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
                    brandApi.update(this.saveBrand).then(res => {
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
        exportExcel() {
            let url = `${process.env.VUE_APP_BASE_API}/rental/autoBrand/exportExcel?token=${getToken()}`
            window.open(url)
        }
    }
}
</script>
<style scoped></style>
