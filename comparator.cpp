#include "comparator.h"
#include <algorithm>
#include <cstring>

static int lcsLength(const std::vector<std::string>& a, const std::vector<std::string>& b) {
    const size_t m = a.size();
    const size_t n = b.size();
    if (m == 0 || n == 0) return 0;

    std::vector<std::vector<int>> dp(m + 1, std::vector<int>(n + 1, 0));

    for (size_t i = 1; i <= m; i++) {
        for (size_t j = 1; j <= n; j++) {
            if (a[i - 1] == b[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = std::max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }
    return dp[m][n];
}
ComparisonResult compareTokenSequences(
    const std::vector<std::string>& seq1,
    const std::vector<std::string>& seq2
) {
    ComparisonResult r;
    r.total1 = static_cast<int>(seq1.size());
    r.total2 = static_cast<int>(seq2.size());
    r.matched = lcsLength(seq1, seq2);

    int total = r.total1 + r.total2;
    if (total == 0) {
        r.similarityPercent = 0.0;
    } else {
        r.similarityPercent = (2.0 * r.matched / total) * 100.0;
    }

    if (r.similarityPercent <= 30.0) {
        r.level = "Low";
    } else if (r.similarityPercent <= 70.0) {
        r.level = "Medium";
    } else {
        r.level = "High";
    }

    return r;
}
