# Feedback Widget

The docs footer can either:

- open a prefilled issue in `interledger/open-payments-docs-feedback`
- post directly to GitHub through `docs/netlify/functions/feedback.ts`

`openpayments.dev` is a GitHub Pages deploy, so production uses the issue-form fallback
unless you point `PUBLIC_FEEDBACK_FUNCTION_URL` at another hosted endpoint.

## Local dev

1. Copy `docs/.env.example` to `docs/.env`.
2. Run `pnpm dev:netlify` from `docs/`, or `pnpm --filter docs dev:netlify` from the repo root.
3. Open the Netlify URL shown as `Local dev server ready`.

Plain `pnpm start` only exercises the fallback path.
