# Splitting repository history by a cutoff date

`scripts/split-history-by-cutoff.sh` prepares two filtered mirror repositories
from this repository's history:

| Output  | Keeps commits whose **committer date** is…  | Default target                                       |
| ------- | ------------------------------------------- | ---------------------------------------------------- |
| `old`   | strictly **before** the cutoff              | `https://github.com/Groffy-Cory/realoldfriend.git`   |
| `today` | **on or after** the cutoff                  | `https://github.com/Groffy-Cory/thedoneye.git`       |

By default the script is a **dry run**: it clones, filters and validates local
mirrors, then stops. It never pushes unless you opt in explicitly.

## Requirements

- `git`, `python3`, and [`git filter-repo`](https://github.com/newren/git-filter-repo)
  (e.g. `pip install git-filter-repo`).

## Configuration

| Variable / flag                              | Default                                            |
| -------------------------------------------- | -------------------------------------------------- |
| `SOURCE_REPO_URL` / `--source`               | `https://github.com/Groffy-Cory/Groffy.git`        |
| `CUTOFF` / `--cutoff`                        | `2026-10-23 00:00:00` (local timezone)             |
| `OLD_TARGET_URL` / `--old-target`            | `https://github.com/Groffy-Cory/realoldfriend.git` |
| `TODAY_TARGET_URL` / `--today-target`        | `https://github.com/Groffy-Cory/thedoneye.git`     |
| `WORKDIR` / `--workdir`                      | a new `mktemp -d` directory                        |
| `PUSH` / `--push`                            | `false`                                            |
| `CONFIRM_FORCE_MIRROR_PUSH`                  | unset — must be `yes` for a push to happen         |
| `ALLOW_EMPTY_OLD`, `ALLOW_EMPTY_TODAY`       | `no` — set to `yes` if an empty result is expected |
| `SKIP_TARGET_BACKUP`                         | `no` — targets are mirror-cloned before pushing    |

## Usage

Dry run (no pushes; prints refs, commit counts and a log sample for both outputs):

```bash
CUTOFF="2026-10-23 00:00:00" ./scripts/split-history-by-cutoff.sh
```

Dry run in a specific timezone and work directory:

```bash
TZ=America/New_York CUTOFF="2026-10-23 00:00:00" WORKDIR=/tmp/split-run \
  ./scripts/split-history-by-cutoff.sh
```

Push mode (only after reviewing a dry run and backing up both targets):

```bash
PUSH=true CONFIRM_FORCE_MIRROR_PUSH=yes CUTOFF="2026-10-23 00:00:00" \
  ./scripts/split-history-by-cutoff.sh
```

## Cutoff semantics (local time)

`CUTOFF` is parsed with Python's `datetime.fromisoformat()`. A value without a
UTC offset (e.g. `2026-10-23 00:00:00`) is interpreted in the **local timezone
of the machine running the script** (honouring `TZ`). Running the same command
with `TZ=UTC` and `TZ=America/New_York` therefore produces different splits. To
pin an exact instant, include an offset, e.g. `CUTOFF="2026-10-23 00:00:00+00:00"`.

The cutoff is converted to a Unix epoch once and passed to the
`git filter-repo --commit-callback` via the `CUTOFF_EPOCH` environment variable.
Each callback compares it with `int(commit.committer_date.split()[0])`, the
committer timestamp. A commit exactly at the cutoff goes to `today`.

## Safety notes

- **Dry run by default.** `PUSH=true` alone is not enough; the script also
  requires `CONFIRM_FORCE_MIRROR_PUSH=yes`, and it refuses to push when `CI=true`.
- **`git push --mirror --force` is destructive.** It overwrites every matching
  ref on the destination and **deletes every destination ref** (branches, tags,
  …) that does not exist in the local filtered mirror.
- **Back up targets first.** In push mode the script mirror-clones each target
  into `$WORKDIR/backups/` before pushing and aborts if a backup fails. Keep your
  own independent backup as well.
- **Skipping commits is not a snapshot-preserving split.** Skipped commits take
  their recorded changes with them, so the earliest commits in `today` may be
  missing files that were added or changed before the cutoff. Compare trees
  (`git --git-dir=<mirror> ls-tree -r --name-only HEAD`) before publishing.
- **Validation before any push.** The script fails if an output is empty
  (unless allowed) or contains a commit on the wrong side of the cutoff. Even
  when allowed, an empty output is never mirror-pushed (that would delete every
  ref on its target).
- The push gates are checked before any cloning, and the dry run prints the
  exact push command for the same source, targets and cutoff instant (pinned
  to an explicit UTC offset so a different `TZ` cannot change the split).
- GitHub `refs/pull/*` refs are removed from the working mirrors because GitHub
  rejects pushes to them. `git filter-repo` removes the `origin` remote; the
  script tolerates that and pushes only to an explicitly added remote.
