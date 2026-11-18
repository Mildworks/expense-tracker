import api from "./axios";

export async function getTransactions(params) {
  const res = await api.get("/transactions", { params });
  return res.data.transactions;
}

export async function createTransaction(payload) {
  const res = await api.post("/transactions", payload);
  return res.data.transaction;
}

export async function updateTransaction(id, payload) {
  const res = await api.put(`/transactions/${id}`, payload);
  return res.data.transaction;
}

export async function deleteTransaction(id) {
  await api.delete(`/transactions/${id}`);
}