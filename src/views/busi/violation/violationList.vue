<template>
    <div>
        <el-main>
            <el-form inline size="small" label-width="100px" :model="violationModel">
                <el-form-item label="车牌号:">
                    <el-input v-model="violationModel.autoNum" placeholder="请输入车牌号"></el-input>
                </el-form-item>
                <el-form-item label="违章事由:">
                    <el-input v-model="violationModel.reason" placeholder="请输入违章事由"></el-input>
                </el-form-item>
                <el-form-item label="违章地点:">
                    <el-input v-model="violationModel.location" placeholder="请输入违章地点"></el-input>
                </el-form-item>
                <el-form-item label="是否处理:">
                    <el-select v-model="violationModel.status" placeholder="请选择是否处理">
                        <el-option label="已处理" value="1"></el-option>
                        <el-option label="未处理" value="0"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="违章时间:">
                    <el-date-picker v-model="violationModel.violationTimeVal" type="datetimerange" align="right"
                        unlink-panels range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"
                        :picker-options="pickerOptions" value-format="yyyy-MM-dd HH:mm:ss">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="罚款:">
                    <el-input-number :min="0" v-model="violationModel.lowFine" placeholder="请输入最低罚款"></el-input-number>
                    <el-input-number :min="0" v-model="violationModel.highFine" placeholder="请输入最高罚款"></el-input-number>
                </el-form-item>
                <el-form-item label="操作:">
                    <el-button type="primary" @click="onSubmit()" :icon="getPermissionIcon('busi:violation:select')"
                        v-if="hasPermission('busi:violation:select')">查询</el-button>
                    <el-button type="warning" @click="resetForm()" :icon="getPermissionIcon('busi:violation:reset')"
                        v-if="hasPermission('busi:violation:reset')">重置</el-button>
                    <el-button type="success" @click="handleCreate()" :icon="getPermissionIcon('busi:violation:add')"
                        v-if="hasPermission('busi:violation:add')">新增</el-button>
                    <el-button type="danger" @click="deleteBatch()" :icon="getPermissionIcon('busi:violation:delete')"
                        v-if="hasPermission('busi:violation:delete')">批量删除</el-button>
                    <el-button type="primary" @click="exportExcel()" :icon="getPermissionIcon('busi:violation:export')"
                        v-if="hasPermission('busi:violation:export')">导出Excel</el-button>
                </el-form-item>
            </el-form>
            <el-table :data="tableData" style="width: 1245px;margin-bottom: 20px" border stripe
                @selection-change="handelSelectChange">
                <el-table-column type="selection" width="55" fixed></el-table-column>
                <el-table-column label="序号" width="55" fixed>
                    <template slot-scope="scope">
                        {{ scope.$index + 1 + (start - 1) * size }}
                    </template>
                </el-table-column>
                <el-table-column prop="autoNum" label="车牌号" width="100"></el-table-column>
                <el-table-column prop="reason" label="违章事由" width="200"></el-table-column>
                <el-table-column prop="location" label="违章地点" width="200"></el-table-column>
                <el-table-column prop="violationTime" label="违章时间" width="160"></el-table-column>
                <el-table-column prop="deductPoints" label="扣分" width="70"></el-table-column>
                <el-table-column prop="fine" label="罚款" width="100"></el-table-column>
                <el-table-column prop="status" label="是否处理" width="100">
                    <template slot-scope="scope">
                        <el-tag v-if="scope.row.status == 1" type="success">已处理</el-tag>
                        <el-tag v-else type="danger">未处理</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="200">
                    <template slot-scope="scope">
                        <el-button type="primary" @click="handleEdit(scope.row)"
                            :icon="getPermissionIcon('busi:violation:edit')"
                            v-if="hasPermission('busi:violation:edit')">编辑</el-button>
                        <el-button type="danger" @click="handleDelete(scope.row)"
                            :icon="getPermissionIcon('busi:violation:delete')"
                            v-if="hasPermission('busi:violation:delete')">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <el-pagination background layout="total, prev, pager, next, jumper" :current-page="start" :page-size="size"
                :total="total" @current-change="search"></el-pagination>
            <el-dialog :title="titleMap[dialogStatus]" :visible.sync="dialogFormVisible">
                <el-form :model="saveViolation" label-width="100px" :rules="rules" ref="form">
                    <el-form-item label="车牌号" prop="autoNum">
                        <el-input v-model="saveViolation.autoNum" placeholder="请输入车牌号"></el-input>
                    </el-form-item>
                    <el-form-item label="违章事由" prop="reason">
                        <el-input v-model="saveViolation.reason" placeholder="请输入违章事由"></el-input>
                    </el-form-item>
                    <el-form-item label="违章地点" prop="location">
                        <el-input v-model="saveViolation.location" placeholder="请输入违章地点"></el-input>
                    </el-form-item>
                    <el-form-item label="是否处理" prop="status">
                        <el-radio-group v-model="saveViolation.status">
                            <el-radio-button label="1">已处理</el-radio-button>
                            <el-radio-button label="0">未处理</el-radio-button>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="违章时间" prop="violationTime">
                        <el-date-picker v-model="saveViolation.violationTime" type="datetime" align="right"
                            value-format="yyyy-MM-dd HH:mm:ss">
                        </el-date-picker>
                    </el-form-item>
                    <el-form-item label="扣分" prop="deductPoints">
                        <el-input-number :min="0" v-model="saveViolation.deductPoints"
                            placeholder="请输入扣分"></el-input-number>
                    </el-form-item>
                    <el-form-item label="罚款" prop="fine">
                        <el-input-number :min="0" v-model="saveViolation.fine" placeholder="请输入罚款"></el-input-number>
                    </el-form-item>
                </el-form>
                <div slot="footer" class="dialog-footer">
                    <el-button @click="dialogFormVisible = false">取消</el-button>
                    <el-button type="primary"
                        @click="dialogStatus === 'create' ? createData() : updateData()">确定</el-button>
                </div>
            </el-dialog>
        </el-main>
    </div>
</template>
<script>
import violationApi from '@/api/violation';
import autoInfoApi from '@/api/auto_info';
import { getToken } from '@/utils/auth'
export default {
    name: 'violationList',
    data() {
        const autoNumRule = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-Z0-9]{4}[A-Z0-9挂学警港澳]{1}$/;
        return {
            violationModel: {},
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
            multipleSelection: [],
            dialogFormVisible: false,
            saveViolation: {

            },
            dialogStatus: '',
            rules: {
                autoNum: [
                    { required: true, message: '请输入车牌号', trigger: 'blur' },
                    {
                        async validator(rule, value, callback) {
                            if (value === undefined) {
                                callback();
                                return;
                            }

                            if (value.length !== 7 || !autoNumRule.test(value)) {
                                callback('车牌号格式不正确');
                                return;
                            }

                            try {
                                const res = await autoInfoApi.exist({ autoNum: value });
                                if (!res.success) {
                                    callback('验证服务返回失败');
                                    return;
                                }

                                if (res.message === '存在该车牌号码') {
                                    callback();
                                } else {
                                    callback('车牌号不存在');
                                }
                            } catch (error) {
                                console.error('验证服务异常:', error);
                                callback('验证服务异常');
                            }
                        }
                    }
                ],
                reason: [
                    { required: true, message: '请输入违章事由', trigger: 'blur' },
                ],
                location: [
                    { required: true, message: '请输入违章地点', trigger: 'blur' },
                ],
                violationTime: [
                    { required: true, message: '请选择违章时间', trigger: 'change' },
                ],
            },
            titleMap: {
                create: '新增',
                update: '编辑'
            },
        }
    },
    created() {
        this.search()
    },
    methods: {
        async search(start = 1) {
            this.start = start
            if (this.violationModel.violationTimeVal != undefined) {
                this.violationModel.lowViolationTime = this.violationModel.violationTimeVal[0]
                this.violationModel.highViolationTime = this.violationModel.violationTimeVal[1]
            }
            const res = await violationApi.search(this.start, this.size, this.violationModel)
            if (res.success) {
                this.tableData = res.data.records
                this.total = res.data.total
            }
        },
        handleCreate() {
            this.saveViolation = {
                status: '0'
            }
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
            this.violationModel = {}
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
            this.$confirm('此操作将永久删除该数据, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                const res = await violationApi.delete(this.multipleSelection)
                if (res.success) {
                    this.$message({
                        type: 'success',
                        message: '删除成功!'
                    })
                    this.search()
                }
            })
        },
        handleEdit(row) {
            this.dialogStatus = 'update'
            this.dialogFormVisible = true
            this.saveViolation = Object.assign({}, row)
            this.$nextTick(() => {
                this.$refs['form'].clearValidate()
            })
        },
        handleDelete(row) {
            this.$confirm('此操作将永久删除该数据, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                const res = await violationApi.delete(row.id)
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
        createData() {
            this.$refs['form'].validate(async valid => {
                if (valid) {
                    const res = await violationApi.save(this.saveViolation)
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
                    const res = await violationApi.update(this.saveViolation)
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
        exportExcel() {
            let url = `${process.env.VUE_APP_BASE_API}/rental/violation/exportExcel?token=${getToken()}`
            window.open(url)
        }
    }
}
</script>
<style></style>