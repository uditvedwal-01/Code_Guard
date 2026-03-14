# Compiler-Based Plagiarism Detection System
# Build with: make
# Run with: ./plagiarism_check file1.c file2.c
# Prerequisites: g++, gcc, flex, bison. Install on Debian/Ubuntu: sudo apt install build-essential flex bison

CC = gcc
CXX = g++
CXXFLAGS =
LDFLAGS = -lfl
FLEX = flex
BISON = bison

# Fail early with a clear message if g++ is missing (avoids "cannot execute cc1plus" later)
CHECK_CXX := $(shell which $(CXX) 2>/dev/null)
ifeq ($(CHECK_CXX),)
$(error C++ compiler '$(CXX)' not found. Install it with: sudo apt update && sudo apt install build-essential)
endif

TARGET = plagiarism_check
SRCS_CPP = main.cpp normalizer.cpp comparator.cpp
OBJS = lex.yy.o parser.tab.o main.o normalizer.o comparator.o

# Bison generates parser.tab.c and parser.tab.h
# Flex generates lex.yy.c

all: $(TARGET)

$(TARGET): $(OBJS)
	$(CXX) -o $(TARGET) $(OBJS) $(LDFLAGS)

parser.tab.c parser.tab.h: parser.y
	$(BISON) -d parser.y

lex.yy.c: lexer.l parser.tab.h
	$(FLEX) lexer.l

lex.yy.o: lex.yy.c parser.tab.h
	$(CC) -c lex.yy.c -o lex.yy.o

parser.tab.o: parser.tab.c
	$(CC) -c parser.tab.c -o parser.tab.o

main.o: main.cpp parser.tab.h normalizer.h comparator.h
	$(CXX) -c main.cpp -o main.o

normalizer.o: normalizer.cpp normalizer.h parser.tab.h
	$(CXX) -c normalizer.cpp -o normalizer.o

comparator.o: comparator.cpp comparator.h
	$(CXX) -c comparator.cpp -o comparator.o

clean:
	rm -f $(OBJS) lex.yy.c parser.tab.c parser.tab.h $(TARGET)

.PHONY: all clean
