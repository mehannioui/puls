export interface Service {
  id: string;
  org_id: string;
  name: string;
  url: string;
  method: string;
  expected_status: number;
  interval_seconds: number;
  timeout_seconds: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateServiceInput {
  name: string;
  url: string;
  method: string;
  expected_status: number;
  interval_seconds: number;
  timeout_seconds: number;
}

export interface UpdateServiceInput {
  name: string;
  url: string;
  method: string;
  expected_status: number;
  interval_seconds: number;
  timeout_seconds: number;
  is_active: boolean;
}

export const useServices = () => {
  const api = useApi();

  const list = () => api<Service[]>("/api/services");

  const create = (input: CreateServiceInput) =>
    api<Service>("/api/services", { method: "POST", body: input });

  const update = (id: string, input: UpdateServiceInput) =>
    api<Service>(`/api/services/${id}`, { method: "PATCH", body: input });

  const remove = (id: string) =>
    api<void>(`/api/services/${id}`, { method: "DELETE" });

  return { list, create, update, remove };
};
