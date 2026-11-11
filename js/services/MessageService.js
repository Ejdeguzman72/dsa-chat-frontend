export class MessageService {
    baseUrl = "http://localhost:8080";
    async getAllMessages() {
        const token = sessionStorage.getItem("dsa_chat_access_token");
        const response = await axios.get(`${this.baseUrl}/chat/all`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        console.log(response.data.list);
        return response.data.list;
    }
}
