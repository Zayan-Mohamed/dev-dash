#!/bin/bash

# Simple script to create placeholder icons using any available tool

ICON_DIR="public/icons"
BUILD_ICON_DIR="build/icons"

mkdir -p "$ICON_DIR"
mkdir -p "$BUILD_ICON_DIR"

# Create a simple colored square as placeholder using base64 encoded PNG
# This is a 128x128 blue square PNG
echo "iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEwAACxMBAJqcGAAABsJJREFUeJzt3V9oHFUcxvHf2W2apPWfNRGsqaW1f0RBsCpYFKxgRRAVxAcRRPBBEERE8EERxAcRRPBBEEQQQfBBELxQxAcRRFAQQQT/1EprtdbWJjXdZnd2Z+bOzOzMzs7u7t+zu/N+IJDMzp4/Z5/9nXPunJ0RUsKOu9zL7+wjLGVZc/Y/l74f0G9X6u/VefYqaZqy1tWu11d2I5OUz1+G/b1u3hbI5oHG0WoCsnVgiUwRUm0gpLYQ1lsp/d2kYTa+P5N7/lhZU4TUXiLULiJ1FiH1hhB6gxC1fDZ+kCN5/1jpfCZv2vwU3E/CXTlTn6jvbgTz67P5IhHmM2W/RPL+m/T+m4p/F1XVCpPk80cDu98O/MZ0Aa34LgDSZ4DVj2o95vvQZYuggzwOVH0jgr/Bnx1V/g75pUyK89+l7WeTyWd5f4rkx+mQf9fBfe/4/uekOv2+a7eWBNLHAas/AOtnEqJxMZ+vl8/3BXb/G7P8b8XcbC/3/W/F/Mcg1+ff/5ZbdmcJsOohYP0joHt5+V+6c3kUAEDfCaB/JHJ77wjQM5Ied/UBZ+/lZQ/upue+HQH2/Rjc/8tV3/XsmpeAlY8CnYuBwmlgsQvMngTOngKODQJnhoDj7wPH3wMOvw0ceAM4+Dpw8C/g0Jt5eQ0Y2Atsfwl49kFg3V3AqluB21YD3QOJCYzAQsBWAcNvAUOvAiPbM/nbWwH23g1s3wRs2wBsXgusfxxYdyfw8MPATeuBzvsQ+IPAGoDWAtgagPYC+F8AsHY+fgQHrgAAAABJRU5ErkJggg==" | base64 -d > "$ICON_DIR/icon-128.png"

# Copy for different sizes
cp "$ICON_DIR/icon-128.png" "$ICON_DIR/icon-48.png"
cp "$ICON_DIR/icon-128.png" "$ICON_DIR/icon-16.png"

echo "Placeholder icons created in $ICON_DIR"

# Copy to build if it exists
if [ -d "build" ]; then
  cp -r "$ICON_DIR" "$BUILD_ICON_DIR"
  echo "Icons copied to $BUILD_ICON_DIR"
fi
