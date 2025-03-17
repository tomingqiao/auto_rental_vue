<template>
    <div>
        <el-main>
            <el-form :model="maintainModel" label-width="100px" inline size="small">
                <el-form-item label="车牌号码">
                    <el-input v-model="maintainModel.autoNum" placeholder="请输入车牌号码"></el-input>
                </el-form-item>
                <el-form-item label="维保项目">
                    <el-input v-model="maintainModel.item" placeholder="请输入维保项目"></el-input>
                </el-form-item>
                <el-form-item label="维保地点">
                    <el-input v-model="maintainModel.location" placeholder="请输入维保地点"></el-input>
                </el-form-item>
                <el-form-item label="维保日期">
                    <el-date-picker v-model="maintainModel.maintainTimeVal" type="datetimerange" range-separator="至"
                        start-placeholder="开始日期" end-placeholder="结束日期" value-format="yyyy-MM-dd HH:mm:ss" align="right"
                        :picker-options="pickerOptions">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="维保费用">
                    <el-input-number :min="0" v-model="maintainModel.lowCost" placeholder="请输入最低维保费用"></el-input-number>
                    <el-input-number :min="0" v-model="maintainModel.highCost"
                        placeholder="请输入最高维保费用"></el-input-number>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="onSubmit" icon="el-icon-search">查询</el-button>
                    <el-button type="warning" @click="resetForm" icon="el-icon-refresh">重置</el-button>
                    <el-button type="success" @click="handleCreate" icon="el-icon-plus">新增</el-button>
                    <el-button type="danger" @click="deleteBatch" icon="el-icon-delete">批量删除</el-button>
                </el-form-item>
            </el-form>
            <el-table :data="tableData" style="width: 100%;margin-bottom: 20px" border stripe
                @selection-change="handelSelectChange">
                <el-table-column type="selection" width="55"></el-table-column>
                <el-table-column label="序号" width="88">
                    <template slot-scope="scope">
                        {{ scope.$index + 1 + (start - 1) * size }}
                    </template>
                </el-table-column>
                <el-table-column prop="autoNum" label="车牌号码"></el-table-column>
                <el-table-column prop="item" label="维保项目"></el-table-column>
                <el-table-column prop="location" label="维保地点"></el-table-column>
                <el-table-column prop="maintainTime" label="维保日期"></el-table-column>
                <el-table-column prop="cost" label="维保费用"></el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit" @click="handleEdit(scope.row)">编辑</el-button>
                        <el-button type="danger" icon="el-icon-delete" @click="handleDelete(scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <el-pagination background layout="total, prev, pager, next, jumper" :current-page="start" :page-size="size"
                :total="total" @current-change="search"></el-pagination>
            <el-dialog :title="titleMap[dialogStatus]" :visible.sync="dialogFormVisible">
                <el-form :rules="rules" ref="form" :model="saveMaintain" label-width="100px">
                    <el-form-item label="车牌号码" prop="autoNum">
                        <el-select v-model="saveMaintain.autoNum" placeholder="请选择车牌号码" filterable
                            :disabled="!(dialogStatus === 'create')">
                            <el-option v-for="item in autoNumList" :key="item.autoNum" :label="item.autoNum"
                                :value="item.autoNum">
                                <span style="float: left">{{ item.autoNum }}</span>
                                <span style="float: right; color: #8492a6; font-size: 13px">未保次数：{{ item.expectedNum
                                    - item.actualNum
                                }}</span>
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="维保项目" prop="item">
                        <el-input v-model="saveMaintain.item" placeholder="请输入维保项目"></el-input>
                    </el-form-item>
                    <el-form-item label="维保地点" prop="location">
                        <el-input v-model="saveMaintain.location" placeholder="请输入维保地点"></el-input>
                    </el-form-item>
                    <el-form-item label="维保日期" prop="maintainTime">
                        <el-date-picker v-model="saveMaintain.maintainTime" type="datetime"
                            value-format="yyyy-MM-dd HH:mm:ss" align="right">
                        </el-date-picker>
                    </el-form-item>
                    <el-form-item label="维保费用" prop="cost">
                        <el-input-number :min="0" v-model="saveMaintain.cost" placeholder="请输入维保费用"></el-input-number>
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
import maintainApi from '@/api/maintain'
import autoInfoApi from '@/api/auto_info'
export default {
    name: 'maintainList',
    data() {
        return {
            maintainModel: {

            },
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
            tableData: [],
            start: 1,
            size: 10,
            total: 0,
            titleMap: {
                create: '新增',
                update: '编辑'
            },
            rules: {
                autoNum: [
                    { required: true, message: '请选择车牌号码', trigger: 'change' },
                ],
                item: [
                    { required: true, message: '请输入维保项目', trigger: 'blur' },
                ],
                location: [
                    { required: true, message: '请输入维保地点', trigger: 'blur' },
                ],
                maintainTime: [
                    { required: true, message: '请选择维保日期', trigger: 'change' },
                ],
                cost: [
                    { required: true, message: '请输入维保费用', trigger: 'blur' },
                ]
            },
            saveMaintain: {
            },
            dialogStatus: '',
            dialogFormVisible: false,
            multselection: [],
            autoNumList: []
        }
    },
    created() {
        this.search()
    },
    methods: {
        async search(start = 1) {
            this.start = start
            if (this.maintainModel.maintainTimeVal != undefined) {
                this.maintainModel.lowMaintainTime = this.maintainModel.maintainTimeVal[0]
                this.maintainModel.highMaintainTime = this.maintainModel.maintainTimeVal[1]
            }
            const res = await maintainApi.search(this.start, this.size, this.maintainModel)
            if (res.success) {
                this.tableData = res.data.records
                this.total = res.data.total
            }
        },
        async selectAutoNum() {
            const res = await autoInfoApi.toBeMaintain()
            if (res.success) {
                this.autoNumList = res.data
            }
        },
        handleCreate() {
            this.saveMaintain = {}
            this.dialogStatus = 'create'
            this.dialogFormVisible = true
            this.selectAutoNum()
            this.$nextTick(() => {
                this.$refs['form'].clearValidate()
            })
        },
        onSubmit() {
            this.search()
        },
        resetForm() {
            this.maintainModel = {}
            this.search()
        },
        deleteBatch() {
            if (this.multselection.length === 0) {
                this.$message({
                    type: 'warning',
                    message: '请选择要删除的数据'
                })
                return
            }
            this.$confirm('确认删除吗？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                maintainApi.delete(this.multselection).then(res => {
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
        handleEdit(row) {
            this.saveMaintain = Object.assign({}, row)
            this.dialogStatus = 'update'
            this.dialogFormVisible = true
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
                maintainApi.delete(row.id).then(res => {
                    if (res.success) {
                        this.$message({
                            type: 'success',
                            message: '删除成功'
                        })
                        this.search()
                    }
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
            this.$refs['form'].validate(async (valid) => {
                if (valid) {
                    const res = await maintainApi.save(this.saveMaintain)
                    if (res.success) {
                        this.dialogFormVisible = false
                        this.$message({
                            type: 'success',
                            message: '保存成功'
                        })
                        this.search()
                    }
                }
            })
        },
        updateData() {
            this.$refs['form'].validate(async (valid) => {
                if (valid) {
                    const res = await maintainApi.update(this.saveMaintain)
                    if (res.success) {
                        this.dialogFormVisible = false
                        this.$message({
                            type: 'success',
                            message: '保存成功'
                        })
                        this.search()
                    }
                }
            })
        }
    }
}
</script>
<style></style>