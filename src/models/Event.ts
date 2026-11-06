export interface Event {
    eventName: string;
    eventType: string;
    description: string;
    eventDate: string;
    attendees: number[];
    confirmedAttendees: number[];
    tentativeAttendees:number[];
    declinedAttendees: number[];
}