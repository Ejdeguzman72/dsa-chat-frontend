
import type { Announcement } from "../models/Announcement.js";
import { AnnouncementService } from "../services/AnnouncementService.js";
import { AnnouncementModal } from "../modals/AnnouncementModal.js";
import { UpdateAnnouncementModal } from "../modals/UpdateAnnouncementModal.js"

export class AnnouncementPage {

    private readonly announcementService = new AnnouncementService();

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

    private readonly deleteModal =
        document.querySelector<HTMLElement>("#delete-announcement-modal");

    private readonly confirmDeleteButton =
        document.querySelector<HTMLButtonElement>("#confirm-delete");

    private readonly cancelDeleteButton =
        document.querySelector<HTMLButtonElement>("#cancel-delete");

    private readonly closeDeleteButton =
        document.querySelector<HTMLButtonElement>("#close-delete-modal");

    private readonly deleteError =
        document.querySelector<HTMLElement>("#delete-announcement-error");

    private readonly announcementModal: AnnouncementModal;
    private readonly updateAnnouncementModal: UpdateAnnouncementModal;

    private readonly pageSize = 5;

    private currentPage = 1;
    private announcements: Announcement[] = [];

    private selectedAnnouncementId: number | null = null;
    private isDeleting = false;

    constructor() {
        this.initializeEvents();

        this.announcementModal = new AnnouncementModal(
            () => this.loadAnnouncements()
        );

        this.updateAnnouncementModal = new UpdateAnnouncementModal(
            () => this.loadAnnouncements()
        );

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

        this.confirmDeleteButton?.addEventListener("click", () => {
            void this.deleteAnnouncement();
        });

        this.cancelDeleteButton?.addEventListener("click", () => {
            this.closeDeleteModal();
        });

        this.closeDeleteButton?.addEventListener("click", () => {
            this.closeDeleteModal();
        });

        this.deleteModal?.addEventListener("click", event => {
            if (event.target === this.deleteModal) {
                this.closeDeleteModal();
            }
        });

        document.addEventListener("keydown", event => {
            if (event.key === "Escape" && this.deleteModal &&
                !this.deleteModal.hidden) {
                this.closeDeleteModal();
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
                await this.announcementService.getAllAnnouncements();

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
        const start = (this.currentPage - 1) * this.pageSize;

        const visibleAnnouncements = this.announcements.slice(
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
            this.previousButton.disabled = this.currentPage === 1;
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

        const label = document.createElement("h2");
        label.className = "tag";
        label.textContent = announcement.title ?? "Untitled announcement";

        const date = document.createElement("time");

        if (announcement.sentDatetime) {
            const parsedDate = new Date(announcement.sentDatetime);

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
        content.className = "announcement-content";
        content.textContent = announcement.content ?? "";

        const actions = document.createElement("div");
        actions.className = "announcement-actions";

        const updateButton = document.createElement("button");
        updateButton.type = "button";
        updateButton.className = "announcement-update-btn";
        updateButton.textContent = "Update";
        updateButton.setAttribute(
            "aria-label",
            `Update ${announcement.title}`
        );

        updateButton.addEventListener("click", () => {
            this.updateAnnouncementModal.open(announcement);
        });

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "announcement-delete-btn";
        deleteButton.textContent = "Delete";
        deleteButton.setAttribute(
            "aria-label",
            `Delete ${announcement.title}`
        );

        deleteButton.addEventListener("click", () => {
            this.openDeleteModal(announcement.announcementId);
        });

        actions.append(updateButton, deleteButton);

        header.append(label, date);
        card.append(header, content, actions);

        return card;
    }

    private showStatus(message: string): void {

        if (!this.container) return;

        const element = document.createElement("div");
        element.className = "status";
        element.textContent = message;

        this.container.replaceChildren(element);
    }

    private openDeleteModal(announcementId: number): void {

        this.selectedAnnouncementId = announcementId;

        if (this.deleteError) {
            this.deleteError.hidden = true;
            this.deleteError.textContent = "";
        }

        if (this.deleteModal) {
            this.deleteModal.hidden = false;
        }

        this.confirmDeleteButton?.focus();
    }

    private closeDeleteModal(): void {

        if (this.isDeleting) return;

        if (this.deleteModal) {
            this.deleteModal.hidden = true;
        }

        this.selectedAnnouncementId = null;
    }

    private async deleteAnnouncement(): Promise<void> {

        if (this.selectedAnnouncementId === null || this.isDeleting) {
            return;
        }

        this.isDeleting = true;

        if (this.confirmDeleteButton) {
            this.confirmDeleteButton.disabled = true;
            this.confirmDeleteButton.textContent = "Deleting...";
        }

        try {
            await this.announcementService.deleteAnnouncement(
                this.selectedAnnouncementId
            );

            this.selectedAnnouncementId = null;

            if (this.deleteModal) {
                this.deleteModal.hidden = true;
            }

            await this.loadAnnouncements();

        } catch (error) {
            console.error("Failed to delete announcement:", error);

            if (this.deleteError) {
                this.deleteError.textContent =
                    error instanceof Error
                        ? error.message
                        : "Unable to delete announcement.";

                this.deleteError.hidden = false;
            }

        } finally {
            this.isDeleting = false;

            if (this.confirmDeleteButton) {
                this.confirmDeleteButton.disabled = false;
                this.confirmDeleteButton.textContent =
                    "Delete Announcement";
            }
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    new AnnouncementPage();
});
