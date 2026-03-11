%{
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int yylex(void);
void yyerror(const char* s);
%}

%code requires {
#include <stdlib.h>
#include <string.h>
#define MAX_TOKENS 10000
typedef struct { int type; char* lexeme; } TokenRec;
extern TokenRec g_tokens[];
extern int g_token_count;
void add_token(int type, const char* lexeme);
void token_list_clear(void);
}

%union {
    char* s;
    int i;
}

%token <s> IDENT
%token <s> INT_LIT FLOAT_LIT STRING_LIT
%token <s> KEYWORD
%token OPERATOR
%token OTHER

%start program

%%

/* Permissive grammar: accept any sequence of tokens (IR = token stream) */
program
    : token_seq
    ;

token_seq
    : token_seq token
    | /* empty */
    ;

token
    : KEYWORD
    | IDENT
    | INT_LIT
    | FLOAT_LIT
    | STRING_LIT
    | OPERATOR
    | '('
    | ')'
    | '{'
    | '}'
    | '['
    | ']'
    | ';'
    | ','
    | '#'
    | '.'
    | ':'
    | '?'
    | '!'
    | '~'
    | OTHER
    ;

%%

TokenRec g_tokens[MAX_TOKENS];
int g_token_count = 0;

void add_token(int type, const char* lexeme) {
    if (g_token_count >= MAX_TOKENS) return;
    g_tokens[g_token_count].type = type;
    g_tokens[g_token_count].lexeme = lexeme ? strdup(lexeme) : NULL;
    g_token_count++;
}

void yyerror(const char* s) {
    fprintf(stderr, "Parse error: %s\n", s);
}

void token_list_clear(void) {
    int i;
    for (i = 0; i < g_token_count; i++) {
        if (g_tokens[i].lexeme) free(g_tokens[i].lexeme);
    }
    g_token_count = 0;
}
