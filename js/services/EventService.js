export class EventService {
    baseUrl = "http://localhost:8080";
    async getAllEvents() {
        const token = sessionStorage.getItem("dsa_chat_access_token");
        const response = await axios.get(`${this.baseUrl}/events/all`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        console.log(response.data.list);
        return response.data.list;
    }
}
