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
}
