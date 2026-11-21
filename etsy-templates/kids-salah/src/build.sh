#!/bin/sh
# Builds the single-page artifact: compiles App.jsx (React JSX) with esbuild and inlines it with the CSS.
# Usage: sh build.sh <path to esbuild binary>
set -e
cd "$(dirname "$0")"
ESBUILD="${1:-esbuild}"
"$ESBUILD" App.jsx --bundle --format=iife --jsx-factory=React.createElement --jsx-fragment=React.Fragment --minify --target=es2019 --outfile=../build/app.js --log-level=warning
mkdir -p ../preview
{
  printf '%s\n' '<title>Little Salah</title>' '<meta name="claude:viewport-fit-sides" content="cover">'
  printf '%s\n' '<link rel="preconnect" href="https://fonts.googleapis.com">'
  printf '%s\n' '<link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Nunito:wght@400;600;700;800&family=Amiri:wght@400;700&display=swap" rel="stylesheet">'
  printf '<style>\n'; cat styles.css; printf '</style>\n'
  printf '%s\n' '<div id="root"></div>'
  printf '%s\n' '<script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js"></script>'
  printf '%s\n' '<script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js"></script>'
  printf '<script>\n'; cat ../build/app.js; printf '</script>\n'
} > ../preview/little-salah.html
echo "built ../preview/little-salah.html ($(wc -c < ../preview/little-salah.html) bytes)"
