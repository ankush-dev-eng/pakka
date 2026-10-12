#!/bin/bash
set -e

MODE=${1:-"--fast"}

if [ "$MODE" = "--fast" ] || [ "$MODE" = "--full" ]; then
    echo "Running lint and type checks..."
    make lint
    make typecheck
fi

if [ "$MODE" = "--full" ]; then
    echo "Running full test suite..."
    make test
fi

if [ "$MODE" != "--fast" ] && [ "$MODE" != "--full" ]; then
    echo "Unsupported mode: $MODE"
    exit 1
fi
