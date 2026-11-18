import api from "./axios";

export async function getCategories() {
  const res = await api.get("/categories");
  return res.data.categories;
}

export async function createCategory(payload) {
  const res = await api.post("/categories", payload);
  return res.data.category;
}

export async function updateCategory(id, payload) {
  const res = await api.put(`/categories/${id}`, payload);
  return res.data.category;
}

export async function deleteCategory(id) {
  await api.delete(`/categories/${id}`);
}