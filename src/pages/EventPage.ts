
import { EventService } from "../services/EventService.js";
import { EventModal } from "../modals/EventModal.js";
import { UpdateEventModal } from "../modals/UpdateEventModal.js";

import type { Event } from "../models/Event.js";

export class EventPage {

    private readonly service = new EventService();

    private readonly container =
        document.querySelector<HTMLElement>("#content-list");

    private readonly count =
        document.querySelector<HTMLElement>("#result-count");

    private readonly refreshButton =
        document.querySelector<HTMLButtonElement>("#refresh");

    private readonly pagination =
        document.querySelector<HTMLElement>("#events-pagination");

    private readonly previousButton =
        document.querySelector<HTMLButtonElement>("#prev-events");

    private readonly nextButton =
        document.querySelector<HTMLButtonElement>("#next-events");

    private readonly pageInfo =
        document.querySelector<HTMLElement>("#events-page-info");

    private readonly pageSize = 4;

    private currentPage = 1;
    private upcomingEvents: Event[] = [];

    private readonly eventModal: EventModal;
    private readonly updateEventModal: UpdateEventModal;

    constructor() {

        this.updateEventModal = new UpdateEventModal(
            () => this.loadEvents()
        );

        this.eventModal = new EventModal(
            () => this.loadEvents(),
            event => this.updateEventModal.open(event)
        );

        this.initializeEvents();
        void this.loadEvents();
    }

    private initializeEvents(): void {

        this.refreshButton?.addEventListener("click", () => {
            void this.loadEvents();
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
            Math.ceil(this.upcomingEvents.length / this.pageSize)
        );
    }

    private validDate(value?: string | null): Date | null {

        if (!value) return null;

        const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);

        const date = new Date(
            dateOnly ? `${value}T00:00:00` : value
        );

        return Number.isNaN(date.getTime()) ? null : date;
    }

    private getEventDate(event: Event): Date | null {
        return this.validDate(event.eventDate);
    }

    private getEventDateValue(event: Event): number {
        return this.getEventDate(event)?.getTime() ?? 0;
    }

    private async loadEvents(): Promise<void> {

        if (!this.container) return;

        if (this.refreshButton) {
            this.refreshButton.disabled = true;
        }

        if (this.count) {
            this.count.textContent = "Loading…";
        }

        if (this.pagination) {
            this.pagination.hidden = true;
        }

        this.showStatus("Loading events…");

        try {
            const events = await this.service.getAllEvents();

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            this.upcomingEvents = events
                .filter(event => {
                    const date = this.getEventDate(event);
                    return date !== null && date >= today;
                })
                .sort(
                    (a, b) =>
                        this.getEventDateValue(a) -
                        this.getEventDateValue(b)
                );

            this.currentPage = 1;
            this.renderPage();

        } catch (error) {

            console.error("Failed to load events:", error);

            this.upcomingEvents = [];

            if (this.count) {
                this.count.textContent = "Could not load events";
            }

            if (this.pagination) {
                this.pagination.hidden = true;
            }

            this.showStatus(
                error instanceof Error
                    ? error.message
                    : "Unable to load events."
            );

        } finally {
            if (this.refreshButton) {
                this.refreshButton.disabled = false;
            }
        }
    }

    private renderPage(): void {

        if (!this.container) return;

        const total = this.upcomingEvents.length;

        this.currentPage = Math.min(
            Math.max(this.currentPage, 1),
            this.totalPages
        );

        const start =
            (this.currentPage - 1) * this.pageSize;

        const visibleEvents = this.upcomingEvents.slice(
            start,
            start + this.pageSize
        );

        this.container.replaceChildren();

        if (this.count) {
            this.count.textContent =
                `${total} upcoming event${total === 1 ? "" : "s"}`;
        }

        if (this.pagination) {
            this.pagination.hidden = total === 0;
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
            this.showStatus("No upcoming events available.");
            return;
        }

        visibleEvents.forEach(event => {
            this.container?.append(
                this.createEvent(event)
            );
        });
    }

    private createEvent(event: Event): HTMLElement {

        const date = this.getEventDate(event);

        const card = document.createElement("article");
        card.className = "item event-row clickable-event";

        const tile = document.createElement("div");
        tile.className = "date-tile";

        const day = document.createElement("strong");
        day.textContent = date
            ? String(date.getDate()).padStart(2, "0")
            : "--";

        const month = document.createElement("span");
        month.textContent = date
            ? date.toLocaleDateString("en-US", {
                month: "short"
              }).toUpperCase()
            : "---";

        tile.append(day, month);

        const details = document.createElement("div");
        details.className = "event-detail";

        const title = document.createElement("h2");
        title.textContent =
            event.eventName ?? "Untitled event";

        const meta = document.createElement("div");
        meta.className = "meta";

        const dateText = document.createElement("span");

        const rawDate = event.eventDate;

        const isDateOnly =
            typeof rawDate === "string" &&
            /^\d{4}-\d{2}-\d{2}$/.test(rawDate);

        dateText.textContent = date
            ? date.toLocaleString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                ...(!isDateOnly
                    ? {
                        hour: "numeric" as const,
                        minute: "2-digit" as const
                      }
                    : {})
              })
            : "Date unavailable";

        meta.append(dateText);

        if (event.eventType) {
            const type = document.createElement("span");
            type.className = "tag";
            type.textContent = event.eventType;
            meta.append(type);
        }

        details.append(title, meta);

        if (event.description) {
            const description = document.createElement("p");
            description.textContent = event.description;
            details.append(description);
        }

        card.append(tile, details);

        card.tabIndex = 0;
        card.setAttribute("role", "button");

        card.setAttribute(
            "aria-label",
            `View details for ${event.eventName}`
        );

        card.addEventListener("click", () => {
            this.eventModal.open(event);
        });

        card.addEventListener("keydown", keyboardEvent => {
            if (
                keyboardEvent.key === "Enter" ||
                keyboardEvent.key === " "
            ) {
                keyboardEvent.preventDefault();
                this.eventModal.open(event);
            }
        });

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
    new EventPage();
});
