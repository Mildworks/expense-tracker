import api from "./axios";

export async function getBudgets(params) {
  const res = await api.get("/budgets", { params });
  return res.data.budgets;
}

export async function createBudget(payload) {
  const res = await api.post("/budgets", payload);
  return res.data.budget;
}

export async function updateBudget(id, amount) {
  const res = await api.put(`/budgets/${id}`, { amount });
  return res.data.budget;
}

export async function deleteBudget(id) {
  await api.delete(`/budgets/${id}`);
}