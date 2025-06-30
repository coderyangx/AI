import axios from "axios";
// import { FORM_API_SERVER_MAP } from "../../const/index.js";

declare module "axios" {
  export interface AxiosInstance {
    request<T = any>(config: AxiosRequestConfig): Promise<T>;
    get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
    delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
    head<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
    post<T = any>(
      url: string,
      data?: any,
      config?: AxiosRequestConfig
    ): Promise<T>;
    put<T = any>(
      url: string,
      data?: any,
      config?: AxiosRequestConfig
    ): Promise<T>;
    patch<T = any>(
      url: string,
      data?: any,
      config?: AxiosRequestConfig
    ): Promise<T>;
  }
}

export const formFetch = (ctx: any) => {
  const instance = axios.create({
    // baseURL: FORM_API_SERVER_MAP[ctx.env || "development"],
    headers: {
      Cookie: ctx.cookie || "",
    },
  });

  instance.interceptors.response.use(
    (resp) => {
      if (resp.data?.code === 200) {
        return resp.data.data;
      }
      throw new Error("请求异常");
    },
    (error) => {
      console.log("request error", error.message);
      throw error;
    }
  );

  return instance;
};
