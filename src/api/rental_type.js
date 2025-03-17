import requestHttp from "@/utils/request";
export default {
    async delete(ids) {
        return await requestHttp.delete(`/rental/rentalType/${ids}`);
    },
    async save(data) {
        return await requestHttp.post(`/rental/rentalType`, data);
    },
    async update(data) {
        return await requestHttp.put(`/rental/rentalType`, data);
    },
    async search(start, size, data) {
        return await requestHttp.post(`/rental/rentalType/${start}/${size}`, data);
    },
    async selectAll() {
        return await requestHttp.get(`/rental/rentalType`);
    }
}