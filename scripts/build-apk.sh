#!/usr/bin/env bash
# Builds a debug APK end-to-end: web bundle → Capacitor sync → Gradle assembleDebug.
# Output: builds/ladder-debug.apk
#
# Requires Java 21 (openjdk@21) and Android SDK command-line tools installed via Homebrew:
#   brew install openjdk@21
#   brew install --cask android-commandlinetools
#   sdkmanager "platform-tools" "platforms;android-35" "build-tools;35.0.0"

set -euo pipefail

export JAVA_HOME="${JAVA_HOME:-/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home}"
export ANDROID_HOME="${ANDROID_HOME:-/opt/homebrew/share/android-commandlinetools}"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$PATH"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "▶ Building web bundle..."
npm run build

echo "▶ Syncing Capacitor → Android..."
npx cap sync android

echo "▶ Configuring SDK location..."
echo "sdk.dir=$ANDROID_HOME" > android/local.properties

echo "▶ Running Gradle assembleDebug..."
(cd android && ./gradlew assembleDebug)

mkdir -p builds
cp android/app/build/outputs/apk/debug/app-debug.apk builds/ladder-debug.apk

echo ""
echo "✓ Built: builds/ladder-debug.apk ($(du -h builds/ladder-debug.apk | cut -f1))"
echo ""
echo "To install on a connected device:"
echo "  adb install -r builds/ladder-debug.apk"
