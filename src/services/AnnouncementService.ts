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
}

export { Announcement };
