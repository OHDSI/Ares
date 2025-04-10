import { COST_DOMAIN_SUMMARY, COST_TIMESERIES } from "@/shared/config/files";

export default function costTable(data) {
    const costTable = data[COST_DOMAIN_SUMMARY];
    const timeSeries = data[COST_TIMESERIES];
    return {
        costTable,
        timeSeries,
    };
}
