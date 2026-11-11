export class AnnouncementService {
    baseUrl = "http://localhost:8080";
    async getAllAnnouncements() {
        const token = sessionStorage.getItem("dsa_chat_access_token");
        const response = await axios.get(`${this.baseUrl}/announcements/all`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.list;
    }
    async createAnnouncement(request) {
        const token = sessionStorage.getItem("dsa_chat_access_token");
        if (!token) {
            throw new Error("Authentication not found");
        }
        const response = await axios.post(`${this.baseUrl}/announcements/create-announcement`, request, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    }
    async deleteAnnouncement(announcementId) {
        const token = sessionStorage.getItem("dsa_chat_access_token");
        if (!token) {
            throw new Error("Authentication not found");
        }
        console.log(`${this.baseUrl}/announcements/delete/id/${announcementId}`);
        const response = await axios.delete(`${this.baseUrl}/announcements/delete/id/${announcementId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        console.log(response.data);
        return response.data;
    }
    async updateAnnouncement(request) {
        const token = sessionStorage.getItem("dsa_chat_access_token");
        if (!token) {
            throw new Error("Authentication not found");
        }
        const response = await axios.put(`${this.baseUrl}/announcements/update-announcement`, request, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        console.log(response.data);
        return response.data;
    }
}
