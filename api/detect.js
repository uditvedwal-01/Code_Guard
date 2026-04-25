const { execFile } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { formidable } = require("formidable");

function parseOutput(stdout) {
  const data = {
    comparing: "",
    totalTokensFile1: 0,
    totalTokensFile2: 0,
    matchedTokens: 0,
    similarityPercent: 0,
    plagiarismLevel: "Unknown",
    rawOutput: stdout
  };

  const lines = stdout.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);

  for (const line of lines) {
    if (line.startsWith("Comparing ")) data.comparing = line.replace("Comparing ", "");
    else if (line.startsWith("Total Tokens File1:")) data.totalTokensFile1 = Number(line.split(":")[1].trim()) || 0;
    else if (line.startsWith("Total Tokens File2:")) data.totalTokensFile2 = Number(line.split(":")[1].trim()) || 0;
    else if (line.startsWith("Matched Tokens:")) data.matchedTokens = Number(line.split(":")[1].trim()) || 0;
    else if (line.startsWith("Similarity:")) data.similarityPercent = Number(line.split(":")[1].replace("%", "").trim()) || 0;
    else if (line.startsWith("Plagiarism Level:")) data.plagiarismLevel = line.split(":")[1].trim() || "Unknown";
  }

  return data;
}

function getBinaryPath() {
  const exeName = process.platform === "win32" ? "plagiarism_check.exe" : "plagiarism_check";

  const candidates = [
    path.join(process.cwd(), "bin", exeName),
    path.join(process.cwd(), exeName),
    path.join(__dirname, "..", "bin", exeName)
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }

  throw new Error("Plagiarism detector binary not found. Build it first.");
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const form = formidable({
    multiples: false,
    keepExtensions: true,
    uploadDir: os.tmpdir(),
    maxFileSize: 3 * 1024 * 1024
  });

  form.parse(req, (err, _fields, files) => {
    if (err) {
      return res.status(400).json({ error: "Invalid multipart form data.", details: err.message });
    }

    const file1 = Array.isArray(files.file1) ? files.file1[0] : files.file1;
    const file2 = Array.isArray(files.file2) ? files.file2[0] : files.file2;

    if (!file1 || !file2) {
      return res.status(400).json({ error: "Please upload both file1 and file2." });
    }

    let binaryPath = "";
    try {
      binaryPath = getBinaryPath();
    } catch (binaryError) {
      return res.status(500).json({ error: binaryError.message });
    }

    const args = [file1.filepath, file2.filepath];

    execFile(binaryPath, args, { timeout: 15000 }, (execErr, stdout, stderr) => {
      try {
        if (file1.filepath) fs.unlinkSync(file1.filepath);
        if (file2.filepath) fs.unlinkSync(file2.filepath);
      } catch (_) {
        // ignore tmp cleanup errors
      }

      if (execErr) {
        return res.status(500).json({
          error: "Detector execution failed.",
          details: stderr || execErr.message
        });
      }

      return res.status(200).json(parseOutput(stdout));
    });
  });
};
