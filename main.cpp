/**
 * Compiler-Based Plagiarism Detection System
 * Entry point: compare two C source files and report similarity.
 */

#include <iostream>
#include <iomanip>
#include <cstdio>
#include <cstdlib>
#include <vector>
#include <string>

extern "C" {
#include "parser.tab.h"
int yyparse(void);
void token_list_clear(void);
extern FILE* yyin;
}

#include "normalizer.h"
#include "comparator.h"

static int processFile(const char* path, std::vector<std::string>& outNormalized) {
    token_list_clear();
    yyin = fopen(path, "r");
    if (!yyin) {
        std::cerr << "Error: cannot open file '" << path << "'" << std::endl;
        return -1;
    }
    yyparse();
    fclose(yyin);
    yyin = NULL;

    outNormalized = normalizeTokenStream(
        g_tokens,
        g_token_count,
        IDENT,
        KEYWORD,
        INT_LIT,
        FLOAT_LIT,
        STRING_LIT,
        OPERATOR,
        OTHER
    );
    return 0;
}

int main(int argc, char* argv[]) {
    if (argc != 3) {
        std::cerr << "Usage: " << (argc >= 1 ? argv[0] : "plagiarism_check") << " <file1.c> <file2.c>" << std::endl;
        return 1;
    }

    const char* file1 = argv[1];
    const char* file2 = argv[2];

    std::vector<std::string> norm1, norm2;

    if (processFile(file1, norm1) != 0) return 1;
    if (processFile(file2, norm2) != 0) return 1;

    ComparisonResult res = compareTokenSequences(norm1, norm2);

    std::cout << "Comparing " << file1 << " and " << file2 << std::endl;
    std::cout << "Total Tokens File1: " << res.total1 << std::endl;
    std::cout << "Total Tokens File2: " << res.total2 << std::endl;
    std::cout << "Matched Tokens: " << res.matched << std::endl;
    std::cout << "Similarity: " << std::fixed << std::setprecision(2) << res.similarityPercent << "%" << std::endl;
    std::cout << "Plagiarism Level: " << res.level << std::endl;

    return 0;
}
