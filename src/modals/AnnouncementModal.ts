
import { AnnouncementService } from "../services/AnnouncementService.js";
import type { Announcement } from "../models/Announcement.js";

export class AnnouncementModal {

    private readonly announcementService = new AnnouncementService();

    private readonly modal: HTMLElement;
    private readonly openButton: HTMLButtonElement;
    private readonly closeButton: HTMLButtonElement;
    private readonly cancelButton: HTMLButtonElement;
    private readonly form: HTMLFormElement;
    private readonly titleInput: HTMLInputElement;
    private readonly contentInput: HTMLTextAreaElement;
    private readonly errorElement: HTMLElement;
    private readonly submitButton: HTMLButtonElement;

    private isSubmitting = false;

    constructor(
        private readonly onAnnouncementCreated: () => void | Promise<void>
    ) {
        this.modal = this.getElement<HTMLElement>(
            "#announcement-modal"
        );

        this.openButton = this.getElement<HTMLButtonElement>(
            "#add-announcement-btn"
        );

        this.closeButton = this.getElement<HTMLButtonElement>(
            "#close-announcement-modal"
        );

        this.cancelButton = this.getElement<HTMLButtonElement>(
            "#cancel-announcement"
        );

        this.form = this.getElement<HTMLFormElement>(
            "#create-announcement-form"
        );

        this.titleInput = this.getElement<HTMLInputElement>(
            "#announcement-title"
        );

        this.contentInput = this.getElement<HTMLTextAreaElement>(
            "#announcement-content"
        );

        this.errorElement = this.getElement<HTMLElement>(
            "#announcement-error"
        );

        this.submitButton = this.getElement<HTMLButtonElement>(
            '#create-announcement-form button[type="submit"]'
        );

        this.initializeEvents();
    }

    private getElement<T extends HTMLElement>(
        selector: string
    ): T {

        const element = document.querySelector<T>(selector);

        if (!element) {
            throw new Error(`Element not found: ${selector}`);
        }

        return element;
    }

    private initializeEvents(): void {

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

    public open(): void {

        if (this.isSubmitting) {
            return;
        }

        this.hideError();

        this.modal.hidden = false;

        this.titleInput.focus();
    }

    public close(): void {

        if (this.isSubmitting) {
            return;
        }

        this.modal.hidden = true;

        this.hideError();

        this.openButton.focus();
    }

    private async createAnnouncement(): Promise<void> {

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
            const request: Announcement = {
                announcementId: 0,
                title: title,
                content: content,
                sentDatetime: null,
                creationDate: null,
                updateDateTime: null
            };

            // Send request through AnnouncementService
            await this.announcementService.createAnnouncement(
                request
            );

            // Clear form
            this.form.reset();

            // Close modal
            this.modal.hidden = true;
            this.openButton.focus();

            // Refresh AnnouncementPage
            try {
                await this.onAnnouncementCreated();
            } catch (refreshError) {
                console.error(
                    "Announcement created but refresh failed:",
                    refreshError
                );
            }

        } catch (error) {

            console.error(
                "Failed to create announcement:",
                error
            );

            this.showError(
                this.getErrorMessage(error)
            );

        } finally {

            this.isSubmitting = false;

            this.submitButton.disabled = false;

            this.submitButton.textContent =
                "Publish Announcement";
        }
    }

    private getErrorMessage(error: unknown): string {

        if (error instanceof Error) {
            const axiosError = error as Error & {
                response?: {
                    status?: number;
                    data?: {
                        message?: string;
                    };
                };
            };

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

    private showError(message: string): void {

        this.errorElement.textContent = message;

        this.errorElement.hidden = false;
    }

    private hideError(): void {

        this.errorElement.textContent = "";

        this.errorElement.hidden = true;
    }
}
