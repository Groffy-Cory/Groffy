#!/usr/bin/env bash
#
# split-history-by-cutoff.sh
#
# Prepare two filtered mirror repositories ("old" and "today") from a source
# repository. Two modes are supported:
#
#   MODE=cutoff (default) - split history around a cutoff date:
#     old   -> commits whose committer date is strictly BEFORE the cutoff
#     today -> commits whose committer date is ON or AFTER the cutoff
#
#   MODE=project - split by project folder:
#     old   -> every branch except PROJECT_BRANCH, with PROJECT_DIR/ removed
#              from all history
#     today -> only PROJECT_BRANCH, keeping just PROJECT_DIR/ moved to the
#              repository root, published as TODAY_BRANCH_NAME
#
# SAFETY: by default this script only clones, filters and validates local
# mirrors. It NEVER pushes unless PUSH=true AND CONFIRM_FORCE_MIRROR_PUSH=yes
# are both set. Pushing uses `git push --mirror --force`, which overwrites and
# DELETES refs on the destination. See docs/split-history-by-cutoff.md.
#
# Configuration (environment variables, or the equivalent flags below):
#   MODE                       --mode cutoff|project     (default: cutoff)
#   SOURCE_REPO_URL            --source URL              (default: https://github.com/Groffy-Cory/Groffy.git)
#   OLD_TARGET_URL             --old-target URL          (default: https://github.com/Groffy-Cory/realoldfriend.git)
#   TODAY_TARGET_URL           --today-target URL        (default: https://github.com/Groffy-Cory/thedoneye.git)
#   WORKDIR                    --workdir PATH            (default: new directory from mktemp -d)
#   PUSH                       --push                    (default: false)
#   CONFIRM_FORCE_MIRROR_PUSH  (must be exactly "yes" for PUSH=true to proceed)
#   ALLOW_EMPTY_OLD            (set to "yes" if an empty "old" result is expected)
#   ALLOW_EMPTY_TODAY          (set to "yes" if an empty "today" result is expected)
#   SKIP_TARGET_BACKUP         (set to "yes" to skip backing up targets before pushing)
# Cutoff mode only:
#   CUTOFF                     --cutoff "DATETIME"       (default: "2026-10-23 00:00:00", local timezone)
# Project mode only:
#   PROJECT_BRANCH             --project-branch NAME     (default: cursor/don-eye-command-center)
#   PROJECT_DIR                --project-dir DIR         (default: don-eye)
#   TODAY_BRANCH_NAME          --today-branch NAME       (default: main)
#   BUILD_CHECK                (default: yes; runs `npm ci` + `npm run build` on
#                               the "today" result; required for PUSH=true)

set -euo pipefail

MODE="${MODE:-cutoff}"
SOURCE_REPO_URL="${SOURCE_REPO_URL:-https://github.com/Groffy-Cory/Groffy.git}"
CUTOFF="${CUTOFF:-2026-10-23 00:00:00}"
OLD_TARGET_URL="${OLD_TARGET_URL:-https://github.com/Groffy-Cory/realoldfriend.git}"
TODAY_TARGET_URL="${TODAY_TARGET_URL:-https://github.com/Groffy-Cory/thedoneye.git}"
WORKDIR="${WORKDIR:-}"
PUSH="${PUSH:-false}"
CONFIRM_FORCE_MIRROR_PUSH="${CONFIRM_FORCE_MIRROR_PUSH:-}"
ALLOW_EMPTY_OLD="${ALLOW_EMPTY_OLD:-no}"
ALLOW_EMPTY_TODAY="${ALLOW_EMPTY_TODAY:-no}"
SKIP_TARGET_BACKUP="${SKIP_TARGET_BACKUP:-no}"
PROJECT_BRANCH="${PROJECT_BRANCH:-cursor/don-eye-command-center}"
PROJECT_DIR="${PROJECT_DIR:-don-eye}"
TODAY_BRANCH_NAME="${TODAY_BRANCH_NAME:-main}"
BUILD_CHECK="${BUILD_CHECK:-yes}"

log() { printf '==> %s\n' "$*"; }
warn() { printf 'WARNING: %s\n' "$*" >&2; }
die() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }

usage() {
  sed -n '2,/^set -euo pipefail/p' "$0" | sed -e '$d' -e 's/^# \{0,1\}//'
}

while [ $# -gt 0 ]; do
  case "$1" in
    --mode) [ $# -ge 2 ] || die "--mode requires a value"; MODE="$2"; shift 2 ;;
    --source) [ $# -ge 2 ] || die "--source requires a value"; SOURCE_REPO_URL="$2"; shift 2 ;;
    --cutoff) [ $# -ge 2 ] || die "--cutoff requires a value"; CUTOFF="$2"; shift 2 ;;
    --old-target) [ $# -ge 2 ] || die "--old-target requires a value"; OLD_TARGET_URL="$2"; shift 2 ;;
    --today-target) [ $# -ge 2 ] || die "--today-target requires a value"; TODAY_TARGET_URL="$2"; shift 2 ;;
    --project-branch) [ $# -ge 2 ] || die "--project-branch requires a value"; PROJECT_BRANCH="$2"; shift 2 ;;
    --project-dir) [ $# -ge 2 ] || die "--project-dir requires a value"; PROJECT_DIR="$2"; shift 2 ;;
    --today-branch) [ $# -ge 2 ] || die "--today-branch requires a value"; TODAY_BRANCH_NAME="$2"; shift 2 ;;
    --workdir) [ $# -ge 2 ] || die "--workdir requires a value"; WORKDIR="$2"; shift 2 ;;
    --push) PUSH=true; shift ;;
    -h|--help) usage; exit 0 ;;
    *) die "Unknown argument: $1 (use --help for usage)" ;;
  esac
done

case "$MODE" in
  cutoff|project) ;;
  *) die "MODE must be 'cutoff' or 'project' (got '$MODE')" ;;
esac

case "$PUSH" in
  true|false) ;;
  *) die "PUSH must be 'true' or 'false' (got '$PUSH')" ;;
esac

if [ "$MODE" = "project" ]; then
  PROJECT_DIR="${PROJECT_DIR%/}"
  case "$PROJECT_DIR" in
    ''|/*|*..*) die "PROJECT_DIR must be a relative folder path inside the repository (got '$PROJECT_DIR')" ;;
  esac
  [ -n "$PROJECT_BRANCH" ] || die "PROJECT_BRANCH must not be empty."
  git check-ref-format --branch "$TODAY_BRANCH_NAME" >/dev/null 2>&1 \
    || die "TODAY_BRANCH_NAME '$TODAY_BRANCH_NAME' is not a valid branch name."
fi

# Fail fast on push gates before doing any work.
if [ "$PUSH" = "true" ]; then
  if [ "${CI:-}" = "true" ]; then
    die "Refusing to push from a CI environment (CI=true). Run the push manually."
  fi
  if [ "$CONFIRM_FORCE_MIRROR_PUSH" != "yes" ]; then
    die "PUSH=true requires CONFIRM_FORCE_MIRROR_PUSH=yes. Nothing was pushed."
  fi
  if [ "$MODE" = "project" ] && [ "$BUILD_CHECK" != "yes" ]; then
    die "PUSH=true in project mode requires BUILD_CHECK=yes so 'today' is proven to build on its own. Nothing was pushed."
  fi
fi

# --- Prerequisites ----------------------------------------------------------

command -v git >/dev/null 2>&1 || die "git is not installed."
command -v python3 >/dev/null 2>&1 || die "python3 is required (git filter-repo and cutoff parsing)."
git filter-repo --version >/dev/null 2>&1 \
  || die "git filter-repo is not installed. See https://github.com/newren/git-filter-repo (e.g. 'pip install git-filter-repo')."
if [ "$MODE" = "project" ] && [ "$BUILD_CHECK" = "yes" ]; then
  command -v npm >/dev/null 2>&1 \
    || die "npm is required for the project-mode build check (or set BUILD_CHECK=no for a dry run only)."
fi

# --- Cutoff (local timezone) -------------------------------------------------

if [ "$MODE" = "cutoff" ]; then
  # A naive datetime (no UTC offset) is interpreted in the machine's local
  # timezone (honours the TZ environment variable). If CUTOFF includes an
  # explicit offset (e.g. "2026-10-23 00:00:00+00:00"), that offset is used.
  CUTOFF_EPOCH="$(CUTOFF="$CUTOFF" python3 -c '
import os, sys
from datetime import datetime
try:
    print(int(datetime.fromisoformat(os.environ["CUTOFF"]).timestamp()))
except ValueError as e:
    sys.exit("invalid CUTOFF %r: %s" % (os.environ["CUTOFF"], e))
')" || die "Could not parse CUTOFF='$CUTOFF'. Use a format like '2026-10-23 00:00:00'."
  export CUTOFF_EPOCH

  CUTOFF_DISPLAY="$(CUTOFF_EPOCH="$CUTOFF_EPOCH" python3 -c '
import os
from datetime import datetime
print(datetime.fromtimestamp(int(os.environ["CUTOFF_EPOCH"])).astimezone().isoformat())
')"
fi

# --- Work directory ----------------------------------------------------------

if [ -z "$WORKDIR" ]; then
  WORKDIR="$(mktemp -d "${TMPDIR:-/tmp}/split-history.XXXXXX")"
else
  mkdir -p "$WORKDIR"
fi
WORKDIR="$(cd "$WORKDIR" && pwd)"

SOURCE_MIRROR="$WORKDIR/source.git"
OLD_MIRROR="$WORKDIR/old.git"
TODAY_MIRROR="$WORKDIR/today.git"
BUILD_DIR="$WORKDIR/today-build-check"

for d in "$SOURCE_MIRROR" "$OLD_MIRROR" "$TODAY_MIRROR" "$BUILD_DIR"; do
  [ ! -e "$d" ] || die "$d already exists. Use an empty WORKDIR so previous results are never reused or clobbered."
done

log "Mode              : $MODE"
log "Source repository : $SOURCE_REPO_URL"
if [ "$MODE" = "cutoff" ]; then
  log "Cutoff            : '$CUTOFF' -> $CUTOFF_DISPLAY (epoch $CUTOFF_EPOCH)"
else
  log "Project branch    : $PROJECT_BRANCH"
  log "Project folder    : $PROJECT_DIR/"
  log "Today branch name : $TODAY_BRANCH_NAME"
  log "Build check       : $BUILD_CHECK"
fi
log "Old target        : $OLD_TARGET_URL"
log "Today target      : $TODAY_TARGET_URL"
log "Work directory    : $WORKDIR"
log "Push enabled      : $PUSH"

# --- Clone and filter ----------------------------------------------------------

log "Cloning source as a mirror..."
git clone --mirror -- "$SOURCE_REPO_URL" "$SOURCE_MIRROR"

clone_working_mirror() {
  local name="$1" dest="$2"

  log "Creating working mirror '$name' at $dest..."
  git clone --mirror --no-local -- "$SOURCE_MIRROR" "$dest"

  # GitHub mirror clones include read-only refs/pull/* refs which cannot be
  # pushed back to GitHub; drop them from the working copy.
  git --git-dir="$dest" for-each-ref --format='delete %(refname)' refs/pull/ \
    | git --git-dir="$dest" update-ref --stdin
}

run_filter() {
  local name="$1" dest="$2"
  shift 2

  log "Filtering '$name' history..."
  (cd "$dest" && GIT_DIR=. git filter-repo --force "$@")

  # filter-repo usually removes 'origin' already; never fail if it is gone.
  git --git-dir="$dest" remote remove origin >/dev/null 2>&1 || true
}

if [ "$MODE" = "cutoff" ]; then
  # Callbacks use the committer timestamp: committer_date is
  # "<epoch> <+-tzoffset>", so the first field is seconds since the epoch.
  OLD_CALLBACK='
import os
cutoff = int(os.environ["CUTOFF_EPOCH"])
if int(commit.committer_date.split()[0]) >= cutoff:
    commit.skip()
'
  TODAY_CALLBACK='
import os
cutoff = int(os.environ["CUTOFF_EPOCH"])
if int(commit.committer_date.split()[0]) < cutoff:
    commit.skip()
'
  clone_working_mirror old "$OLD_MIRROR"
  run_filter old "$OLD_MIRROR" --commit-callback "$OLD_CALLBACK"
  clone_working_mirror today "$TODAY_MIRROR"
  run_filter today "$TODAY_MIRROR" --commit-callback "$TODAY_CALLBACK"
else
  PROJECT_REF="refs/heads/$PROJECT_BRANCH"
  git --git-dir="$SOURCE_MIRROR" rev-parse --verify -q "$PROJECT_REF^{commit}" >/dev/null \
    || die "Branch '$PROJECT_BRANCH' does not exist in $SOURCE_REPO_URL."
  [ "$(git --git-dir="$SOURCE_MIRROR" cat-file -t "$PROJECT_REF:$PROJECT_DIR" 2>/dev/null)" = "tree" ] \
    || die "Branch '$PROJECT_BRANCH' has no '$PROJECT_DIR/' folder."
  PROJECT_TREE="$(git --git-dir="$SOURCE_MIRROR" rev-parse "$PROJECT_REF:$PROJECT_DIR")"

  # old: every branch/tag except the project branch, project folder removed.
  clone_working_mirror old "$OLD_MIRROR"
  git --git-dir="$OLD_MIRROR" update-ref -d "$PROJECT_REF"
  run_filter old "$OLD_MIRROR" --invert-paths --path "$PROJECT_DIR/"

  # today: only the project branch, project folder becomes the root.
  clone_working_mirror today "$TODAY_MIRROR"
  git --git-dir="$TODAY_MIRROR" for-each-ref --format='%(refname)' \
    | while IFS= read -r ref; do
        [ "$ref" = "$PROJECT_REF" ] || printf 'delete %s\n' "$ref"
      done \
    | git --git-dir="$TODAY_MIRROR" update-ref --stdin
  if [ "$PROJECT_BRANCH" != "$TODAY_BRANCH_NAME" ]; then
    git --git-dir="$TODAY_MIRROR" branch -m "$PROJECT_BRANCH" "$TODAY_BRANCH_NAME"
  fi
  git --git-dir="$TODAY_MIRROR" symbolic-ref HEAD "refs/heads/$TODAY_BRANCH_NAME"
  run_filter today "$TODAY_MIRROR" --subdirectory-filter "$PROJECT_DIR"
fi

# --- Validation ----------------------------------------------------------------

summarize_mirror() {
  local name="$1" dir="$2" allow_empty="$3"
  local refs commits

  refs="$(git --git-dir="$dir" for-each-ref | wc -l | tr -d ' ')"
  commits="$(git --git-dir="$dir" rev-list --all --count)"

  printf '\n----- %s (%s) -----\n' "$name" "$dir"
  printf 'Refs   : %s\n' "$refs"
  printf 'Commits: %s\n' "$commits"
  if [ "$refs" -gt 0 ]; then
    printf 'Refs sample:\n'
    git --git-dir="$dir" for-each-ref --count=10 --format='  %(refname)'
  fi
  if [ "$commits" -gt 0 ]; then
    printf 'Log sample (newest first):\n'
    git --git-dir="$dir" log --all -n 5 --date=iso --format='  %h %cd %s'
  fi

  if [ "$commits" -eq 0 ]; then
    if [ "$allow_empty" = "yes" ]; then
      warn "'$name' is empty (allowed by configuration)."
    else
      die "'$name' has no commits. If this is expected, set ALLOW_EMPTY_$(printf '%s' "$name" | tr '[:lower:]' '[:upper:]')=yes."
    fi
    return 1
  fi
  return 0
}

check_cutoff_side() {
  local name="$1" dir="$2" side="$3"
  local times bad

  times="$(git --git-dir="$dir" log --all --format='%ct')"
  if [ "$side" = "before" ]; then
    bad="$(printf '%s\n' "$times" | awk -v c="$CUTOFF_EPOCH" '$1 >= c' | wc -l | tr -d ' ')"
  else
    bad="$(printf '%s\n' "$times" | awk -v c="$CUTOFF_EPOCH" '$1 < c' | wc -l | tr -d ' ')"
  fi
  [ "$bad" -eq 0 ] || die "'$name' contains $bad commit(s) on the wrong side of the cutoff."
  printf 'Cutoff check: OK (all commits %s cutoff)\n' \
    "$([ "$side" = before ] && echo 'strictly before' || echo 'on/after')"
}

check_old_project() {
  local hits ref same=0 changed=0

  git --git-dir="$OLD_MIRROR" rev-parse --verify -q "$PROJECT_REF" >/dev/null \
    && die "'old' still contains branch '$PROJECT_BRANCH'."

  hits="$(git --git-dir="$OLD_MIRROR" log --all --format= --name-only -- "$PROJECT_DIR" | grep -c . || true)"
  [ "$hits" -eq 0 ] || die "'old' still contains $hits change(s) under '$PROJECT_DIR/'."
  printf 'Project folder check: OK (no %s/ anywhere in history)\n' "$PROJECT_DIR"

  # Branches that never contained the project folder must be unchanged.
  while IFS= read -r ref; do
    if git --git-dir="$SOURCE_MIRROR" cat-file -e "$ref:$PROJECT_DIR" 2>/dev/null; then
      changed=$((changed + 1))
      continue
    fi
    [ "$(git --git-dir="$OLD_MIRROR" rev-parse "$ref^{tree}")" = "$(git --git-dir="$SOURCE_MIRROR" rev-parse "$ref^{tree}")" ] \
      || die "'old' $ref has a different file tree from the source."
    same=$((same + 1))
  done < <(git --git-dir="$OLD_MIRROR" for-each-ref --format='%(refname)' refs/heads/ refs/tags/)
  printf 'Tree check: OK (%s ref(s) identical to source; %s ref(s) had %s/ removed)\n' "$same" "$changed" "$PROJECT_DIR"
}

check_today_project() {
  local refs build_log

  refs="$(git --git-dir="$TODAY_MIRROR" for-each-ref --format='%(refname)')"
  [ "$refs" = "refs/heads/$TODAY_BRANCH_NAME" ] \
    || die "'today' must contain only refs/heads/$TODAY_BRANCH_NAME, found: $(printf '%s' "$refs" | tr '\n' ' ')"

  [ "$(git --git-dir="$TODAY_MIRROR" rev-parse "refs/heads/$TODAY_BRANCH_NAME^{tree}")" = "$PROJECT_TREE" ] \
    || die "'today' $TODAY_BRANCH_NAME does not exactly match '$PROJECT_BRANCH:$PROJECT_DIR/'."
  printf 'Tree check: OK (%s is identical to %s:%s/)\n' "$TODAY_BRANCH_NAME" "$PROJECT_BRANCH" "$PROJECT_DIR"

  if [ "$BUILD_CHECK" != "yes" ]; then
    warn "BUILD_CHECK=$BUILD_CHECK: skipping the standalone build check for 'today'."
    return 0
  fi

  git --git-dir="$TODAY_MIRROR" cat-file -e "refs/heads/$TODAY_BRANCH_NAME:package.json" 2>/dev/null \
    || die "'today' has no package.json at its root; cannot run the build check."

  log "Build check: exporting '$TODAY_BRANCH_NAME' to $BUILD_DIR and running npm ci + npm run build..."
  mkdir -p "$BUILD_DIR"
  git --git-dir="$TODAY_MIRROR" archive "refs/heads/$TODAY_BRANCH_NAME" | tar -x -C "$BUILD_DIR"
  build_log="$WORKDIR/today-build-check.log"
  if ! (cd "$BUILD_DIR" && npm ci --no-audit --no-fund && npm run build) >"$build_log" 2>&1; then
    tail -n 30 "$build_log" >&2 || true
    die "'today' does not build on its own. Full log: $build_log"
  fi
  printf 'Build check: OK (npm ci + npm run build succeeded; log: %s)\n' "$build_log"
}

if [ "$MODE" = "cutoff" ]; then
  if summarize_mirror old "$OLD_MIRROR" "$ALLOW_EMPTY_OLD"; then
    check_cutoff_side old "$OLD_MIRROR" before
  fi
  if summarize_mirror today "$TODAY_MIRROR" "$ALLOW_EMPTY_TODAY"; then
    check_cutoff_side today "$TODAY_MIRROR" after
  fi

  printf '\n'
  warn "Skipping commits does NOT guarantee full snapshot continuity."
  warn "The first commits in 'today' only carry the changes they recorded; files"
  warn "introduced or changed before the cutoff may be missing or differ from the"
  warn "source repository's tree. Inspect the trees before publishing, e.g.:"
  warn "  git --git-dir='$TODAY_MIRROR' ls-tree -r --name-only HEAD"
  warn "  git --git-dir='$SOURCE_MIRROR' ls-tree -r --name-only HEAD"
else
  if summarize_mirror old "$OLD_MIRROR" "$ALLOW_EMPTY_OLD"; then
    check_old_project
  fi
  if summarize_mirror today "$TODAY_MIRROR" "$ALLOW_EMPTY_TODAY"; then
    check_today_project
  fi

  # Changes made only on the project branch but outside the project folder
  # end up in neither output; list them so nothing is lost silently.
  dropped="$(git --git-dir="$SOURCE_MIRROR" for-each-ref --format='%(refname) %(objectname)' refs/heads/ refs/tags/ \
    | awk -v r="$PROJECT_REF" '$1 != r { print "^" $2 }' \
    | git --git-dir="$SOURCE_MIRROR" log --format= --name-only --stdin "$PROJECT_REF" \
    | grep -v -e "^$PROJECT_DIR/" -e '^$' | sort -u || true)"
  if [ -n "$dropped" ]; then
    printf '\n'
    warn "These files were changed only on '$PROJECT_BRANCH' outside '$PROJECT_DIR/'."
    warn "Those changes are in NEITHER output; copy them over by hand if needed:"
    printf '%s\n' "$dropped" | sed 's/^/WARNING:   /' >&2
  fi
fi

# --- Push (opt-in only) --------------------------------------------------------

if [ "$PUSH" != "true" ]; then
  if [ "$MODE" = "cutoff" ]; then
    push_cmd="$(printf '%q ' "$0" --mode cutoff \
      --source "$SOURCE_REPO_URL" --cutoff "$CUTOFF_DISPLAY" \
      --old-target "$OLD_TARGET_URL" --today-target "$TODAY_TARGET_URL")"
    push_note="(same source, targets and cutoff instant, with the cutoff pinned to an explicit UTC offset)"
  else
    push_cmd="$(printf '%q ' "$0" --mode project \
      --source "$SOURCE_REPO_URL" --project-branch "$PROJECT_BRANCH" \
      --project-dir "$PROJECT_DIR" --today-branch "$TODAY_BRANCH_NAME" \
      --old-target "$OLD_TARGET_URL" --today-target "$TODAY_TARGET_URL")"
    push_note="(same source, branch, folder and targets)"
  fi
  cat <<EOF

Dry run complete. Nothing was pushed.

Filtered mirrors:
  old   : $OLD_MIRROR
  today : $TODAY_MIRROR

Next steps:
  1. Inspect both mirrors (git log, git ls-tree) and confirm they look right.
  2. Back up both destination repositories (e.g. git clone --mirror <target>).
  3. Re-run with pushing explicitly enabled $push_note:
       PUSH=true CONFIRM_FORCE_MIRROR_PUSH=yes $push_cmd
EOF
  exit 0
fi

cat >&2 <<EOF

!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
!! DANGER: about to run 'git push --mirror --force' to:
!!   $OLD_TARGET_URL
!!   $TODAY_TARGET_URL
!! This OVERWRITES every matching ref and DELETES every destination ref
!! (branches, tags, ...) that does not exist in the local filtered mirror.
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

EOF

if [ "$SKIP_TARGET_BACKUP" != "yes" ]; then
  BACKUP_DIR="$WORKDIR/backups"
  mkdir -p "$BACKUP_DIR"
  log "Backing up destination repositories to $BACKUP_DIR..."
  git clone --mirror -- "$OLD_TARGET_URL" "$BACKUP_DIR/old-target.git" \
    || die "Backup of $OLD_TARGET_URL failed. Nothing was pushed. (Set SKIP_TARGET_BACKUP=yes to bypass.)"
  git clone --mirror -- "$TODAY_TARGET_URL" "$BACKUP_DIR/today-target.git" \
    || die "Backup of $TODAY_TARGET_URL failed. Nothing was pushed. (Set SKIP_TARGET_BACKUP=yes to bypass.)"
else
  warn "SKIP_TARGET_BACKUP=yes: destination repositories were NOT backed up."
fi

push_mirror() {
  local name="$1" dir="$2" url="$3"
  if [ "$(git --git-dir="$dir" for-each-ref | wc -l | tr -d ' ')" -eq 0 ]; then
    warn "'$name' has no refs; NOT pushing it (a mirror push would delete every ref on $url)."
    return 0
  fi
  git --git-dir="$dir" remote remove split-target >/dev/null 2>&1 || true
  git --git-dir="$dir" remote add split-target "$url"
  log "Force mirror pushing '$name' to $url..."
  git --git-dir="$dir" push --mirror --force split-target
}

push_mirror old "$OLD_MIRROR" "$OLD_TARGET_URL"
push_mirror today "$TODAY_MIRROR" "$TODAY_TARGET_URL"

log "Push complete."
