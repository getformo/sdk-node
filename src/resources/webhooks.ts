// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import { APIPromise } from '../core/api-promise';
import { RequestOptions } from '../internal/request-options';
import { path } from '../internal/utils/path';

export class Webhooks extends APIResource {
  /**
   * Retrieves recent form responses with transformed field data
   */
  listFormResponses(formID: string, options?: RequestOptions): APIPromise<WebhookListFormResponsesResponse> {
    return this._client.get(path`/webhooks/${formID}/poll`, {
      defaultBaseURL: 'https://api.formo.so/api',
      ...options,
    });
  }

  /**
   * Creates a new webhook subscription for form events
   */
  subscribeToFormEvents(
    body: WebhookSubscribeToFormEventsParams,
    options?: RequestOptions,
  ): APIPromise<WebhookSubscribeToFormEventsResponse> {
    return this._client.post('/webhooks', { body, defaultBaseURL: 'https://api.formo.so/api', ...options });
  }

  /**
   * Removes a webhook subscription
   */
  unsubscribeFromFormEvents(
    params: WebhookUnsubscribeFromFormEventsParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<WebhookUnsubscribeFromFormEventsResponse> {
    const { targetUrl, webhookId } = params ?? {};
    return this._client.delete('/webhooks', {
      query: { targetUrl, webhookId },
      defaultBaseURL: 'https://api.formo.so/api',
      ...options,
    });
  }
}

export interface WebhookListFormResponsesResponse {
  data?: WebhookListFormResponsesResponse.Data;

  isSuccess?: boolean;
}

export namespace WebhookListFormResponsesResponse {
  export interface Data {
    items?: Array<Data.Item>;
  }

  export namespace Data {
    export interface Item {
      /**
       * Unique identifier of the form
       */
      formId?: string;

      /**
       * Title of the form
       */
      formTitle?: string;

      /**
       * Unique identifier of the submission
       */
      submissionId?: string;

      /**
       * Timestamp of form submission
       */
      submittedAt?: string;

      [k: string]: unknown;
    }
  }
}

export interface WebhookSubscribeToFormEventsResponse {
  data?: WebhookSubscribeToFormEventsResponse.Data;

  isSuccess?: boolean;
}

export namespace WebhookSubscribeToFormEventsResponse {
  export interface Data {
    /**
     * Unique identifier of the webhook subscription
     */
    webhookId?: string;
  }
}

export interface WebhookUnsubscribeFromFormEventsResponse {
  data?: WebhookUnsubscribeFromFormEventsResponse.Data;

  isSuccess?: boolean;
}

export namespace WebhookUnsubscribeFromFormEventsResponse {
  export interface Data {
    message?: string;
  }
}

export interface WebhookSubscribeToFormEventsParams {
  /**
   * Types of events to subscribe to
   */
  eventTypes: Array<'FORM_SUBMISSION' | 'FORM_UPDATED'>;

  /**
   * The unique identifier of the form
   */
  formId: string;

  /**
   * The URL that will receive webhook events
   */
  targetUrl: string;
}

export interface WebhookUnsubscribeFromFormEventsParams {
  /**
   * The URL that receives webhook events
   */
  targetUrl?: string;

  /**
   * The unique identifier of the webhook subscription
   */
  webhookId?: string;
}

export declare namespace Webhooks {
  export {
    type WebhookListFormResponsesResponse as WebhookListFormResponsesResponse,
    type WebhookSubscribeToFormEventsResponse as WebhookSubscribeToFormEventsResponse,
    type WebhookUnsubscribeFromFormEventsResponse as WebhookUnsubscribeFromFormEventsResponse,
    type WebhookSubscribeToFormEventsParams as WebhookSubscribeToFormEventsParams,
    type WebhookUnsubscribeFromFormEventsParams as WebhookUnsubscribeFromFormEventsParams,
  };
}
