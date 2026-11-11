
import {
    Announcement,
    AnnouncementService
} from "../services/AnnouncementService.js";

export class AnnouncementPage {

    private readonly service = new AnnouncementService();

    private readonly container =
        document.querySelector<HTMLElement>("#content-list");

    private readonly count =
        document.querySelector<HTMLElement>("#result-count");

    private readonly refreshButton =
        document.querySelector<HTMLButtonElement>("#refresh");

    private readonly pagination =
        document.querySelector<HTMLElement>("#pagination");

    private readonly previousButton =
        document.querySelector<HTMLButtonElement>("#previous-page");

    private readonly nextButton =
        document.querySelector<HTMLButtonElement>("#next-page");

    private readonly pageInfo =
        document.querySelector<HTMLElement>("#page-info");

    private readonly pageSize = 5;

    private currentPage = 1;

    private announcements: Announcement[] = [];

    constructor() {
        this.initializeEvents();
        void this.loadAnnouncements();
    }

    private initializeEvents(): void {

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

    private get totalPages(): number {
        return Math.max(
            1,
            Math.ceil(this.announcements.length / this.pageSize)
        );
    }

    private async loadAnnouncements(): Promise<void> {

        if (!this.container) return;

        this.refreshButton?.setAttribute("disabled", "");

        if (this.count) {
            this.count.textContent = "Loading…";
        }

        if (this.pagination) {
            this.pagination.hidden = true;
        }

        this.showStatus("Loading announcements…");

        try {
            const announcements =
                await this.service.getAllAnnouncements();

            this.announcements = [...announcements].sort(
                (a, b) =>
                    this.getDateValue(b.sentDatetime) -
                    this.getDateValue(a.sentDatetime)
            );

            this.currentPage = 1;

            this.renderPage();

        } catch (error) {
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

        } finally {
            this.refreshButton?.removeAttribute("disabled");
        }
    }

    private getDateValue(value?: string | null): number {
        if (!value) return 0;

        const timestamp = Date.parse(value);

        return Number.isNaN(timestamp) ? 0 : timestamp;
    }

    private renderPage(): void {

        if (!this.container) return;

        const total = this.announcements.length;

        const start =
            (this.currentPage - 1) * this.pageSize;

        const visibleAnnouncements =
            this.announcements.slice(
                start,
                start + this.pageSize
            );

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
            this.container?.append(
                this.createAnnouncement(announcement)
            );
        });
    }

    private createAnnouncement(
        announcement: Announcement
    ): HTMLElement {

        const card = document.createElement("article");
        card.className = "item";

        const header = document.createElement("div");
        header.className = "meta";

        const label = document.createElement("span");
        label.className = "tag";
        label.textContent = "Community announcement";

        const date = document.createElement("time");

        if (announcement.sentDatetime) {
            const parsedDate = new Date(
                announcement.sentDatetime
            );

            if (!Number.isNaN(parsedDate.getTime())) {
                date.dateTime = announcement.sentDatetime;
                date.textContent = parsedDate.toLocaleString();
            } else {
                date.textContent = "Date unavailable";
            }
        } else {
            date.textContent = "Date unavailable";
        }

        const content = document.createElement("p");
        content.textContent = announcement.content ?? "";

        header.append(label, date);
        card.append(header, content);

        return card;
    }

    private showStatus(message: string): void {

        if (!this.container) return;

        const element = document.createElement("div");
        element.className = "status";
        element.textContent = message;

        this.container.replaceChildren(element);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    new AnnouncementPage();
});
