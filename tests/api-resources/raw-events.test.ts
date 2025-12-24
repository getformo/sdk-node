// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import Formo from '@formo/sdk-server-side';

const client = new Formo({
  apiKey: 'My API Key',
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource rawEvents', () => {
  // Prism tests are disabled
  test.skip('identify: only required params', async () => {
    const responsePromise = client.rawEvents.identify({
      anonymous_id: 'c2bc0ebe-d852-49d1-9efd-e45744850ae0',
      channel: 'web',
      context: {},
      message_id: '48555101eee2f44ac0f0632fcb7c7c9f6ce0012ae395ae79f8a0d515e4f5e41f',
      original_timestamp: '2025-04-23T13:15:17.000Z',
      sent_at: '2025-04-23T13:15:18.000Z',
      type: 'page',
      version: '0',
    });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Prism tests are disabled
  test.skip('identify: required and optional params', async () => {
    const response = await client.rawEvents.identify({
      anonymous_id: 'c2bc0ebe-d852-49d1-9efd-e45744850ae0',
      channel: 'web',
      context: {
        browser: 'chrome',
        library_name: 'Formo Web SDK',
        library_version: '1.25.0',
        locale: 'en-GB',
        location: 'NG',
        page_title: 'WalletConnect Content Cabal',
        page_url: 'https://app.formo.so/lByfTbeUSL_mxy_TN2m3d',
        ref: '',
        referrer: '',
        screen_density: 2.75,
        screen_height: 873,
        screen_width: 393,
        timezone: 'Africa/Lagos',
        user_agent:
          'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36',
        utm_campaign: '',
        utm_content: '',
        utm_medium: '',
        utm_source: '',
        utm_term: '',
        viewport_height: 735,
        viewport_width: 392,
      },
      message_id: '48555101eee2f44ac0f0632fcb7c7c9f6ce0012ae395ae79f8a0d515e4f5e41f',
      original_timestamp: '2025-04-23T13:15:17.000Z',
      sent_at: '2025-04-23T13:15:18.000Z',
      type: 'page',
      version: '0',
      address: '0x9CC3cB28cd94eB4423B15cdA73346e204f59a407',
      event: '',
      properties: { url: 'bar', path: 'bar', hash: 'bar', query: 'bar' },
      user_id: 'a46e6878-1ed5-4a81-9185-83608df2fcb6',
    });
  });

  // Prism tests are disabled
  test.skip('track: only required params', async () => {
    const responsePromise = client.rawEvents.track({
      anonymous_id: 'c2bc0ebe-d852-49d1-9efd-e45744850ae0',
      channel: 'web',
      context: {},
      message_id: '48555101eee2f44ac0f0632fcb7c7c9f6ce0012ae395ae79f8a0d515e4f5e41f',
      original_timestamp: '2025-04-23T13:15:17.000Z',
      sent_at: '2025-04-23T13:15:18.000Z',
      type: 'page',
      version: '0',
    });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Prism tests are disabled
  test.skip('track: required and optional params', async () => {
    const response = await client.rawEvents.track({
      anonymous_id: 'c2bc0ebe-d852-49d1-9efd-e45744850ae0',
      channel: 'web',
      context: {
        browser: 'chrome',
        library_name: 'Formo Web SDK',
        library_version: '1.25.0',
        locale: 'en-GB',
        location: 'NG',
        page_title: 'WalletConnect Content Cabal',
        page_url: 'https://app.formo.so/lByfTbeUSL_mxy_TN2m3d',
        ref: '',
        referrer: '',
        screen_density: 2.75,
        screen_height: 873,
        screen_width: 393,
        timezone: 'Africa/Lagos',
        user_agent:
          'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36',
        utm_campaign: '',
        utm_content: '',
        utm_medium: '',
        utm_source: '',
        utm_term: '',
        viewport_height: 735,
        viewport_width: 392,
      },
      message_id: '48555101eee2f44ac0f0632fcb7c7c9f6ce0012ae395ae79f8a0d515e4f5e41f',
      original_timestamp: '2025-04-23T13:15:17.000Z',
      sent_at: '2025-04-23T13:15:18.000Z',
      type: 'page',
      version: '0',
      address: '0x9CC3cB28cd94eB4423B15cdA73346e204f59a407',
      event: '',
      properties: { url: 'bar', path: 'bar', hash: 'bar', query: 'bar' },
      user_id: 'a46e6878-1ed5-4a81-9185-83608df2fcb6',
    });
  });
});
