# Code_Guard: Compiler-Based Plagiarism Detection System

A **deterministic, rule-based** plagiarism detection system for C source code that uses classical compiler phases: lexical analysis, syntax analysis, intermediate representation, and comparison. No AI, ML, NLP, or pretrained models are used.

## Project Description

This tool compares two C source files and reports a **similarity percentage** and **plagiarism level** (Low / Medium / High) by:

1. **Lexical analysis (Flex):** Tokenizing the source while ignoring comments and whitespace.
2. **Syntax analysis (YACC/Bison):** Parsing the token stream to validate structure and build an intermediate representation.
3. **Normalization:** Mapping variables to V1, V2, …; functions to F1, F2, …; numeric literals to CONST; keeping keywords and operators unchanged.
4. **Comparison:** Computing similarity using the **Longest Common Subsequence (LCS)** of the normalized token sequences.

The system is **purely compiler-based**, with no machine learning or external language models.

## Compiler Design Concepts Used

| Phase              | Concept                          | Implementation        |
|--------------------|----------------------------------|------------------------|
| Lexical Analysis   | Tokenization, ignore comments/WS | Flex (`lexer.l`)       |
| Syntax Analysis    | Grammar, parse tree / IR          | Bison (`parser.y`)     |
| IR                 | Normalized token stream          | `normalizer.cpp`       |
| Comparison         | LCS, similarity metric           | `comparator.cpp`       |

- **Lexer:** Keywords, identifiers, operators, literals (int, float, string), delimiters; single-line and multi-line comments and whitespace are ignored.
- **Parser:** Permissive grammar over token stream so that the IR is the sequence of tokens.
- **Normalizer:** First occurrence of each identifier is classified (function if followed by `(`, else variable) and replaced by F1/F2/… or V1/V2/…; numeric constants become CONST.
- **Comparator:** LCS of the two normalized token sequences; similarity = `(2 * LCS) / (total1 + total2) * 100`; levels: 0–30% Low, 31–70% Medium, 71–100% High.

## How to Compile

**Prerequisites:** `gcc`/`g++`, Flex, Bison. The project is intended to **compile and run on Linux**. On Windows, use WSL (Windows Subsystem for Linux) or a Linux VM and run the same commands there.

```bash
make
```

This will:

1. Run `flex lexer.l` to generate `lex.yy.c`.
2. Run `bison -d parser.y` to generate `parser.tab.c` and `parser.tab.h`.
3. Compile and link all sources to produce the `plagiarism_check` binary.

**If you see `g++: No such file or directory` or `cannot execute 'cc1plus'`:**  
Your C++ toolchain is missing or incomplete. Install the full build tools (including the C++ compiler and its front-end):

```bash
sudo apt update
sudo apt install build-essential flex bison
```

Then run `make` again. Ensure the lexer file is named **`lexer.l`** (letter L), not `lexer.1` (digit one).

## How to Run

```bash
./plagiarism_check <file1.c> <file2.c>
```

Example:

```bash
./plagiarism_check tests/original.c tests/same_logic_different_names.c
```

## Sample Output

```
Comparing tests/original.c and tests/same_logic_different_names.c
Total Tokens File1: 42
Total Tokens File2: 42
Matched Tokens: 40
Similarity: 95.24%
Plagiarism Level: High
```

- **Same logic, different names:** High similarity (e.g. 90%+).
- **Completely different logic:** Low similarity (e.g. &lt; 30%).
- **Partial copy:** Medium similarity (e.g. 31–70%).

## File Structure

```
├── lexer.l          # Flex lexical analyzer
├── parser.y         # Bison grammar and token collection
├── main.cpp         # Entry point, file I/O, orchestration
├── normalizer.cpp   # Token stream normalization
├── normalizer.h
├── comparator.cpp   # LCS-based comparison
├── comparator.h
├── Makefile
├── README.md
└── tests/
    ├── original.c
    ├── same_logic_different_names.c
    ├── completely_different.c
    └── partial_copy.c
```

## Test Cases

1. **Same logic, different variable/function names:** `original.c` vs `same_logic_different_names.c` — should report **High**.
2. **Completely different logic:** `original.c` vs `completely_different.c` — should report **Low**.
3. **Partial copy:** `original.c` vs `partial_copy.c` — should report **Medium**.

Run from project root, e.g.:

```bash
./plagiarism_check tests/original.c tests/same_logic_different_names.c
./plagiarism_check tests/original.c tests/completely_different.c
./plagiarism_check tests/original.c tests/partial_copy.c
```

## Future Enhancements

- Support for more C constructs (pointers, structs, macros) in the grammar.
- Optional AST-based comparison (e.g. tree edit distance) in addition to token-sequence LCS.
- Configurable similarity thresholds and level boundaries.
- Batch mode: compare one file against many, or all pairs in a directory.
- Output options: JSON/CSV for integration with grading scripts.

## License

Academic / educational use. No warranty.
