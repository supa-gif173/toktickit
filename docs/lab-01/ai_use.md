# AI Use and Reflection

I used the Antigravity coding agent and primarily utilized Gemini as the LLM.

**Selected Key Prompts:**

| Prompt Name | Actual Prompt Text |
| :--- | :--- |
| Troubleshoot Connection | "My React (Vite) frontend cannot connect to my Express backend. The UI shows 'Unable to connect to TokTickIT API'. How do I fix this?" |
| Antigravity Fix | "Act as an expert full-stack developer. Please analyze and fix this connection issue between Vite proxy and Express localhost binding." |
| Draft GitHub Issues | "Write GitHub issue descriptions and acceptance criteria for Lab 1 in English based on the provided project requirements." |
| Peer Review Formatting | "Format the raw peer review feedback into the reviewer.md markdown template provided by the instructor." |
| Test Table Formatting | "Format the test summary table exactly matching the grading rubric requirements, ensuring the rendered version is easy to grade." |

**My Reflection:**
The AI was instrumental in diagnosing network layer issues, generating targeted prompts for the Antigravity agent, and formatting documentation quickly. However, I learned that I must strictly review AI-generated content against my specific project structure, rather than applying its suggestions blindly.

* **Key Challenge & Problem Solving (Network Binding & Contextual Verification):**
  - **The Issue:** Initially, the frontend failed to connect to the backend despite both servers running without errors. Later, when generating the test documentation, the AI suggested file paths based on a generic structure (`client/src/`) rather than my actual project structure.
  - **The Strategy:** Instead of rebuilding the project, I used Occam's Razor to isolate the root causes. For the connection error, I focused purely on the `localhost` resolution discrepancy between Vite and Node.js. For the documentation, I manually cross-referenced the AI's output with my IDE's directory tree.
  - **Overcoming Connection Restrictions:** I crafted a specific prompt instructing the Antigravity agent to target the `vite.config.ts` proxy settings and align them precisely with the Express host binding on port 3000.
  - **Repeatable Workflow:** Moving forward, I established a strict verification workflow: I now explicitly verify the AI's assumed directory structure against my actual repository (e.g., ensuring test files point to `client/tests/`) before committing any generated documentation or markdown tables.