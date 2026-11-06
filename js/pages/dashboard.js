import { AnnouncementService } from "../services/AnnouncementService.js";
import { EventService } from "../services/EventService.js";
class DashboardPage {
    announcementService = new AnnouncementService();
    announcementsContainer = document.querySelector("#announcements-list");
    eventService = new EventService();
    upcomingEventsContainer = document.querySelector("#upcoming-events-list");
    constructor() {
        this.initializeDate();
        this.initializeEventsDropdown();
        this.initializeEventsNavigation();
        this.initializeAiButton();
        this.initializeAnnouncements();
        this.initializeUpcomingEvents();
    }
    // -------------------------------
    // Dashboard Date
    // -------------------------------
    initializeDate() {
        const today = document.querySelector("#today");
        if (today) {
            today.textContent =
                new Date().toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric"
                });
        }
    }
    // -------------------------------
    // Events Dropdown
    // -------------------------------
    initializeEventsDropdown() {
        const toggle = document.querySelector("#events-toggle");
        const menu = document.querySelector("#events-menu");
        if (!toggle || !menu)
            return;
        toggle.addEventListener("click", () => {
            const isHidden = menu.hidden;
            menu.hidden = !isHidden;
            toggle.setAttribute("aria-expanded", String(isHidden));
        });
        document.addEventListener("click", event => {
            const target = event.target;
            if (!toggle.contains(target) &&
                !menu.contains(target)) {
                menu.hidden = true;
                toggle.setAttribute("aria-expanded", "false");
            }
        });
        document.addEventListener("keydown", event => {
            if (event.key === "Escape") {
                menu.hidden = true;
                toggle.setAttribute("aria-expanded", "false");
            }
        });
    }
    // -------------------------------
    // Events Navigation
    // -------------------------------
    initializeEventsNavigation() {
        document
            .querySelector("#view-events")
            ?.addEventListener("click", () => {
            window.location.href = "./events.html";
        });
    }
    // -------------------------------
    // AI Button
    // -------------------------------
    initializeAiButton() {
        document
            .querySelector("#ask-ai")
            ?.addEventListener("click", () => {
            // Placeholder until the AI interface
            // is connected to the backend.
            console.log("AI assistant clicked");
        });
    }
    // -------------------------------
    // Announcements
    // -------------------------------
    initializeAnnouncements() {
        document
            .querySelector("#refresh-announcements")
            ?.addEventListener("click", () => {
            void this.loadAnnouncements();
        });
        void this.loadAnnouncements();
    }
    async loadAnnouncements() {
        const container = this.announcementsContainer;
        if (!container)
            return;
        this.showAnnouncementStatus("Loading announcements...");
        try {
            const announcements = await this.announcementService
                .getAllAnnouncements();
            if (!Array.isArray(announcements)) {
                throw new Error("Invalid announcements response");
            }
            container.replaceChildren();
            if (announcements.length === 0) {
                this.showAnnouncementStatus("No announcements available.");
                return;
            }
            // Display only the 5 newest announcements.
            const latestAnnouncements = [...announcements]
                .sort((a, b) => (Date.parse(b.sentDatetime ?? "") || 0) -
                (Date.parse(a.sentDatetime ?? "") || 0))
                .slice(0, 3);
            latestAnnouncements.forEach(announcement => {
                container.append(this.createAnnouncement(announcement));
            });
        }
        catch (error) {
            console.error("Failed to load announcements:", error);
            this.showAnnouncementStatus("Unable to load announcements.");
        }
    }
    createAnnouncement(announcement) {
        const card = document.createElement("article");
        card.className = "announcement-item";
        const header = document.createElement("div");
        header.className = "announcement-meta";
        const label = document.createElement("strong");
        label.textContent = "Community announcement";
        const date = document.createElement("time");
        if (announcement.sentDatetime) {
            const parsedDate = new Date(announcement.sentDatetime);
            if (!Number.isNaN(parsedDate.getTime())) {
                date.dateTime = announcement.sentDatetime;
                date.textContent =
                    parsedDate.toLocaleString();
            }
        }
        const content = document.createElement("p");
        content.textContent = announcement.content;
        header.append(label, date);
        card.append(header, content);
        return card;
    }
    showAnnouncementStatus(message) {
        const container = this.announcementsContainer;
        if (!container)
            return;
        const status = document.createElement("p");
        status.className = "announcement-status";
        status.textContent = message;
        container.replaceChildren(status);
    }
    initializeUpcomingEvents() {
        void this.loadUpcomingEvents();
    }
    async loadUpcomingEvents() {
        const container = this.upcomingEventsContainer;
        if (!container)
            return;
        this.showEventsStatus("Loading upcoming events...");
        try {
            const events = await this.eventService.getAllEvents();
            // Get current local date and time
            const now = new Date();
            // Keep future events, sorted nearest first
            const upcomingEvents = events
                .filter(event => {
                const eventDate = new Date(event.eventDate);
                return !Number.isNaN(eventDate.getTime())
                    && eventDate >= now;
            })
                .sort((a, b) => new Date(a.eventDate).getTime() -
                new Date(b.eventDate).getTime())
                .slice(0, 3);
            container.replaceChildren();
            if (upcomingEvents.length === 0) {
                this.showEventsStatus("No upcoming events.");
                return;
            }
            upcomingEvents.forEach((event, index) => {
                container.append(this.createEventElement(event, index));
            });
        }
        catch (error) {
            console.error("Failed to load upcoming events:", error);
            this.showEventsStatus("Unable to load upcoming events.");
        }
    }
    createEventElement(event, index) {
        const eventDate = new Date(event.eventDate);
        const eventElement = document.createElement("div");
        eventElement.className = "event";
        const dateElement = document.createElement("div");
        dateElement.className = "event-date";
        // Alternate date accent colors
        if (index % 3 === 1) {
            dateElement.classList.add("purple-date");
        }
        else if (index % 3 === 2) {
            dateElement.classList.add("blue-date");
        }
        const day = document.createElement("strong");
        day.textContent = String(eventDate.getDate())
            .padStart(2, "0");
        const month = document.createElement("span");
        month.textContent = eventDate
            .toLocaleDateString("en-US", {
            month: "short"
        })
            .toUpperCase();
        dateElement.append(day, month);
        const details = document.createElement("div");
        const title = document.createElement("strong");
        title.textContent = event.eventName;
        const description = document.createElement("p");
        const formattedTime = eventDate.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit"
        });
        description.textContent = event.description
            ? `${event.description} · ${formattedTime}`
            : formattedTime;
        details.append(title, description);
        eventElement.append(dateElement, details);
        return eventElement;
    }
    showEventsStatus(message) {
        const container = this.upcomingEventsContainer;
        if (!container)
            return;
        const status = document.createElement("p");
        status.className = "event-disclaimer";
        status.textContent = message;
        container.replaceChildren(status);
    }
}
document.addEventListener("DOMContentLoaded", () => {
    new DashboardPage();
});
