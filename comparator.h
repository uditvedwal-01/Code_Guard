#ifndef COMPARATOR_H
#define COMPARATOR_H

#include <vector>
#include <string>

struct ComparisonResult {
    int total1;
    int total2;
    int matched;
    double similarityPercent;
    const char* level;  /* "Low", "Medium", "High" */
};
/**
 * Compare two normalized token sequences using Longest Common Subsequence (LCS).
 * Similarity % = (2 * LCS_length) / (total1 + total2) * 100
 * Plagiarism levels: 0-30% Low, 31-70% Medium, 71-100% High
 */
ComparisonResult compareTokenSequences(
    const std::vector<std::string>& seq1,
    const std::vector<std::string>& seq2
);

#endif /* COMPARATOR_H */
