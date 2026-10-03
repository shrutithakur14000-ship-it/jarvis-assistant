import "@testing-library/jest-dom/vitest";
import { cleanup, configure } from "@testing-library/react";
import { afterEach } from "vitest";

// Generated components mark elements with `data-ocid`, not `data-testid`.
configure({ testIdAttribute: "data-ocid" });

// jsdom does not implement scrollIntoView; the chat transcript calls it on
// every message change. Stub it so rendering does not throw.
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}

// React Testing Library does not auto-clean when Vitest globals are disabled.
afterEach(() => {
  cleanup();
  window.localStorage.clear();
});
