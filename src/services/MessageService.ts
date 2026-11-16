

import type { AxiosStatic, AxiosInstance, AxiosResponse } from "axios";
import { ChatMessageListResponse } from "../models/ChatMessageListResponse";
import { ChatMessage } from "../models/ChatMessage.js";
import { ChatMessageDTOListResponse } from "../models/ChatMessageDTOListResponse";

declare const axios: AxiosStatic;

export class MessageService {
    private readonly baseUrl = "http://localhost:8080";
    private readonly tokenKey = "dsa_chat_access_token";
    
    public async getAllMessages(): Promise<ChatMessageListResponse> {
        const token = sessionStorage.getItem("dsa_chat_access_token");
        const response = await axios.get(`${this.baseUrl}/chat/all`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        console.log(response.data);
        return response.data;
    }

    public async getAllMessageDTOs(): Promise<ChatMessageDTOListResponse> {
        const token = sessionStorage.getItem("dsa_chat_access_token");
        const response = await axios.get(`${this.baseUrl}/chat/all/dto`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        console.log(response.data);
        return response.data;
    }
}
