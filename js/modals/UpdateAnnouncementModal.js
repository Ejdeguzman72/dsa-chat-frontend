import { AnnouncementService } from "../services/AnnouncementService.js";
export class UpdateAnnouncementModal {
    onUpdated;
    announcementService = new AnnouncementService();
    modal;
    form;
    titleInput;
    contentInput;
    errorElement;
    submitButton;
    selectedAnnouncement = null;
    isSubmitting = false;
    constructor(onUpdated) {
        this.onUpdated = onUpdated;
        this.modal = this.getElement("#update-announcement-modal");
        this.form = this.getElement("#update-announcement-form");
        this.titleInput = this.getElement("#update-announcement-title");
        this.contentInput = this.getElement("#update-announcement-content");
        this.errorElement = this.getElement("#update-announcement-error");
        this.submitButton = this.getElement("#confirm-update");
        this.initializeEvents();
    }
    getElement(selector) {
        const element = document.querySelector(selector);
        if (!element) {
            throw new Error(`Missing element: ${selector}`);
        }
        return element;
    }
    initializeEvents() {
        document.querySelector("#close-update-modal")
            ?.addEventListener("click", () => this.close());
        document.querySelector("#cancel-update")
            ?.addEventListener("click", () => this.close());
        this.modal.addEventListener("click", event => {
            if (event.target === this.modal) {
                this.close();
            }
        });
        document.addEventListener("keydown", event => {
            if (event.key === "Escape" && !this.modal.hidden) {
                this.close();
            }
        });
        this.form.addEventListener("submit", event => {
            event.preventDefault();
            void this.updateAnnouncement();
        });
    }
    open(announcement) {
        if (this.isSubmitting)
            return;
        this.selectedAnnouncement = announcement;
        this.titleInput.value = announcement.title ?? "";
        this.contentInput.value = announcement.content ?? "";
        this.hideError();
        this.modal.hidden = false;
        this.titleInput.focus();
    }
    close() {
        if (this.isSubmitting)
            return;
        this.modal.hidden = true;
        this.selectedAnnouncement = null;
        this.hideError();
    }
    async updateAnnouncement() {
        if (!this.selectedAnnouncement || this.isSubmitting) {
            throw new Error("Announcement does not exist");
        }
        const title = this.titleInput.value.trim();
        const content = this.contentInput.value.trim();
        if (!title || !content) {
            this.showError("Title and content are required.");
            throw new Error("Title and content are required");
        }
        const request = {
            ...this.selectedAnnouncement,
            title,
            content
        };
        this.isSubmitting = true;
        this.submitButton.disabled = true;
        this.submitButton.textContent = "Saving...";
        this.hideError();
        try {
            const response = await this.announcementService.updateAnnouncement(request);
            this.modal.hidden = true;
            this.selectedAnnouncement = null;
            return response;
        }
        catch (error) {
            console.error("Failed to update announcement:", error);
            this.showError("Unable to update announcement.");
            throw new Error("Unable to update announcement");
        }
        finally {
            this.isSubmitting = false;
            this.submitButton.disabled = false;
            this.submitButton.textContent = "Save Changes";
        }
    }
    showError(message) {
        this.errorElement.textContent = message;
        this.errorElement.hidden = false;
    }
    hideError() {
        this.errorElement.textContent = "";
        this.errorElement.hidden = true;
    }
}
