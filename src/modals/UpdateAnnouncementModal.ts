
import { AnnouncementService } from "../services/AnnouncementService.js";
import type { Announcement } from "../models/Announcement.js";

export class UpdateAnnouncementModal {

    private readonly announcementService = new AnnouncementService();

    private readonly modal: HTMLElement;
    private readonly form: HTMLFormElement;
    private readonly titleInput: HTMLInputElement;
    private readonly contentInput: HTMLTextAreaElement;
    private readonly errorElement: HTMLElement;
    private readonly submitButton: HTMLButtonElement;

    private selectedAnnouncement: Announcement | null = null;
    private isSubmitting = false;

    constructor(
        private readonly onUpdated: () => void | Promise<void>
    ) {
        this.modal = this.getElement("#update-announcement-modal");
        this.form = this.getElement("#update-announcement-form");
        this.titleInput = this.getElement("#update-announcement-title");
        this.contentInput = this.getElement("#update-announcement-content");
        this.errorElement = this.getElement("#update-announcement-error");
        this.submitButton = this.getElement("#confirm-update");

        this.initializeEvents();
    }

    private getElement<T extends HTMLElement>(selector: string): T {
        const element = document.querySelector<T>(selector);

        if (!element) {
            throw new Error(`Missing element: ${selector}`);
        }

        return element;
    }

    private initializeEvents(): void {

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

    public open(announcement: Announcement): void {
        if (this.isSubmitting) return;

        this.selectedAnnouncement = announcement;

        this.titleInput.value = announcement.title ?? "";
        this.contentInput.value = announcement.content ?? "";

        this.hideError();

        this.modal.hidden = false;
        this.titleInput.focus();
    }

    public close(): void {

        if (this.isSubmitting) return;

        this.modal.hidden = true;
        this.selectedAnnouncement = null;
        this.hideError();
    }

    private async updateAnnouncement(): Promise<Announcement> {
        if (!this.selectedAnnouncement || this.isSubmitting) {
            throw new Error("Announcement does not exist");
        }

        const title = this.titleInput.value.trim();
        const content = this.contentInput.value.trim();

        if (!title || !content) {
            this.showError("Title and content are required.");
            throw new Error("Title and content are required");
        }

        const request: Announcement = {
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

        } catch (error) {
            console.error("Failed to update announcement:", error);

            this.showError("Unable to update announcement.");
            throw new Error("Unable to update announcement");

        } finally {
            this.isSubmitting = false;
            this.submitButton.disabled = false;
            this.submitButton.textContent = "Save Changes";
        }

        try {
            await this.onUpdated();
        } catch (error) {
            console.error("Announcement updated but refresh failed:", error);
        }
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
