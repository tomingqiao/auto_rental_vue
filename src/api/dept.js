import requestHttp from "@/utils/request";
export default {
    async search(data) {
        return await requestHttp.post('/rental/dept', data)
    },

    async selectTree() {
        return await requestHttp.get('/rental/dept')
    },
    async delete(id) {
        return await requestHttp.delete(`/rental/dept/${id}`)
    },
    async update(data) {
        return await requestHttp.put('/rental/dept', data)
    },
    async save(data) {
        return await requestHttp.post('/rental/dept/save', data)
    },
    async hasChildren(id) {
        return await requestHttp.get(`/rental/dept/${id}`)
    },
}