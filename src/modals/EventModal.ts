
import type { Event } from "../models/Event.js";
import { EventService } from "../services/EventService.js";

export class EventModal {

    private readonly service = new EventService();

    private readonly modal: HTMLElement;
    private readonly closeButton: HTMLButtonElement;
    private readonly dismissButton: HTMLButtonElement | null;
    private readonly updateButton: HTMLButtonElement;
    private readonly deleteButton: HTMLButtonElement;

    private readonly titleElement: HTMLElement;
    private readonly idElement: HTMLElement;
    private readonly dateElement: HTMLElement;
    private readonly typeElement: HTMLElement;
    private readonly descriptionElement: HTMLElement;

    private selectedEvent: Event | null = null;
    private isDeleting = false;
    private lastFocusedElement: HTMLElement | null = null;

    constructor(
        private readonly onEventChanged: () => void | Promise<void>,
        private readonly onUpdateRequested: (event: Event) => void
    ) {
        this.modal = this.getElement("#event-modal");
        this.closeButton = this.getElement("#close-event-modal");

        this.dismissButton =
            document.querySelector<HTMLButtonElement>(
                "#dismiss-event-modal"
            );

        this.updateButton = this.getElement("#update-event-btn");
        this.deleteButton = this.getElement("#delete-event-btn");

        this.titleElement = this.getElement("#event-modal-title");
        this.idElement = this.getElement("#event-modal-id");
        this.dateElement = this.getElement("#event-modal-date");
        this.typeElement = this.getElement("#event-modal-type");
        this.descriptionElement =
            this.getElement("#event-modal-description");

        this.initializeEvents();
    }

    private getElement<T extends HTMLElement>(
        selector: string
    ): T {
        const element = document.querySelector<T>(selector);

        if (!element) {
            throw new Error(`Missing element: ${selector}`);
        }

        return element;
    }

    private initializeEvents(): void {

        this.closeButton.addEventListener("click", () => {
            this.close();
        });

        this.dismissButton?.addEventListener("click", () => {
            this.close();
        });

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

        this.updateButton.addEventListener("click", () => {
            if (!this.selectedEvent) return;

            const event = this.selectedEvent;

            this.close();
            this.onUpdateRequested(event);
        });

        this.deleteButton.addEventListener("click", () => {
            void this.deleteSelectedEvent();
        });
    }

    public open(event: Event): void {

        this.selectedEvent = event;

        this.lastFocusedElement =
            document.activeElement instanceof HTMLElement
                ? document.activeElement
                : null;

        this.titleElement.textContent =
            event.eventName ?? "Untitled event";

        this.idElement.textContent = String(event.eventId);

        this.dateElement.textContent =
            this.formatDate(event.eventDate);

        this.typeElement.textContent =
            event.eventType || "General event";

        this.descriptionElement.textContent =
            event.description || "No description available.";

        this.modal.hidden = false;
        this.closeButton.focus();
    }

    public close(): void {
        if (this.modal.hidden || this.isDeleting) return;

        this.modal.hidden = true;
        this.selectedEvent = null;

        this.lastFocusedElement?.focus();
    }

    private async deleteSelectedEvent(): Promise<void> {

        if (!this.selectedEvent || this.isDeleting) return;

        const event = this.selectedEvent;
        const eventId = String(event.eventId);

        const confirmed = window.confirm(
            `Are you sure you want to delete "${event.eventName}"?`
        );

        if (!confirmed) return;

        this.isDeleting = true;
        this.deleteButton.disabled = true;
        this.updateButton.disabled = true;

        try {
            await this.service.deleteEvent(eventId);

            this.isDeleting = false;
            this.close();

            await this.onEventChanged();

        } catch (error) {
            console.error("Failed to delete event:", error);

            window.alert(
                error instanceof Error
                    ? error.message
                    : "Unable to delete event."
            );

        } finally {
            this.isDeleting = false;
            this.deleteButton.disabled = false;
            this.updateButton.disabled = false;
        }
    }

    private formatDate(value?: string | null): string {
        if (!value) return "Date unavailable";

        const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);

        const date = new Date(
            dateOnly ? `${value}T00:00:00` : value
        );

        if (Number.isNaN(date.getTime())) {
            return "Date unavailable";
        }

        return date.toLocaleString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            ...(!dateOnly
                ? {
                    hour: "numeric" as const,
                    minute: "2-digit" as const
                }
                : {})
        });
    }
}
