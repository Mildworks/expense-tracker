import api from "./axios";

export async function getMonthlyReport(year) {
  const res = await api.get("/reports/monthly", { params: { year } });
  return res.data.months;
}

export async function getCategoryReport(params) {
  const res = await api.get("/reports/categories", { params });
  return res.data.categories;
}