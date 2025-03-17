import requestHttp from "@/utils/request";
export default {
    async save(data) {
        return await requestHttp.post(`/rental/maintain`, data);
    },
    async search(start, size, data) {
        return await requestHttp.post(`/rental/maintain/${start}/${size}`, data);
    },
    async update(data) {
        return await requestHttp.put(`/rental/maintain`, data);
    },
    async delete(ids) {
        return await requestHttp.delete(`/rental/maintain/${ids}`);
    },
}
