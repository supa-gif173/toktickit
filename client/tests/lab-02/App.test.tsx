import { vi, describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import App from "../../src/App.js";
import * as api from "../../src/api.js";

describe("App (Lab 02 -> Lab 03 updated)", () => {
  it("renders the loading state initially", () => {
    render(<App />);
    expect(screen.getByText(/Loading session.../i)).toBeInTheDocument();
  });

  it("shows the Login page after loading if not authenticated", async () => {
    vi.spyOn(api, "fetchMe").mockRejectedValue(new Error('Unauthenticated'));

    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText(/Sign in to your account/i)).toBeInTheDocument();
    });
  });
});
