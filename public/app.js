const form = document.getElementById("uploadForm");
const submitBtn = document.getElementById("submitBtn");
const statusEl = document.getElementById("status");
const resultEl = document.getElementById("result");

const t1El = document.getElementById("t1");
const t2El = document.getElementById("t2");
const matchedEl = document.getElementById("matched");
const simEl = document.getElementById("sim");
const levelEl = document.getElementById("level");

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.style.color = isError ? "#dc2626" : "#64748b";
}

function renderResult(data) {
  t1El.textContent = String(data.totalTokensFile1);
  t2El.textContent = String(data.totalTokensFile2);
  matchedEl.textContent = String(data.matchedTokens);
  simEl.textContent = `${Number(data.similarityPercent).toFixed(2)}%`;
  levelEl.textContent = data.plagiarismLevel;

  levelEl.classList.remove("level-low", "level-medium", "level-high");
  const level = String(data.plagiarismLevel || "").toLowerCase();
  if (level.includes("low")) levelEl.classList.add("level-low");
  else if (level.includes("medium")) levelEl.classList.add("level-medium");
  else if (level.includes("high")) levelEl.classList.add("level-high");

  resultEl.classList.remove("hidden");
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const file1 = document.getElementById("file1").files[0];
  const file2 = document.getElementById("file2").files[0];

  if (!file1 || !file2) {
    setStatus("Please select both files before submitting.", true);
    return;
  }

  const body = new FormData();
  body.append("file1", file1);
  body.append("file2", file2);

  submitBtn.disabled = true;
  setStatus("Running plagiarism detection...");
  resultEl.classList.add("hidden");

  try {
    const response = await fetch("/api/detect", {
      method: "POST",
      body
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Detection failed.");
    }

    renderResult(data);
    setStatus("Detection completed successfully.");
  } catch (error) {
    setStatus(error.message || "Something went wrong while detecting plagiarism.", true);
  } finally {
    submitBtn.disabled = false;
  }
});
