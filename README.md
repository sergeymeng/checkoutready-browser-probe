# CheckoutReady cross-site fixture

Static secondary HTTPS origin for CheckoutReady browser diagnostics. Tests first-party baseline storage, third-party iframe storage, redirected navigation and user-clicked popups. Only the fixed CheckoutReady primary origin receives postMessage results. No analytics, account access, or data upload endpoint. Session configuration is carried in URL fragments. Cookies expire after ten minutes; the cleanup route removes the session's test storage.

This repository contains only the public test fixture, not macOS application source or user diagnostic results.
