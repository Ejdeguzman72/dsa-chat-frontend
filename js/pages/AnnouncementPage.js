import { AnnouncementService } from "../services/AnnouncementService.js";
export class AnnouncementPage {
    service = new AnnouncementService();
    container = document.querySelector("#announcements-list");
    constructor() {
        document
            .querySelector("#refresh-announcements")
            ?.addEventListener("click", () => {
            void this.loadAnnouncements();
        });
        void this.loadAnnouncements();
    }
    async loadAnnouncements() {
        if (!this.container)
            return;
        this.container.replaceChildren();
        const loading = document.createElement("p");
        loading.className = "announcement-status";
        loading.textContent = "Loading announcements...";
        this.container.append(loading);
        try {
            const announcements = await this.service.getAllAnnouncements();
            this.container.replaceChildren();
            if (announcements.length === 0) {
                const empty = document.createElement("p");
                empty.className = "announcement-status";
                empty.textContent = "No announcements available.";
                this.container.append(empty);
                return;
            }
            // Sort announcements by newest first,
            // then select only the first 5
            const latestAnnouncements = announcements
                .sort((a, b) => (Date.parse(b.sentDatetime ?? "") || 0) -
                (Date.parse(a.sentDatetime ?? "") || 0))
                .slice(0, 5);
            // Display only those 5 announcements
            latestAnnouncements.forEach(announcement => {
                this.container?.append(this.createAnnouncement(announcement));
            });
        }
        catch (error) {
            console.error("Failed to load announcements:", error);
            this.container.replaceChildren();
            const message = document.createElement("p");
            message.className = "announcement-status";
            message.textContent = "Unable to load announcements.";
            this.container.append(message);
        }
    }
    createAnnouncement(announcement) {
        const card = document.createElement("article");
        card.className = "announcement-item";
        const header = document.createElement("div");
        header.className = "announcement-meta";
        const label = document.createElement("strong");
        label.textContent = "Community announcement";
        const date = document.createElement("time");
        if (announcement.sentDatetime) {
            const parsedDate = new Date(announcement.sentDatetime);
            if (!Number.isNaN(parsedDate.getTime())) {
                date.dateTime = announcement.sentDatetime;
                date.textContent =
                    parsedDate.toLocaleString();
            }
        }
        const content = document.createElement("p");
        content.textContent = announcement.content;
        header.append(label, date);
        card.append(header, content);
        return card;
    }
}
document.addEventListener("DOMContentLoaded", () => {
    new AnnouncementPage();
});
