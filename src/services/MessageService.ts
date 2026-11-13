
import type { ChatMessageDto } from "../models/ChatMessageDto.js";
import type { ChatMessageDTOListResponse } from "../models/ChatMessageDTOListResponse.js";

declare const axios: {
    create(config: {
        baseURL: string;
        timeout: number;
    }): {
        get<T>(
            url: string,
            config?: {
                headers?: Record<string, string>;
                params?: Record<string, number>;
            }
        ): Promise<{ data: T }>;
    };
};

export class MessageService {

    private readonly api = axios.create({
        baseURL: "http://localhost:8080",
        timeout: 10000
    });

    private readonly tokenKey = "dsa_chat_access_token";

    public getToken(): string | null {
        return (
            sessionStorage.getItem(this.tokenKey) ??
            localStorage.getItem(this.tokenKey)
        );
    }

    public async getChatHistory(
        limit = 50
    ): Promise<ChatMessageDto[]> {

        if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
            throw new Error("History limit must be between 1 and 100");
        }

        const token = this.getToken();

        if (!token) {
            throw new Error("Authentication token not found");
        }

        const response = await this.api.get<
            ChatMessageDto[] | ChatMessageDTOListResponse
        >("/chat/all/dto", {
            headers: {
                Authorization: `Bearer ${token}`
            },
            params: { limit }
        });

        if (Array.isArray(response.data)) {
            return response.data;
        }

        if (
            response.data &&
            Array.isArray(response.data.list)
        ) {
            return response.data.list;
        }

        throw new Error("Unexpected chat history response");
    }
}
