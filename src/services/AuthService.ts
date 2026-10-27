
import { AuthenticationError } from "../models/AuthenticationError.js";
import type { LoginRequest } from "../models/LoginRequest.js";
import type { LoginResponse } from "../models/LoginResponse.js";
import type { AxiosStatic, AxiosInstance, AxiosResponse } from "axios";

declare const axios: AxiosStatic;

export class AuthService {

    private readonly api: AxiosInstance;
    private readonly tokenKey = "dsa_chat_access_token";

    constructor() {
        this.api = axios.create({
            baseURL: "http://localhost:8080",
            timeout: 10000,
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        });

        this.api.interceptors.request.use((config) => {
            const token = this.getAccessToken();

            if (token) {
                config.headers.set("Authorization", `Bearer ${token}`);
            }

            return config;
        });
    }

    public async login(
        credentials: LoginRequest
    ): Promise<LoginResponse> {

        try {
            const response: AxiosResponse<LoginResponse> =
                await this.api.post<LoginResponse>(
                    "/auth/authenticate",
                    credentials
                );

            const data = response.data;
            console.log("this is data");
            console.log(data);


            const token = data.token;
            console.log('token - ' + token);

            if (typeof token !== "string" || !token.trim()) {
                throw new AuthenticationError(
                    "Authentication token was not returned.",
                    response.status
                );
            }

            this.setAccessToken(token);

            return data;

        } catch (error: unknown) {
            if (error instanceof AuthenticationError) {
                throw error;
            }

            if (axios.isAxiosError(error)) {
                throw new AuthenticationError(
                    this.getErrorMessage(error.response?.status ?? 0),
                    error.response?.status ?? 0
                );
            }

            throw error;
        }
    }

    public getAccessToken(): string | null {
        return sessionStorage.getItem(this.tokenKey);
    }

    private setAccessToken(token: string): void {
        sessionStorage.setItem(this.tokenKey, token);
    }

    public isAuthenticated(): boolean {
        return Boolean(this.getAccessToken());
    }

    public logout(): void {
        sessionStorage.removeItem(this.tokenKey);
    }

    public async authenticatedRequest<T>(
        method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
        endpoint: string,
        data?: unknown
    ): Promise<T> {

        try {
            const response = await this.api.request<T>({
                method,
                url: endpoint,
                data
            });

            return response.data;

        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                const status = error.response?.status ?? 0;

                if (status === 401) {
                    this.logout();
                }

                throw new AuthenticationError(
                    this.getErrorMessage(status),
                    status
                );
            }

            throw error;
        }
    }

    private getErrorMessage(status: number): string {
        switch (status) {
            case 0:
                return "Unable to connect to the server.";
            case 400:
                return "Invalid request.";
            case 401:
                return "Invalid username or password.";
            case 403:
                return "Access denied.";
            case 404:
                return "API endpoint not found.";
            case 429:
                return "Too many requests. Please try again later.";
            default:
                return status >= 500
                    ? "Server error. Please try again later."
                    : "Request failed. Please try again.";
        }
    }
}
