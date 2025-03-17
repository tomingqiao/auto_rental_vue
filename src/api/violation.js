import requestHttp from "@/utils/request";
export default {
    async delete(ids) {
        return await requestHttp.delete(`/rental/violation/${ids}`);
    },
    async save(data) {
        return requestHttp.post("/rental/violation", data);
    },
    async search(start, size, data) {
        return requestHttp.post(`/rental/violation/${start}/${size}`, data)
    },
    async update(data) {
        return requestHttp.put("/rental/violation", data);
    },
}