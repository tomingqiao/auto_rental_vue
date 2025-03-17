import requestHttp from "@/utils/request";
export default {
    async delete(ids) {
        return await requestHttp.delete(`/rental/role/${ids}`);
    },
    async update(data) {
        return await requestHttp.put(`/rental/role`, data);
    },
    async save(data) {
        return await requestHttp.post(`/rental/role`, data);
    },
    async search(start, size, data) {
        return await requestHttp.post(`/rental/role/${start}/${size}`, data);
    },
    async hasUser(id) {
        return await requestHttp.get(`/rental/role/hasUser/${id}`);
    },
    async permissionTree(data) {
        return await requestHttp.get(`/rental/role/permissionTree`, data);
    },
    async assignPermission(roleId, permissionIds) {
        return await requestHttp.get(`/rental/role/${roleId}/${permissionIds}`);
    },
    async list() {
        return await requestHttp.get(`/rental/role`);
    }
}