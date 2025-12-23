# Webhooks

Types:

- <code><a href="./src/resources/webhooks.ts">WebhookListFormResponsesResponse</a></code>
- <code><a href="./src/resources/webhooks.ts">WebhookSubscribeToFormEventsResponse</a></code>
- <code><a href="./src/resources/webhooks.ts">WebhookUnsubscribeFromFormEventsResponse</a></code>

Methods:

- <code title="get /webhooks/{formId}/poll">client.webhooks.<a href="./src/resources/webhooks.ts">listFormResponses</a>(formID) -> WebhookListFormResponsesResponse</code>
- <code title="post /webhooks">client.webhooks.<a href="./src/resources/webhooks.ts">subscribeToFormEvents</a>({ ...params }) -> WebhookSubscribeToFormEventsResponse</code>
- <code title="delete /webhooks">client.webhooks.<a href="./src/resources/webhooks.ts">unsubscribeFromFormEvents</a>({ ...params }) -> WebhookUnsubscribeFromFormEventsResponse</code>

# RawEvents

Types:

- <code><a href="./src/resources/raw-events.ts">RawEventTrackResponse</a></code>

Methods:

- <code title="post /v0/raw_events">client.rawEvents.<a href="./src/resources/raw-events.ts">track</a>({ ...params }) -> RawEventTrackResponse</code>
