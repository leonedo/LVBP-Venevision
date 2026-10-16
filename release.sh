#!/bin/bash
# Publica una versión: calcula la versión semver siguiente y pushea main a la rama
# release/<versión>. GitHub Actions (.github/workflows/release.yml) crea ahí el tag y el release
# (título, notas y el zip que se copia al playout) y borra la rama. Así funciona igual desde una
# computadora y desde una sesión de Claude Code en la nube, que puede pushear ramas pero no tags
# ni releases.
#
# Uso: ./release.sh [major|minor|patch] [pre]

set -e

# Tipo de incremento (default: patch) y modo pre-release
type=${1:-patch}
pre=${2:-}

# El tag va sobre main tal como está en GitHub, y la versión se calcula con los tags de GitHub
# (si no, repite una que ya existe).
git fetch --quiet --tags origin main
if [ "$(git rev-parse --abbrev-ref HEAD)" != "main" ]; then
  echo "❌ Hay que estar en main"
  exit 1
fi
if [ -n "$(git status --porcelain --untracked-files=no)" ]; then
  echo "❌ Hay cambios sin commitear"
  exit 1
fi
if [ "$(git rev-parse HEAD)" != "$(git rev-parse origin/main)" ]; then
  echo "❌ main no coincide con origin/main: falta un pull o un push"
  exit 1
fi

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
else
  new_version="$base_version"
fi

echo "Última versión estable: $last_stable"
echo "Nueva versión:          $new_version"

git push --quiet origin "HEAD:refs/heads/release/$new_version"
echo "✅ Rama release/$new_version pusheada: GitHub Actions crea el tag y el release"

# Esperar a que el release aparezca (si hay gh para mirarlo)
if command -v gh > /dev/null 2>&1; then
  for i in $(seq 1 36); do
    if gh release view "$new_version" > /dev/null 2>&1; then
      echo "✅ Release creado: $(gh release view "$new_version" --json url -q .url)"
      exit 0
    fi
    sleep 5
  done
  echo "⚠️  El release todavía no aparece: mirar la pestaña Actions del repo en GitHub"
fi
