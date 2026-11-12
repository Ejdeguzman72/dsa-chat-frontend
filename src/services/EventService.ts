import type { AxiosStatic, AxiosInstance, AxiosResponse } from "axios";
import type { Event } from "../models/Event";
import { EventListResponse } from "../models/EventLIstResponse";

declare const axios: AxiosStatic;

export class EventService {
    private readonly baseUrl = "http://localhost:8080";

    async getAllEvents(): Promise<Event[]> {
        const token = sessionStorage.getItem("dsa_chat_access_token");
        
        const response = await axios.get<EventListResponse>(
            `${this.baseUrl}/events/all`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        console.log(response.data.list);
        return response.data.list;
    }

    async getEvent(eventId: string): Promise<Event> {
        const token = sessionStorage.getItem("dsa_chat_access_token");

        const response = await axios.get<Event>(
            `${this.baseUrl}/events/events/search/id/${eventId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        console.log(response.data);
        return response.data;
    }

    async createEvent(request: Event): Promise<Event> {
        const token = sessionStorage.getItem("dsa_chat_access_token");

        if (!token) {
            throw new Error("Authentication not found");
        }

        const response = await axios.post(`${this.baseUrl}/events/add`,request, 
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        )

        console.log(response.data);
        return response.data;
    }

    async updateEvent(request: Event): Promise<Event> {
    const token = sessionStorage.getItem("dsa_chat_access_token");

    if (!token) {
        throw new Error("Authentication not found");
    }

    console.log("Sending update request:", request);

    const response = await axios.put<Event>(
        `${this.baseUrl}/events/update`,
        request,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
}

    async deleteEvent(eventId: string): Promise<Event> {
        const token = sessionStorage.getItem("dsa_chat_access_token");

        if (!token) {
            throw new Error("Authentiation not found");
        }

        const response = await axios.delete(`${this.baseUrl}/events/delete/${eventId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        console.log(response.data);

        return response.data;
    }
}