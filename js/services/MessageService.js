export class MessageService {
    api = axios.create({
        baseURL: "http://localhost:8080",
        timeout: 10000
    });
    tokenKey = "dsa_chat_access_token";
    getToken() {
        return (sessionStorage.getItem(this.tokenKey) ??
            localStorage.getItem(this.tokenKey));
    }
    async getChatHistory(limit = 50) {
        if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
            throw new Error("History limit must be between 1 and 100");
        }
        const token = this.getToken();
        if (!token) {
            throw new Error("Authentication token not found");
        }
        const response = await this.api.get("/chat/all/dto", {
            headers: {
                Authorization: `Bearer ${token}`
            },
            params: { limit }
        });
        if (Array.isArray(response.data)) {
            return response.data;
        }
        if (response.data &&
            Array.isArray(response.data.list)) {
            return response.data.list;
        }
        throw new Error("Unexpected chat history response");
    }
}
