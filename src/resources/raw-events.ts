// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import { APIPromise } from '../core/api-promise';
import { RequestOptions } from '../internal/request-options';

export class RawEvents extends APIResource {
  /**
   * Sends an event to the Formo Events API. Use the SDK Write Key from your project
   * settings as the Bearer token for authentication.
   *
   * @example
   * ```ts
   * const response = await client.rawEvents.identify({
   *   anonymous_id: 'c2bc0ebe-d852-49d1-9efd-e45744850ae0',
   *   channel: 'web',
   *   context: {
   *     user_agent:
   *       'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36',
   *     locale: 'en-GB',
   *     timezone: 'Africa/Lagos',
   *     location: 'NG',
   *     ref: '',
   *     referrer: '',
   *     utm_campaign: '',
   *     utm_content: '',
   *     utm_medium: '',
   *     utm_source: '',
   *     utm_term: '',
   *     page_title: 'WalletConnect Content Cabal',
   *     page_url: 'https://app.formo.so/lByfTbeUSL_mxy_TN2m3d',
   *     library_name: 'Formo Web SDK',
   *     library_version: '1.25.0',
   *     browser: 'chrome',
   *     screen_width: 393,
   *     screen_height: 873,
   *     screen_density: 2.75,
   *     viewport_width: 392,
   *     viewport_height: 735,
   *   },
   *   message_id: '48555101eee2f44ac0f0632fcb7c7c9f6ce0012ae395ae79f8a0d515e4f5e41f',
   *   original_timestamp: '2025-04-23T13:15:17.000Z',
   *   sent_at: '2025-04-23T13:15:18.000Z',
   *   type: 'page',
   *   version: '0',
   *   address: '0x9CC3cB28cd94eB4423B15cdA73346e204f59a407',
   *   properties: {
   *     url: 'https://app.formo.so/lByfTbeUSL_mxy_TN2m3d',
   *     path: '/lByfTbeUSL_mxy_TN2m3d',
   *     hash: '',
   *     query: '',
   *   },
   *   user_id: 'a46e6878-1ed5-4a81-9185-83608df2fcb6',
   * });
   * ```
   */
  identify(body: RawEventIdentifyParams, options?: RequestOptions): APIPromise<RawEventIdentifyResponse> {
    return this._client.post('/v0/raw_events', {
      body,
      defaultBaseURL: 'https://events.formo.so',
      ...options,
    });
  }

  /**
   * Sends an event to the Formo Events API. Use the SDK Write Key from your project
   * settings as the Bearer token for authentication.
   *
   * @example
   * ```ts
   * const response = await client.rawEvents.track({
   *   anonymous_id: 'c2bc0ebe-d852-49d1-9efd-e45744850ae0',
   *   channel: 'web',
   *   context: {
   *     user_agent:
   *       'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36',
   *     locale: 'en-GB',
   *     timezone: 'Africa/Lagos',
   *     location: 'NG',
   *     ref: '',
   *     referrer: '',
   *     utm_campaign: '',
   *     utm_content: '',
   *     utm_medium: '',
   *     utm_source: '',
   *     utm_term: '',
   *     page_title: 'WalletConnect Content Cabal',
   *     page_url: 'https://app.formo.so/lByfTbeUSL_mxy_TN2m3d',
   *     library_name: 'Formo Web SDK',
   *     library_version: '1.25.0',
   *     browser: 'chrome',
   *     screen_width: 393,
   *     screen_height: 873,
   *     screen_density: 2.75,
   *     viewport_width: 392,
   *     viewport_height: 735,
   *   },
   *   message_id: '48555101eee2f44ac0f0632fcb7c7c9f6ce0012ae395ae79f8a0d515e4f5e41f',
   *   original_timestamp: '2025-04-23T13:15:17.000Z',
   *   sent_at: '2025-04-23T13:15:18.000Z',
   *   type: 'page',
   *   version: '0',
   *   address: '0x9CC3cB28cd94eB4423B15cdA73346e204f59a407',
   *   properties: {
   *     url: 'https://app.formo.so/lByfTbeUSL_mxy_TN2m3d',
   *     path: '/lByfTbeUSL_mxy_TN2m3d',
   *     hash: '',
   *     query: '',
   *   },
   *   user_id: 'a46e6878-1ed5-4a81-9185-83608df2fcb6',
   * });
   * ```
   */
  track(body: RawEventTrackParams, options?: RequestOptions): APIPromise<RawEventTrackResponse> {
    return this._client.post('/v0/raw_events', {
      body,
      defaultBaseURL: 'https://events.formo.so',
      ...options,
    });
  }
}

export interface Event {
  /**
   * Pseudo-identifier for the user (device ID)
   */
  anonymous_id: string;

  /**
   * Channel/source of the event
   */
  channel: 'web' | 'mobile' | 'server';

  /**
   * Contextual information about the event
   */
  context: EventContext;

  /**
   * Unique identifier for the event
   */
  message_id: string;

  /**
   * Time when the event occurred on the client
   */
  original_timestamp: string;

  /**
   * Time when the event was sent from the client
   */
  sent_at: string;

  /**
   * Type of the event
   */
  type:
    | 'identify'
    | 'track'
    | 'page'
    | 'connect'
    | 'disconnect'
    | 'detect'
    | 'chain'
    | 'signature'
    | 'transaction';

  /**
   * Event spec version
   */
  version: string;

  /**
   * Wallet address
   */
  address?: string | null;

  /**
   * Name of the event (for track events)
   */
  event?: string;

  /**
   * Event-specific properties. Can contain any key-value pairs relevant to the
   * event.
   */
  properties?: EventProperties;

  /**
   * Unique user identifier
   */
  user_id?: string | null;
}

/**
 * Contextual information about the event
 */
export interface EventContext {
  /**
   * Name of the browser (e.g., chrome, firefox, safari)
   */
  browser?: string;

  /**
   * Name of the SDK used (e.g., Formo Web SDK)
   */
  library_name?: string;

  /**
   * Version of the SDK used
   */
  library_version?: string;

  /**
   * Language of the device (e.g., en-US, en-GB)
   */
  locale?: string;

  /**
   * Geographic location country code (e.g., US, NG)
   */
  location?: string;

  /**
   * Title of the current page
   */
  page_title?: string;

  /**
   * Full URL of the current page
   */
  page_url?: string;

  /**
   * Referral code or identifier
   */
  ref?: string;

  /**
   * The referrer URL where the user came from
   */
  referrer?: string;

  /**
   * Pixel density of the device screen (devicePixelRatio)
   */
  screen_density?: number;

  /**
   * Height of the device screen in pixels
   */
  screen_height?: number;

  /**
   * Width of the device screen in pixels
   */
  screen_width?: number;

  /**
   * Timezone of the user (e.g., America/New_York)
   */
  timezone?: string;

  /**
   * The user agent of the device
   */
  user_agent?: string;

  /**
   * UTM campaign parameter
   */
  utm_campaign?: string;

  /**
   * UTM content parameter
   */
  utm_content?: string;

  /**
   * UTM medium parameter
   */
  utm_medium?: string;

  /**
   * UTM source parameter
   */
  utm_source?: string;

  /**
   * UTM term parameter
   */
  utm_term?: string;

  /**
   * Height of the browser viewport in pixels
   */
  viewport_height?: number;

  /**
   * Width of the browser viewport in pixels
   */
  viewport_width?: number;
}

/**
 * Event-specific properties. Can contain any key-value pairs relevant to the
 * event.
 */
export type EventProperties = { [key: string]: unknown };

export interface RawEventIdentifyResponse {
  /**
   * Number of events that failed validation and were quarantined
   */
  quarantined_rows?: number;

  /**
   * Number of events successfully ingested
   */
  successful_rows?: number;
}

export interface RawEventTrackResponse {
  /**
   * Number of events that failed validation and were quarantined
   */
  quarantined_rows?: number;

  /**
   * Number of events successfully ingested
   */
  successful_rows?: number;
}

export interface RawEventIdentifyParams {
  /**
   * Pseudo-identifier for the user (device ID)
   */
  anonymous_id: string;

  /**
   * Channel/source of the event
   */
  channel: 'web' | 'mobile' | 'server';

  /**
   * Contextual information about the event
   */
  context: EventContext;

  /**
   * Unique identifier for the event
   */
  message_id: string;

  /**
   * Time when the event occurred on the client
   */
  original_timestamp: string;

  /**
   * Time when the event was sent from the client
   */
  sent_at: string;

  /**
   * Type of the event
   */
  type:
    | 'identify'
    | 'track'
    | 'page'
    | 'connect'
    | 'disconnect'
    | 'detect'
    | 'chain'
    | 'signature'
    | 'transaction';

  /**
   * Event spec version
   */
  version: string;

  /**
   * Wallet address
   */
  address?: string | null;

  /**
   * Name of the event (for track events)
   */
  event?: string;

  /**
   * Event-specific properties. Can contain any key-value pairs relevant to the
   * event.
   */
  properties?: EventProperties;

  /**
   * Unique user identifier
   */
  user_id?: string | null;
}

export interface RawEventTrackParams {
  /**
   * Pseudo-identifier for the user (device ID)
   */
  anonymous_id: string;

  /**
   * Channel/source of the event
   */
  channel: 'web' | 'mobile' | 'server';

  /**
   * Contextual information about the event
   */
  context: EventContext;

  /**
   * Unique identifier for the event
   */
  message_id: string;

  /**
   * Time when the event occurred on the client
   */
  original_timestamp: string;

  /**
   * Time when the event was sent from the client
   */
  sent_at: string;

  /**
   * Type of the event
   */
  type:
    | 'identify'
    | 'track'
    | 'page'
    | 'connect'
    | 'disconnect'
    | 'detect'
    | 'chain'
    | 'signature'
    | 'transaction';

  /**
   * Event spec version
   */
  version: string;

  /**
   * Wallet address
   */
  address?: string | null;

  /**
   * Name of the event (for track events)
   */
  event?: string;

  /**
   * Event-specific properties. Can contain any key-value pairs relevant to the
   * event.
   */
  properties?: EventProperties;

  /**
   * Unique user identifier
   */
  user_id?: string | null;
}

export declare namespace RawEvents {
  export {
    type Event as Event,
    type EventContext as EventContext,
    type EventProperties as EventProperties,
    type RawEventIdentifyResponse as RawEventIdentifyResponse,
    type RawEventTrackResponse as RawEventTrackResponse,
    type RawEventIdentifyParams as RawEventIdentifyParams,
    type RawEventTrackParams as RawEventTrackParams,
  };
}
