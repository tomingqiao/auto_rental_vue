import requestHttp from "@/utils/request";
export default {
    async save(data) {
        return await requestHttp.post(`/rental/order`, data);
    },
    async selectUnfinished(start, size, data) {
        return await requestHttp.post(`/rental/order/unfinished/${start}/${size}`, data);
    },
    async updateOrder(data) {
        return await requestHttp.put(`/rental/order`, data);
    },
    async selectAll(start, size, data) {
        return await requestHttp.post(`/rental/order/${start}/${size}`, data);
    },
    async returnDeposit(autoId) {
        return await requestHttp.get(`/rental/order/returnDeposit/${autoId}`);
    },
    async updateStatus(orderId) {
        return await requestHttp.put(`/rental/order/updateStatus/${orderId}`);
    }
}