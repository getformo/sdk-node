# sdk-node

## What this codebase does

`@formo/analytics-node` is a published npm package (MIT, npm provenance
enabled) providing **server-side analytics** for Node.js apps. Consumers
construct `FormoAnalytics(writeKey, options)` and call `track()` /
`identify()` / `flush()`. Events are validated, the optional Ethereum
`address` is EIP-55 checksummed, then batched by `EventQueue` and POSTed
to a hardcoded host `https://events.formo.so/v0/raw_events`. Pure
library: no server, no DB, no inbound request handling. Source of
interest is `src/`; `dist/` is compiled output.

## Auth shape

There is no app auth. The only credential is the consumer's project
**`writeKey`**, a constructor arg sent as `Authorization: Bearer
${writeKey}` in `EventQueue.sendBatch`. The security property to
protect is: the writeKey must never be logged, embedded in thrown
error messages, or serialized into event payloads/context. Errors
raised in `sendBatch` deliberately carry only `response.status` /
`statusText` — flag any change that widens this.

## Threat model

This is a dependency that runs inside customers' production servers, so
impact is ranked: (1) supply-chain / malicious-or-vulnerable code that
exfiltrates the writeKey or arbitrary process data on install or at
runtime; (2) credential leakage of the writeKey via logs/errors;
(3) a library that destabilizes its host (forced `process.exit`,
listener leaks, unbounded memory). Untrusted input = whatever the
consumer passes to `track()`/`identify()` (event name, properties,
context, address, ids).

## Project-specific patterns to flag

- **writeKey egress**: any new `console.*`, error string, or payload
  field that could include `writeKey`. Outbound URL must stay the fixed
  `EVENTS_API_HOST` — a configurable/derived host would be SSRF/exfil.
- **Custom EIP-55 checksum** in `toChecksumAddress` (`src/utils/address.ts`):
  hand-rolled keccak indexing and the EIP-1052 empty-hash branch.
  Correctness regressions here corrupt identity data; treat logic edits
  as security-relevant.
- **Hand-written validators** `isAddress`, `isUUID`, `validateTrackEvent`,
  `validateIdentifyEvent`: the only input gate. Flag loosened/removed
  checks or anchors dropped from the regexes.
- **`normalizeTrackProperties`** coerces `revenue`/`points`/`volume`
  via `Number(...)` with no NaN/finite guard — silent bad-data
  injection if logic changes.
- **`EventQueue.setupProcessHandlers`** registers global
  `beforeExit`/`SIGTERM`/`SIGINT` handlers and calls `process.exit(0)`
  per instance. Flag changes that add handlers without cleanup
  (listener leak) or broaden the forced-exit behavior.

## Known false-positives

- Hardcoded `EVENTS_API_HOST` constant — intentional fixed endpoint,
  not SSRF / not a "configurable URL" finding.
- `Authorization: Bearer ${writeKey}` — by design; the writeKey is the
  API credential, not a leaked hardcoded secret.
- `randomUUID()` for `anonymousId` / `message_id` — dedup/identity
  values, not security tokens; weak-randomness flags are FP.
- `src/test.ts` — manual dev smoke script with a dummy `"test-write-key"`,
  not production code or a real secret.
- Existing process-exit handlers themselves are intended graceful-flush
  behavior; only *changes* (above) are notable.
