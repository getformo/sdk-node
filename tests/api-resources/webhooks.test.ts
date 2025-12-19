// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import SDKServerSide from 'sdk-server-side';

const client = new SDKServerSide({
  apiKey: 'My API Key',
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource webhooks', () => {
  // Prism tests are disabled
  test.skip('listFormResponses', async () => {
    const responsePromise = client.webhooks.listFormResponses('formId');
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Prism tests are disabled
  test.skip('subscribeToFormEvents: only required params', async () => {
    const responsePromise = client.webhooks.subscribeToFormEvents({
      eventTypes: ['FORM_SUBMISSION'],
      formId: 'formId',
      targetUrl: 'targetUrl',
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
  test.skip('subscribeToFormEvents: required and optional params', async () => {
    const response = await client.webhooks.subscribeToFormEvents({
      eventTypes: ['FORM_SUBMISSION'],
      formId: 'formId',
      targetUrl: 'targetUrl',
    });
  });

  // Prism tests are disabled
  test.skip('unsubscribeFromFormEvents', async () => {
    const responsePromise = client.webhooks.unsubscribeFromFormEvents();
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Prism tests are disabled
  test.skip('unsubscribeFromFormEvents: request options and params are passed correctly', async () => {
    // ensure the request options are being passed correctly by passing an invalid HTTP method in order to cause an error
    await expect(
      client.webhooks.unsubscribeFromFormEvents(
        { targetUrl: 'targetUrl', webhookId: 'webhookId' },
        { path: '/_stainless_unknown_path' },
      ),
    ).rejects.toThrow(SDKServerSide.NotFoundError);
  });
});
