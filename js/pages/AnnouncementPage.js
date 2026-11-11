import { AnnouncementService } from "../services/AnnouncementService.js";
import { AnnouncementModal } from "../modals/AnnouncementModal.js";
import { UpdateAnnouncementModal } from "../modals/UpdateAnnouncementModal.js";
export class AnnouncementPage {
    announcementService = new AnnouncementService();
    container = document.querySelector("#content-list");
    count = document.querySelector("#result-count");
    refreshButton = document.querySelector("#refresh");
    pagination = document.querySelector("#pagination");
    previousButton = document.querySelector("#previous-page");
    nextButton = document.querySelector("#next-page");
    pageInfo = document.querySelector("#page-info");
    deleteModal = document.querySelector("#delete-announcement-modal");
    confirmDeleteButton = document.querySelector("#confirm-delete");
    cancelDeleteButton = document.querySelector("#cancel-delete");
    closeDeleteButton = document.querySelector("#close-delete-modal");
    deleteError = document.querySelector("#delete-announcement-error");
    announcementModal;
    updateAnnouncementModal;
    pageSize = 5;
    currentPage = 1;
    announcements = [];
    selectedAnnouncementId = null;
    isDeleting = false;
    constructor() {
        this.initializeEvents();
        this.announcementModal = new AnnouncementModal(() => this.loadAnnouncements());
        this.updateAnnouncementModal = new UpdateAnnouncementModal(() => this.loadAnnouncements());
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
            const announcements = await this.announcementService.getAllAnnouncements();
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
            this.container?.append(this.createAnnouncement(announcement));
        });
    }
    createAnnouncement(announcement) {
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
            }
            else {
                date.textContent = "Date unavailable";
            }
        }
        else {
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
        updateButton.setAttribute("aria-label", `Update ${announcement.title}`);
        updateButton.addEventListener("click", () => {
            this.updateAnnouncementModal.open(announcement);
        });
        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "announcement-delete-btn";
        deleteButton.textContent = "Delete";
        deleteButton.setAttribute("aria-label", `Delete ${announcement.title}`);
        deleteButton.addEventListener("click", () => {
            this.openDeleteModal(announcement.announcementId);
        });
        actions.append(updateButton, deleteButton);
        header.append(label, date);
        card.append(header, content, actions);
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
    openDeleteModal(announcementId) {
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
    closeDeleteModal() {
        if (this.isDeleting)
            return;
        if (this.deleteModal) {
            this.deleteModal.hidden = true;
        }
        this.selectedAnnouncementId = null;
    }
    async deleteAnnouncement() {
        if (this.selectedAnnouncementId === null || this.isDeleting) {
            return;
        }
        this.isDeleting = true;
        if (this.confirmDeleteButton) {
            this.confirmDeleteButton.disabled = true;
            this.confirmDeleteButton.textContent = "Deleting...";
        }
        try {
            await this.announcementService.deleteAnnouncement(this.selectedAnnouncementId);
            this.selectedAnnouncementId = null;
            if (this.deleteModal) {
                this.deleteModal.hidden = true;
            }
            await this.loadAnnouncements();
        }
        catch (error) {
            console.error("Failed to delete announcement:", error);
            if (this.deleteError) {
                this.deleteError.textContent =
                    error instanceof Error
                        ? error.message
                        : "Unable to delete announcement.";
                this.deleteError.hidden = false;
            }
        }
        finally {
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
