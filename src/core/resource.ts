// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import type { SDKServerSide } from '../client';

export abstract class APIResource {
  protected _client: SDKServerSide;

  constructor(client: SDKServerSide) {
    this._client = client;
  }
}
