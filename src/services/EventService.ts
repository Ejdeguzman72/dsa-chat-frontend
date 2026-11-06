import type { AxiosStatic, AxiosInstance, AxiosResponse } from "axios";
import type { Event } from "../models/Event";
import { EventListResponse } from "../models/EventLIstResponse";
import { Announcement } from "./AnnouncementService";
import { AnnouncementListResponse } from "../models/AnnouncementListResponse";

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
}