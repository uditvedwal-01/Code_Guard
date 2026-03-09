#include "normalizer.h"

#include <map>
#include <cstring>
#include <cstdlib>

namespace {

inline bool isDelimiterType(int type) {
    return type == '(' || type == ')' || type == '{' || type == '}' ||
           type == '[' || type == ']' || type == ';' || type == ',' ||
           type == '#' || type == '.' || type == ':' || type == '?' ||
           type == '!' || type == '~' || (type >= 0 && type < 256);
}

} // namespace

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
) {
    std::vector<std::string> result;
    result.reserve(static_cast<size_t>(count));

    std::map<std::string, std::string> varMap;
    std::map<std::string, std::string> funcMap;
    int varCount = 1;
    int funcCount = 1;

    for (int i = 0; i < count; i++) {
        int type = tokens[i].type;
        const char* lex = tokens[i].lexeme;
        std::string lexeme = lex ? lex : "";

        if (type == identTokenType) {
            bool isFunc = (i + 1 < count && tokens[i + 1].type == '(');
            if (isFunc) {
                auto it = funcMap.find(lexeme);
                if (it != funcMap.end()) {
                    result.push_back(it->second);
                } else {
                    std::string norm = "F" + std::to_string(funcCount++);
                    funcMap[lexeme] = norm;
                    result.push_back(norm);
                }
            } else {
                auto it = varMap.find(lexeme);
                if (it != varMap.end()) {
                    result.push_back(it->second);
                } else {
                    std::string norm = "V" + std::to_string(varCount++);
                    varMap[lexeme] = norm;
                    result.push_back(norm);
                }
            }
            continue;
        }

        if (type == intLitType || type == floatLitType) {
            result.push_back("CONST");
            continue;
        }

        if (type == stringLitType) {
            result.push_back("STRING");
            continue;
        }

        if (type == keywordTokenType || type == operatorType || type == otherType || isDelimiterType(type)) {
            result.push_back(lexeme);
            continue;
        }

        result.push_back(lexeme);
    }

    return result;
}
