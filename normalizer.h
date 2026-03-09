#ifndef NORMALIZER_H
#define NORMALIZER_H

#include <vector>
#include <string>

extern "C" {
#include "parser.tab.h"
}

/**
 * Normalize a token stream for plagiarism comparison.
 * - Variables -> V1, V2, V3, ...
 * - Functions -> F1, F2, F3, ...
 * - Numeric literals -> CONST
 * - String literals -> STRING (or CONST)
 * - Keywords and operators unchanged (by value)
 */
std::vector<std::string> normalizeTokenStream(
    const TokenRec* tokens,
    int count,
    int identTokenType,
    int keywordTokenType,
    int intLitType,
    int floatLitType,
    int stringLitType,
    int operatorType,
    int otherType
);

#endif /* NORMALIZER_H */
