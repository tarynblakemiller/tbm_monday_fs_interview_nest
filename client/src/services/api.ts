import axios, { AxiosInstance, AxiosResponse } from "axios";
import { FormData, FragranceData } from "../components/Order/OrderForm/types";

export const apiClient: AxiosInstance = axios.create({
  baseURL: "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

export const orderService = {
  create: (payload: FormData): Promise<AxiosResponse<FormData>> =>
    axios.post("/api/orders", payload),
  update: (
    id: string,
    payload: Partial<FormData>
  ): Promise<AxiosResponse<FormData>> =>
    axios.put(`/api/orders/${id}`, payload),
  delete: (id: string): Promise<AxiosResponse<void>> =>
    axios.delete(`/api/orders/${id}`),
  getFragrances: (): Promise<AxiosResponse<FragranceData[]>> =>
    axios.get("/api/fragrances"),
};

export const fragranceApi = {
  getAll: (): Promise<AxiosResponse<FragranceData[]>> =>
    apiClient.get("api/fragrances"),
  getById: (id: string): Promise<AxiosResponse<FragranceData>> =>
    apiClient.get(`api/fragrances/${id}`),
  create: (
    data: Omit<FragranceData, "id">
  ): Promise<AxiosResponse<FragranceData>> =>
    apiClient.post("api/fragrances", data),
  update: (
    id: string,
    data: Partial<FragranceData>
  ): Promise<AxiosResponse<FragranceData>> =>
    apiClient.put(`api/fragrances/${id}`, data),
  delete: (id: string): Promise<AxiosResponse<void>> =>
    apiClient.delete(`api/fragrances/${id}`),
};
