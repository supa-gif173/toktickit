import { useState } from "react";
import { checkSystem, Category } from "./api.js";

// UI states you must handle for Issue 4: idle, loading, success, error.
type UiState = "idle" | "loading" | "success" | "error";

export default function App() {
  const [state, setState] = useState<UiState>("idle");
  const [categories, setCategories] = useState<Category[]>([]);
  void categories;

  const [errorMsg, setErrorMsg] = useState<string>("");

  async function handleCheck() {
    setState("loading");
    setErrorMsg("");
    try {
      const status = await checkSystem();
      if (status.online) {
        setCategories(status.categories);
        setState("success");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred");
      setState("error");
    }
  }

  return (
    <div className="container py-5" style={{ maxWidth: 640 }}>
      <h1 className="h3 mb-4">
        TokTickIT <span className="text-success">IT Service Desk</span>
      </h1>

      <button className="btn btn-success" onClick={handleCheck} disabled={state === "loading"}>
        {state === "loading" ? "Loading…" : "Check System"}
      </button>

      <div className="mt-4">
        {state === "success" && (
          <div className="alert alert-success">
            <strong>Online</strong>: Backend is connected.
            <h5 className="mt-3">Categories</h5>
            <ol>
              {categories.map((category) => (
                <li key={category.id}>{category.name}</li>
              ))}
            </ol>
          </div>
        )}
        {state === "error" && (
          <div className="alert alert-danger">
            <strong>Offline</strong>: {errorMsg}
          </div>
        )}
      </div>
    </div>
  );
}
