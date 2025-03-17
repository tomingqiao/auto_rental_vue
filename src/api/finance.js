import requestHttp from "@/utils/request";
export default {
    async countDay(date) {
        return await requestHttp.get(`/rental/finance/day/${date}`)
    },
    async countDayCost(date) {
        return await requestHttp.get(`/rental/finance/day/cost/${date}`)
    },
    async countMonth(date) {
        return await requestHttp.get(`/rental/finance/month/${date}`)
    },
    async countMonthCost(date) {
        return await requestHttp.get(`/rental/finance/month/cost/${date}`)
    }
}