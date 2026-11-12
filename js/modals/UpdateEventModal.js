import { EventService } from "../services/EventService.js";
export class UpdateEventModal {
    onEventChanged;
    service = new EventService();
    modal;
    form;
    closeButton;
    cancelButton;
    submitButton;
    nameInput;
    dateInput;
    typeInput;
    descriptionInput;
    errorElement;
    selectedEvent = null;
    isSaving = false;
    lastFocusedElement = null;
    constructor(onEventChanged) {
        this.onEventChanged = onEventChanged;
        this.modal = this.getElement("#update-event-modal");
        this.form = this.getElement("#update-event-form");
        this.closeButton =
            this.getElement("#close-update-event-modal");
        this.cancelButton =
            this.getElement("#cancel-update-event");
        this.submitButton =
            this.getElement("#save-update-event");
        this.nameInput =
            this.getElement("#update-event-name");
        this.dateInput =
            this.getElement("#update-event-date");
        this.typeInput =
            this.getElement("#update-event-type");
        this.descriptionInput =
            this.getElement("#update-event-description");
        this.errorElement =
            this.getElement("#update-event-error");
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
        this.cancelButton.addEventListener("click", () => {
            this.close();
        });
        this.modal.addEventListener("click", event => {
            if (event.target === this.modal) {
                this.close();
            }
        });
        document.addEventListener("keydown", event => {
            if (event.key === "Escape" &&
                !this.modal.hidden &&
                !this.isSaving) {
                this.close();
            }
        });
        this.form.addEventListener("submit", event => {
            event.preventDefault();
            void this.saveChanges();
        });
    }
    open(event) {
        console.log("Opening update modal:", event);
        console.log("Selected event ID:", event.eventId);
        this.lastFocusedElement =
            document.activeElement instanceof HTMLElement
                ? document.activeElement
                : null;
        if (event.eventId === null ||
            event.eventId === undefined ||
            String(event.eventId).trim() === "") {
            console.error("Event ID is missing:", event);
            window.alert("Unable to update event because its ID is missing.");
            return;
        }
        this.selectedEvent = { ...event };
        this.nameInput.value =
            event.eventName ?? "";
        this.dateInput.value =
            this.toDateInputValue(event.eventDate);
        this.typeInput.value =
            event.eventType ?? "";
        this.descriptionInput.value =
            event.description ?? "";
        this.errorElement.textContent = "";
        this.errorElement.hidden = true;
        this.modal.hidden = false;
        this.nameInput.focus();
    }
    close() {
        if (this.modal.hidden || this.isSaving) {
            return;
        }
        this.modal.hidden = true;
        this.selectedEvent = null;
        this.form.reset();
        this.errorElement.textContent = "";
        this.errorElement.hidden = true;
        this.lastFocusedElement?.focus();
    }
    async saveChanges() {
        if (!this.selectedEvent || this.isSaving) {
            return;
        }
        const eventId = this.selectedEvent.eventId;
        const name = this.nameInput.value.trim();
        const date = this.dateInput.value;
        const type = this.typeInput.value.trim();
        const description = this.descriptionInput.value.trim();
        if (eventId === null ||
            eventId === undefined ||
            String(eventId).trim() === "") {
            this.showError("Event ID is missing.");
            console.error("Cannot update event without ID:", this.selectedEvent);
            return;
        }
        if (!name) {
            this.showError("Event name is required.");
            this.nameInput.focus();
            return;
        }
        if (!date) {
            this.showError("Event date is required.");
            this.dateInput.focus();
            return;
        }
        const request = {
            ...this.selectedEvent,
            // Explicitly preserve the event ID.
            eventId: eventId,
            eventName: name,
            eventDate: date,
            eventType: type,
            description: description
        };
        console.log("Original event:", this.selectedEvent);
        console.log("Event ID:", request.eventId);
        console.log("Update request:", request);
        console.log("JSON request body:", JSON.stringify(request, null, 2));
        this.isSaving = true;
        this.submitButton.disabled = true;
        this.submitButton.textContent = "Saving...";
        this.closeButton.disabled = true;
        this.cancelButton.disabled = true;
        this.errorElement.hidden = true;
        this.errorElement.textContent = "";
        let saved = false;
        try {
            await this.service.updateEvent(request);
            saved = true;
        }
        catch (error) {
            console.error("Failed to update event:", error);
            this.showError(error instanceof Error
                ? error.message
                : "Unable to update event.");
        }
        finally {
            this.isSaving = false;
            this.submitButton.disabled = false;
            this.submitButton.textContent = "Save Changes";
            this.closeButton.disabled = false;
            this.cancelButton.disabled = false;
        }
        if (saved) {
            this.close();
            try {
                await this.onEventChanged();
            }
            catch (error) {
                console.error("Event saved, but refreshing the list failed:", error);
            }
        }
    }
    showError(message) {
        this.errorElement.textContent = message;
        this.errorElement.hidden = false;
    }
    toDateInputValue(value) {
        if (!value) {
            return "";
        }
        // Handle ISO dates and date-only values.
        const dateOnlyMatch = /^(\d{4}-\d{2}-\d{2})$/.exec(value);
        if (dateOnlyMatch) {
            return dateOnlyMatch[1];
        }
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return "";
        }
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }
}
