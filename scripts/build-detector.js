const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "bin");
const exeName = process.platform === "win32" ? "plagiarism_check.exe" : "plagiarism_check";
const outPath = path.join(outDir, exeName);

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const objDir = path.join(outDir, "obj");
if (!fs.existsSync(objDir)) {
  fs.mkdirSync(objDir, { recursive: true });
}

const steps = [
  {
    cmd: "gcc",
    args: ["-O2", "-c", "lex.yy.c", "-o", path.join(objDir, "lex.yy.o")]
  },
  {
    cmd: "gcc",
    args: ["-O2", "-c", "parser.tab.c", "-o", path.join(objDir, "parser.tab.o")]
  },
  {
    cmd: "g++",
    args: ["-std=c++17", "-O2", "-c", "main.cpp", "-o", path.join(objDir, "main.o")]
  },
  {
    cmd: "g++",
    args: ["-std=c++17", "-O2", "-c", "normalizer.cpp", "-o", path.join(objDir, "normalizer.o")]
  },
  {
    cmd: "g++",
    args: ["-std=c++17", "-O2", "-c", "comparator.cpp", "-o", path.join(objDir, "comparator.o")]
  },
  {
    cmd: "g++",
    args: [
      "-o",
      outPath,
      path.join(objDir, "lex.yy.o"),
      path.join(objDir, "parser.tab.o"),
      path.join(objDir, "main.o"),
      path.join(objDir, "normalizer.o"),
      path.join(objDir, "comparator.o")
    ]
  }
];

console.log("Compiling detector binary...");
for (const step of steps) {
  const result = spawnSync(step.cmd, step.args, {
    cwd: root,
    stdio: "inherit"
  });

  if (result.status !== 0) {
    console.error(`Build failed while running: ${step.cmd} ${step.args.join(" ")}`);
    process.exit(result.status || 1);
  }
}

console.log(`Detector compiled at: ${outPath}`);
