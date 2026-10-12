const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function analyzeOffer(
  payload: string | File,
  lang: string = "en",
  mode: "text" | "pdf" | "screenshot" | "link" = "text",
  signal?: AbortSignal
) {
  const formData = new FormData();
  formData.append("lang", lang);
  
  if (mode === "text") {
    formData.append("text", payload as string);
  } else if (mode === "link") {
    formData.append("url", payload as string);
  } else {
    formData.append("file", payload as Blob);
  }

  const response = await fetch(`${API_BASE}/api/analyze`, {
    method: "POST",
    body: formData,
    signal,
  });
  if (!response.ok) {
    let detail = "Failed to analyze offer";
    try {
      const errJson = await response.json();
      detail = errJson.detail || detail;
    } catch {
      const rawText = await response.text();
      if (rawText) detail = rawText;
    }
    const err = new Error(detail);
    (err as any).status = response.status;
    throw err;
  }
  return response.json();
}

export async function getAnalysis(id: string, lang: string = "en") {
  const response = await fetch(`${API_BASE}/api/analyze/${id}?lang=${lang}`);
  if (!response.ok) {
    throw new Error("Failed to fetch analysis");
  }
  return response.json();
}

export async function submitFeedback(id: string, type: "scam" | "genuine") {
  const response = await fetch(`${API_BASE}/api/report/${id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type }),
  });
  if (!response.ok) {
    throw new Error("Failed to submit feedback");
  }
  return response.json();
}

export async function getReportPack(id: string) {
  const response = await fetch(`${API_BASE}/api/report-pack/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch report pack");
  }
  return response.json();
}

export async function getStats() {
  const response = await fetch(`${API_BASE}/api/stats`);
  if (!response.ok) {
    throw new Error("Failed to fetch stats");
  }
  return response.json();
}
