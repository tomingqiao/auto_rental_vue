import requestHttp from "@/utils/request";
export default {
    async search(start, size, data) {
        return await requestHttp.post(`/rental/customer/${start}/${size}`, data);
    },
    async save(data) {
        return await requestHttp.post(`/rental/customer`, data);
    },
    async update(data) {
        return await requestHttp.put(`/rental/customer`, data);
    },
    async delete(ids) {
        return await requestHttp.delete(`/rental/customer/${ids}`);
    },
    async selectByTel(tel) {
        return await requestHttp.get(`/rental/customer/${tel}`);
    }
}