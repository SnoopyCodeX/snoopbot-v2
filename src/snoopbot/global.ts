import Queue from "@snoopbot/queue";

const playerQueue = new Queue(1, "PlayerQueue")
const eventsQueue = new Queue(1, "EventsQueue")
const imageSearchQueue = new Queue(1, "ImageSearchQueue")
const pinMessageQueue = new Queue(1, "PinMessageQueue")
const helpQueue = new Queue(1, "HelpQueue")

export default {
    playerQueue,
    eventsQueue,
    imageSearchQueue,
    pinMessageQueue,
    helpQueue
}