// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import type { Formo } from '../client';

export abstract class APIResource {
  protected _client: Formo;

  constructor(client: Formo) {
    this._client = client;
  }
}
