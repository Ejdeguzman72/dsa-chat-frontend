import type { AxiosStatic } from "axios";

import type { Announcement } from "../models/Announcement.js";
import { AnnouncementListResponse } from "../models/AnnouncementListResponse.js";

declare const axios: AxiosStatic;

export class AnnouncementService {
    private readonly baseUrl = "http://localhost:8080";

    async getAllAnnouncements(): Promise<Announcement[]> {

        const token = sessionStorage.getItem(
            "dsa_chat_access_token"
        );

        const response = await axios.get<AnnouncementListResponse>(
            `${this.baseUrl}/announcements/all`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        return response.data.list;
    }

    async createAnnouncement(request: Announcement): Promise<Announcement> {
        const token = sessionStorage.getItem("dsa_chat_access_token");

        if (!token) {
            throw new Error("Authentication not found");
        }

        const response = await axios.post(`${this.baseUrl}/announcements/create-announcement`,
            request,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

        return response.data;
    }

    async deleteAnnouncement(announcementId: number): Promise<Announcement> {
        const token = sessionStorage.getItem("dsa_chat_access_token");

        if (!token) {
            throw new Error("Authentication not found");
        }
        console.log(`${this.baseUrl}/announcements/delete/id/${announcementId}`);
        const response = await axios.delete(`${this.baseUrl}/announcements/delete/id/${announcementId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

        console.log(response.data);
        return response.data;    
    }

    async updateAnnouncement(request: Announcement): Promise<Announcement> {
        const token = sessionStorage.getItem("dsa_chat_access_token");

        if (!token) {
            throw new Error("Authentication not found");
        }

        const response = await axios.put(
            `${this.baseUrl}/announcements/update-announcement`,
            request,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
        console.log(response.data);
        return response.data;
    }
}

export { Announcement };
