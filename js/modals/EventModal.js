import { EventService } from "../services/EventService.js";
export class EventModal {
    onEventChanged;
    onUpdateRequested;
    service = new EventService();
    modal;
    closeButton;
    dismissButton;
    updateButton;
    deleteButton;
    titleElement;
    idElement;
    dateElement;
    typeElement;
    descriptionElement;
    selectedEvent = null;
    isDeleting = false;
    lastFocusedElement = null;
    constructor(onEventChanged, onUpdateRequested) {
        this.onEventChanged = onEventChanged;
        this.onUpdateRequested = onUpdateRequested;
        this.modal = this.getElement("#event-modal");
        this.closeButton = this.getElement("#close-event-modal");
        this.dismissButton =
            document.querySelector("#dismiss-event-modal");
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
    getElement(selector) {
        const element = document.querySelector(selector);
        if (!element) {
            throw new Error(`Missing element: ${selector}`);
        }
        return element;
    }
    initializeEvents() {
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
            if (!this.selectedEvent)
                return;
            const event = this.selectedEvent;
            this.close();
            this.onUpdateRequested(event);
        });
        this.deleteButton.addEventListener("click", () => {
            void this.deleteSelectedEvent();
        });
    }
    open(event) {
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
    close() {
        if (this.modal.hidden || this.isDeleting)
            return;
        this.modal.hidden = true;
        this.selectedEvent = null;
        this.lastFocusedElement?.focus();
    }
    async deleteSelectedEvent() {
        if (!this.selectedEvent || this.isDeleting)
            return;
        const event = this.selectedEvent;
        const eventId = String(event.eventId);
        const confirmed = window.confirm(`Are you sure you want to delete "${event.eventName}"?`);
        if (!confirmed)
            return;
        this.isDeleting = true;
        this.deleteButton.disabled = true;
        this.updateButton.disabled = true;
        try {
            await this.service.deleteEvent(eventId);
            this.isDeleting = false;
            this.close();
            await this.onEventChanged();
        }
        catch (error) {
            console.error("Failed to delete event:", error);
            window.alert(error instanceof Error
                ? error.message
                : "Unable to delete event.");
        }
        finally {
            this.isDeleting = false;
            this.deleteButton.disabled = false;
            this.updateButton.disabled = false;
        }
    }
    formatDate(value) {
        if (!value)
            return "Date unavailable";
        const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
        const date = new Date(dateOnly ? `${value}T00:00:00` : value);
        if (Number.isNaN(date.getTime())) {
            return "Date unavailable";
        }
        return date.toLocaleString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            ...(!dateOnly
                ? {
                    hour: "numeric",
                    minute: "2-digit"
                }
                : {})
        });
    }
}
