import { AnnouncementService } from "../services/AnnouncementService.js";
export class AnnouncementPage {
    service = new AnnouncementService();
    container = document.querySelector("#content-list");
    count = document.querySelector("#result-count");
    refreshButton = document.querySelector("#refresh");
    pagination = document.querySelector("#pagination");
    previousButton = document.querySelector("#previous-page");
    nextButton = document.querySelector("#next-page");
    pageInfo = document.querySelector("#page-info");
    pageSize = 5;
    currentPage = 1;
    announcements = [];
    constructor() {
        this.initializeEvents();
        void this.loadAnnouncements();
    }
    initializeEvents() {
        this.refreshButton?.addEventListener("click", () => {
            void this.loadAnnouncements();
        });
        this.previousButton?.addEventListener("click", () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.renderPage();
            }
        });
        this.nextButton?.addEventListener("click", () => {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
                this.renderPage();
            }
        });
    }
    get totalPages() {
        return Math.max(1, Math.ceil(this.announcements.length / this.pageSize));
    }
    async loadAnnouncements() {
        if (!this.container)
            return;
        this.refreshButton?.setAttribute("disabled", "");
        if (this.count) {
            this.count.textContent = "Loading…";
        }
        if (this.pagination) {
            this.pagination.hidden = true;
        }
        this.showStatus("Loading announcements…");
        try {
            const announcements = await this.service.getAllAnnouncements();
            this.announcements = [...announcements].sort((a, b) => this.getDateValue(b.sentDatetime) -
                this.getDateValue(a.sentDatetime));
            this.currentPage = 1;
            this.renderPage();
        }
        catch (error) {
            console.error("Failed to load announcements:", error);
            this.announcements = [];
            if (this.count) {
                this.count.textContent =
                    "Could not load announcements";
            }
            if (this.pagination) {
                this.pagination.hidden = true;
            }
            this.showStatus("Unable to load announcements.");
        }
        finally {
            this.refreshButton?.removeAttribute("disabled");
        }
    }
    getDateValue(value) {
        if (!value)
            return 0;
        const timestamp = Date.parse(value);
        return Number.isNaN(timestamp) ? 0 : timestamp;
    }
    renderPage() {
        if (!this.container)
            return;
        const total = this.announcements.length;
        const start = (this.currentPage - 1) * this.pageSize;
        const visibleAnnouncements = this.announcements.slice(start, start + this.pageSize);
        this.container.replaceChildren();
        if (this.count) {
            this.count.textContent = total
                ? `Showing ${start + 1}–${start + visibleAnnouncements.length} of ${total} announcements`
                : "0 announcements";
        }
        if (this.pagination) {
            this.pagination.hidden = this.totalPages <= 1;
        }
        if (this.pageInfo) {
            this.pageInfo.textContent =
                `Page ${this.currentPage} of ${this.totalPages}`;
        }
        if (this.previousButton) {
            this.previousButton.disabled =
                this.currentPage === 1;
        }
        if (this.nextButton) {
            this.nextButton.disabled =
                this.currentPage >= this.totalPages;
        }
        if (total === 0) {
            this.showStatus("No announcements available.");
            return;
        }
        visibleAnnouncements.forEach(announcement => {
            this.container?.append(this.createAnnouncement(announcement));
        });
    }
    createAnnouncement(announcement) {
        const card = document.createElement("article");
        card.className = "item";
        const header = document.createElement("div");
        header.className = "meta";
        const label = document.createElement("span");
        label.className = "tag";
        label.textContent = "Community announcement";
        const date = document.createElement("time");
        if (announcement.sentDatetime) {
            const parsedDate = new Date(announcement.sentDatetime);
            if (!Number.isNaN(parsedDate.getTime())) {
                date.dateTime = announcement.sentDatetime;
                date.textContent = parsedDate.toLocaleString();
            }
            else {
                date.textContent = "Date unavailable";
            }
        }
        else {
            date.textContent = "Date unavailable";
        }
        const content = document.createElement("p");
        content.textContent = announcement.content ?? "";
        header.append(label, date);
        card.append(header, content);
        return card;
    }
    showStatus(message) {
        if (!this.container)
            return;
        const element = document.createElement("div");
        element.className = "status";
        element.textContent = message;
        this.container.replaceChildren(element);
    }
}
document.addEventListener("DOMContentLoaded", () => {
    new AnnouncementPage();
});
