import type { AxiosStatic, AxiosInstance, AxiosResponse } from "axios";
import type { ChatMessage } from "../models/ChatMessage"; 
import { ChatMessageListResponse } from "../models/ChatMessageListResponse";

declare const axios: AxiosStatic;

export class MessageService {
    private readonly baseUrl = "http://localhost:8080";

    async getAllMessages(): Promise<ChatMessage[]>{
        const token = sessionStorage.getItem("dsa_chat_access_token");

        const response = await axios.get<ChatMessageListResponse>(
            `${this.baseUrl}/chat/all`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        console.log(response.data.list);
        return response.data.list;
    }
}