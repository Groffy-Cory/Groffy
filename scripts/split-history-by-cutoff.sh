#!/usr/bin/env bash
#
# split-history-by-cutoff.sh
#
# Prepare two filtered mirror repositories from a source repository's history,
# split around a cutoff date:
#
#   old   -> commits whose committer date is strictly BEFORE the cutoff
#   today -> commits whose committer date is ON or AFTER the cutoff
#
# SAFETY: by default this script only clones, filters and validates local
# mirrors. It NEVER pushes unless PUSH=true AND CONFIRM_FORCE_MIRROR_PUSH=yes
# are both set. Pushing uses `git push --mirror --force`, which overwrites and
# DELETES refs on the destination. See docs/split-history-by-cutoff.md.
#
# Configuration (environment variables, or the equivalent flags below):
#   SOURCE_REPO_URL            --source URL        (default: https://github.com/Groffy-Cory/Groffy.git)
#   CUTOFF                     --cutoff "DATETIME" (default: "2026-10-23 00:00:00", local timezone)
#   OLD_TARGET_URL             --old-target URL    (default: https://github.com/Groffy-Cory/realoldfriend.git)
#   TODAY_TARGET_URL           --today-target URL  (default: https://github.com/Groffy-Cory/thedoneye.git)
#   WORKDIR                    --workdir PATH      (default: new directory from mktemp -d)
#   PUSH                       --push              (default: false)
#   CONFIRM_FORCE_MIRROR_PUSH  (must be exactly "yes" for PUSH=true to proceed)
#   ALLOW_EMPTY_OLD            (set to "yes" if an empty "old" result is expected)
#   ALLOW_EMPTY_TODAY          (set to "yes" if an empty "today" result is expected)
#   SKIP_TARGET_BACKUP         (set to "yes" to skip backing up targets before pushing)

set -euo pipefail

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

log() { printf '==> %s\n' "$*"; }
warn() { printf 'WARNING: %s\n' "$*" >&2; }
die() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }

usage() {
  sed -n '2,/^set -euo pipefail/p' "$0" | sed -e '$d' -e 's/^# \{0,1\}//'
}

while [ $# -gt 0 ]; do
  case "$1" in
    --source) [ $# -ge 2 ] || die "--source requires a value"; SOURCE_REPO_URL="$2"; shift 2 ;;
    --cutoff) [ $# -ge 2 ] || die "--cutoff requires a value"; CUTOFF="$2"; shift 2 ;;
    --old-target) [ $# -ge 2 ] || die "--old-target requires a value"; OLD_TARGET_URL="$2"; shift 2 ;;
    --today-target) [ $# -ge 2 ] || die "--today-target requires a value"; TODAY_TARGET_URL="$2"; shift 2 ;;
    --workdir) [ $# -ge 2 ] || die "--workdir requires a value"; WORKDIR="$2"; shift 2 ;;
    --push) PUSH=true; shift ;;
    -h|--help) usage; exit 0 ;;
    *) die "Unknown argument: $1 (use --help for usage)" ;;
  esac
done

case "$PUSH" in
  true|false) ;;
  *) die "PUSH must be 'true' or 'false' (got '$PUSH')" ;;
esac

# Fail fast on push gates before doing any work.
if [ "$PUSH" = "true" ]; then
  if [ "${CI:-}" = "true" ]; then
    die "Refusing to push from a CI environment (CI=true). Run the push manually."
  fi
  if [ "$CONFIRM_FORCE_MIRROR_PUSH" != "yes" ]; then
    die "PUSH=true requires CONFIRM_FORCE_MIRROR_PUSH=yes. Nothing was pushed."
  fi
fi

# --- Prerequisites ----------------------------------------------------------

command -v git >/dev/null 2>&1 || die "git is not installed."
command -v python3 >/dev/null 2>&1 || die "python3 is required to compute the cutoff timestamp."
git filter-repo --version >/dev/null 2>&1 \
  || die "git filter-repo is not installed. See https://github.com/newren/git-filter-repo (e.g. 'pip install git-filter-repo')."

# --- Cutoff (local timezone) -------------------------------------------------

# A naive datetime (no UTC offset) is interpreted in the machine's local
# timezone (honours the TZ environment variable). If CUTOFF includes an explicit
# offset (e.g. "2026-10-23 00:00:00+00:00"), that offset is used instead.
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

for d in "$SOURCE_MIRROR" "$OLD_MIRROR" "$TODAY_MIRROR"; do
  [ ! -e "$d" ] || die "$d already exists. Use an empty WORKDIR so previous results are never reused or clobbered."
done

log "Source repository : $SOURCE_REPO_URL"
log "Cutoff            : '$CUTOFF' -> $CUTOFF_DISPLAY (epoch $CUTOFF_EPOCH)"
log "Old target        : $OLD_TARGET_URL"
log "Today target      : $TODAY_TARGET_URL"
log "Work directory    : $WORKDIR"
log "Push enabled      : $PUSH"

# --- Clone and filter ----------------------------------------------------------

log "Cloning source as a mirror..."
git clone --mirror -- "$SOURCE_REPO_URL" "$SOURCE_MIRROR"

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

prepare_mirror() {
  local name="$1" dest="$2" callback="$3"

  log "Creating working mirror '$name' at $dest..."
  git clone --mirror --no-local -- "$SOURCE_MIRROR" "$dest"

  # GitHub mirror clones include read-only refs/pull/* refs which cannot be
  # pushed back to GitHub; drop them from the working copy.
  git --git-dir="$dest" for-each-ref --format='delete %(refname)' refs/pull/ \
    | git --git-dir="$dest" update-ref --stdin

  log "Filtering '$name' history..."
  (cd "$dest" && GIT_DIR=. git filter-repo --force --commit-callback "$callback")

  # filter-repo usually removes 'origin' already; never fail if it is gone.
  git --git-dir="$dest" remote remove origin >/dev/null 2>&1 || true
}

prepare_mirror old "$OLD_MIRROR" "$OLD_CALLBACK"
prepare_mirror today "$TODAY_MIRROR" "$TODAY_CALLBACK"

# --- Validation ----------------------------------------------------------------

validate_mirror() {
  local name="$1" dir="$2" allow_empty="$3" mode="$4"
  local refs commits times bad

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
    return 0
  fi

  times="$(git --git-dir="$dir" log --all --format='%ct')"
  if [ "$mode" = "before" ]; then
    bad="$(printf '%s\n' "$times" | awk -v c="$CUTOFF_EPOCH" '$1 >= c' | wc -l | tr -d ' ')"
  else
    bad="$(printf '%s\n' "$times" | awk -v c="$CUTOFF_EPOCH" '$1 < c' | wc -l | tr -d ' ')"
  fi
  [ "$bad" -eq 0 ] || die "'$name' contains $bad commit(s) on the wrong side of the cutoff."
  printf 'Cutoff check: OK (all commits %s cutoff)\n' \
    "$([ "$mode" = before ] && echo 'strictly before' || echo 'on/after')"
}

validate_mirror old "$OLD_MIRROR" "$ALLOW_EMPTY_OLD" before
validate_mirror today "$TODAY_MIRROR" "$ALLOW_EMPTY_TODAY" after

printf '\n'
warn "Skipping commits does NOT guarantee full snapshot continuity."
warn "The first commits in 'today' only carry the changes they recorded; files"
warn "introduced or changed before the cutoff may be missing or differ from the"
warn "source repository's tree. Inspect the trees before publishing, e.g.:"
warn "  git --git-dir='$TODAY_MIRROR' ls-tree -r --name-only HEAD"
warn "  git --git-dir='$SOURCE_MIRROR' ls-tree -r --name-only HEAD"

# --- Push (opt-in only) --------------------------------------------------------

if [ "$PUSH" != "true" ]; then
  cat <<EOF

Dry run complete. Nothing was pushed.

Filtered mirrors:
  old   : $OLD_MIRROR
  today : $TODAY_MIRROR

Next steps:
  1. Inspect both mirrors (git log, git ls-tree) and confirm they look right.
  2. Back up both destination repositories (e.g. git clone --mirror <target>).
  3. Re-run with pushing explicitly enabled (same source, targets and cutoff
     instant, with the cutoff pinned to an explicit UTC offset):
       PUSH=true CONFIRM_FORCE_MIRROR_PUSH=yes $(printf '%q ' "$0" \
         --source "$SOURCE_REPO_URL" --cutoff "$CUTOFF_DISPLAY" \
         --old-target "$OLD_TARGET_URL" --today-target "$TODAY_TARGET_URL")
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
