import * as api from "../../src/api.js";
import { vi, describe, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import App from "../../src/App.js";

describe("App", () => {
  // WORKED EXAMPLE — provided for you.
  it("renders the TokTickIT heading", () => {
    render(<App />);
    expect(screen.getByText(/TokTickIT/i)).toBeInTheDocument();
  });

  it("shows Online and the seeded categories on success", async () => {
    vi.spyOn(api, "checkSystem").mockResolvedValue({
      online: true,
      categories: [
        { id: 1, name: "Hardware" },
        { id: 2, name: "Software" },
      ],
    });

    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /Check System/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/Online/i)).toBeInTheDocument();
    });
    expect(screen.getByText("Hardware")).toBeInTheDocument();
    expect(screen.getByText("Software")).toBeInTheDocument();
  });

  it("shows an Offline error message when the API is unavailable", async () => {
    vi.spyOn(api, "checkSystem").mockRejectedValue(new Error("Backend is unavailable"));

    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /Check System/i }));

    await waitFor(() => {
      expect(screen.getByText(/Offline/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/Backend is unavailable/i)).toBeInTheDocument();
  });
});
