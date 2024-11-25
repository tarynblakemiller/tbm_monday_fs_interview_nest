export interface ApiResponse<T> {
  status: "success";
  data: T;
}

export interface AxiosSuccessResponse<T> {
  data: ApiResponse<T>;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: any;
  request: any;
}
