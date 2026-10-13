#!/bin/bash

set -e

# Tipo de incremento (default: patch) y modo pre-release
type=${1:-patch}
pre=${2:-}

# Obtener último tag estable (sin -pre) para calcular base de versión
last_stable=$(git tag --sort=-v:refname | grep -E '^v[0-9]+\.[0-9]+\.[0-9]+$' | head -n 1)

if [ -z "$last_stable" ]; then
  last_stable="v0.0.0"
fi

version=${last_stable#v}
IFS='.' read -r major minor patch_num <<< "$version"

case $type in
  major)
    major=$((major+1))
    minor=0
    patch_num=0
    ;;
  minor)
    minor=$((minor+1))
    patch_num=0
    ;;
  patch)
    patch_num=$((patch_num+1))
    ;;
  *)
    echo "Uso: ./release.sh [major|minor|patch] [pre]"
    exit 1
    ;;
esac

base_version="v$major.$minor.$patch_num"

if [ "$pre" = "pre" ]; then
  # Buscar el número del último pre-release para esta base
  last_pre=$(git tag --sort=-v:refname | grep -E "^${base_version}-pre\.[0-9]+$" | head -n 1)
  if [ -z "$last_pre" ]; then
    pre_num=1
  else
    pre_num=$(echo "$last_pre" | grep -oE '[0-9]+$')
    pre_num=$((pre_num+1))
  fi
  new_version="${base_version}-pre.${pre_num}"
  prerelease_flag="--prerelease"
else
  new_version="$base_version"
  prerelease_flag=""
fi

echo "Última versión estable: $last_stable"
echo "Nueva versión:          $new_version"

gh release create "$new_version" \
  --title "$new_version" \
  --generate-notes \
  $prerelease_flag

echo "✅ Release creado: $new_version"