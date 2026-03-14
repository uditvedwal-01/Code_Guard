%{
#include "parser.tab.h"
#include <stdlib.h>
#include <string.h>

void add_token(int type, const char* lexeme);
%}

DIGIT       [0-9]
LETTER      [a-zA-Z_]
ID          {LETTER}({LETTER}|{DIGIT})*
INT         {DIGIT}+
FLOAT       {DIGIT}+\.{DIGIT}*
STRING      \"([^"\\]|\\.)*\"

%option noyywrap
%option yylineno

%%

"/*"([^*]|\*+[^*/])*\*+"/"   { /* multi-line comment - ignore */ }
"//".*                       { /* single-line comment - ignore */ }

[ \t\n\r]+                   { /* whitespace - ignore */ }

"int"|"float"|"double"|"char"|"void"|"long"|"short"    { add_token(KEYWORD, yytext); return KEYWORD; }
"if"|"else"|"for"|"while"|"do"|"return"|"break"|"continue"  { add_token(KEYWORD, yytext); return KEYWORD; }
"switch"|"case"|"default"    { add_token(KEYWORD, yytext); return KEYWORD; }
"struct"|"typedef"|"include"  { add_token(KEYWORD, yytext); return KEYWORD; }
"#include"                   { add_token(KEYWORD, yytext); return KEYWORD; }

{INT}        { add_token(INT_LIT, yytext); return INT_LIT; }
{FLOAT}      { add_token(FLOAT_LIT, yytext); return FLOAT_LIT; }
{STRING}     { add_token(STRING_LIT, yytext); return STRING_LIT; }

{ID}         { add_token(IDENT, yytext); return IDENT; }

"+"|"-"|"*"|"/"|"%"|"=="|"!="|"<"|">"|"<="|">="  { add_token(OPERATOR, yytext); return OPERATOR; }
"="|"++"|"--"|"&&"|"||"|"!"  { add_token(OPERATOR, yytext); return OPERATOR; }
"&"|"|"|"^"|"<<"|">>"       { add_token(OPERATOR, yytext); return OPERATOR; }

"("          { add_token('(', yytext); return '('; }
")"          { add_token(')', yytext); return ')'; }
"{"          { add_token('{', yytext); return '{'; }
"}"          { add_token('}', yytext); return '}'; }
"["          { add_token('[', yytext); return '['; }
"]"          { add_token(']', yytext); return ']'; }
";"          { add_token(';', yytext); return ';'; }
","          { add_token(',', yytext); return ','; }
"#"          { add_token('#', yytext); return '#'; }
"."          { add_token('.', yytext); return '.'; }
":"          { add_token(':', yytext); return ':'; }
"?"          { add_token('?', yytext); return '?'; }
"!"          { add_token('!', yytext); return '!'; }
"~"          { add_token('~', yytext); return '~'; }

.            { add_token(OTHER, yytext); return OTHER; }

%%
