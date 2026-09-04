import { vi, describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import App from "../../src/App.js";
import * as api from "../../src/api.js";

describe("App", () => {
  it("renders the loading state initially", () => {
    render(<App />);
    expect(screen.getByText(/Loading mock requesters.../i)).toBeInTheDocument();
  });

  it("shows the Development Access title after loading", async () => {
    vi.spyOn(api, "fetchRequesters").mockResolvedValue([
      { id: "1", name: "Alice", email: "alice@test.com", department: "IT" }
    ]);

    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText(/Development Access/i)).toBeInTheDocument();
    });
    
    expect(screen.getByText(/Alice/i)).toBeInTheDocument();
  });
});
