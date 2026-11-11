import { AnnouncementService } from "../services/AnnouncementService.js";
export class AnnouncementModal {
    onAnnouncementCreated;
    announcementService = new AnnouncementService();
    modal;
    openButton;
    closeButton;
    cancelButton;
    form;
    titleInput;
    contentInput;
    errorElement;
    submitButton;
    isSubmitting = false;
    constructor(onAnnouncementCreated) {
        this.onAnnouncementCreated = onAnnouncementCreated;
        this.modal = this.getElement("#announcement-modal");
        this.openButton = this.getElement("#add-announcement-btn");
        this.closeButton = this.getElement("#close-announcement-modal");
        this.cancelButton = this.getElement("#cancel-announcement");
        this.form = this.getElement("#create-announcement-form");
        this.titleInput = this.getElement("#announcement-title");
        this.contentInput = this.getElement("#announcement-content");
        this.errorElement = this.getElement("#announcement-error");
        this.submitButton = this.getElement('#create-announcement-form button[type="submit"]');
        this.initializeEvents();
    }
    getElement(selector) {
        const element = document.querySelector(selector);
        if (!element) {
            throw new Error(`Element not found: ${selector}`);
        }
        return element;
    }
    initializeEvents() {
        // Open modal
        this.openButton.addEventListener("click", () => {
            this.open();
        });
        // Close modal
        this.closeButton.addEventListener("click", () => {
            this.close();
        });
        // Cancel
        this.cancelButton.addEventListener("click", () => {
            this.close();
        });
        // Close when clicking outside the modal
        this.modal.addEventListener("click", (event) => {
            if (event.target === this.modal) {
                this.close();
            }
        });
        // Close when pressing Escape
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && !this.modal.hidden) {
                this.close();
            }
        });
        // Submit announcement
        this.form.addEventListener("submit", (event) => {
            event.preventDefault();
            void this.createAnnouncement();
        });
    }
    open() {
        if (this.isSubmitting) {
            return;
        }
        this.hideError();
        this.modal.hidden = false;
        this.titleInput.focus();
    }
    close() {
        if (this.isSubmitting) {
            return;
        }
        this.modal.hidden = true;
        this.hideError();
        this.openButton.focus();
    }
    async createAnnouncement() {
        if (this.isSubmitting) {
            return;
        }
        const title = this.titleInput.value.trim();
        const content = this.contentInput.value.trim();
        // Validate input
        if (!title) {
            this.showError("Announcement title is required.");
            this.titleInput.focus();
            return;
        }
        if (!content) {
            this.showError("Announcement content is required.");
            this.contentInput.focus();
            return;
        }
        this.isSubmitting = true;
        this.submitButton.disabled = true;
        this.submitButton.textContent = "Publishing...";
        this.hideError();
        try {
            // Build announcement request
            const request = {
                announcementId: 0,
                title: title,
                content: content,
                sentDatetime: null,
                creationDate: null,
                updateDateTime: null
            };
            // Send request through AnnouncementService
            await this.announcementService.createAnnouncement(request);
            // Clear form
            this.form.reset();
            // Close modal
            this.modal.hidden = true;
            this.openButton.focus();
            // Refresh AnnouncementPage
            try {
                await this.onAnnouncementCreated();
            }
            catch (refreshError) {
                console.error("Announcement created but refresh failed:", refreshError);
            }
        }
        catch (error) {
            console.error("Failed to create announcement:", error);
            this.showError(this.getErrorMessage(error));
        }
        finally {
            this.isSubmitting = false;
            this.submitButton.disabled = false;
            this.submitButton.textContent =
                "Publish Announcement";
        }
    }
    getErrorMessage(error) {
        if (error instanceof Error) {
            const axiosError = error;
            const status = axiosError.response?.status;
            if (status === 401) {
                return "Your session has expired. Please sign in again.";
            }
            if (status === 403) {
                return "You do not have permission to create announcements.";
            }
            if (status === 400) {
                return axiosError.response?.data?.message
                    ?? "Invalid announcement information.";
            }
            return error.message;
        }
        return "An unexpected error occurred.";
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
