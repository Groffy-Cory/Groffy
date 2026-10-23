# Splitting the repository into `realoldfriend` and `thedoneye`

`scripts/split-history-by-cutoff.sh` prepares two filtered mirror repositories
(`old` and `today`) from this repository. It has two modes.

**Project mode (`MODE=project`)** splits by project folder. This is the mode
for putting ROF and the Family Portal in one repo and The DON Eye in another:

| Output  | Contents                                                                                           | Default target                                     |
| ------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `old`   | Every branch and tag **except** `cursor/don-eye-command-center`, with `don-eye/` removed from all history. ROF, `family-portal/` and `supabase/` stay together. | `https://github.com/Groffy-Cory/realoldfriend.git` |
| `today` | Only `cursor/don-eye-command-center`, keeping just `don-eye/` moved to the repo root, published as `main`. | `https://github.com/Groffy-Cory/thedoneye.git`     |

**Cutoff mode (`MODE=cutoff`, the default)** splits by date:

| Output  | Keeps commits whose **committer date** is…  | Default target                                       |
| ------- | ------------------------------------------- | ---------------------------------------------------- |
| `old`   | strictly **before** the cutoff              | `https://github.com/Groffy-Cory/realoldfriend.git`   |
| `today` | **on or after** the cutoff                  | `https://github.com/Groffy-Cory/thedoneye.git`       |

In both modes the script is a **dry run** by default: it clones, filters and
validates local mirrors, then stops. It never pushes unless you opt in explicitly.

## Requirements

- `git`, `python3`, and [`git filter-repo`](https://github.com/newren/git-filter-repo)
  (e.g. `pip install git-filter-repo`).
- Project mode also needs `npm` and network access (npm registry and Google
  Fonts, which The DON Eye loads at build time) for the build check.

## Configuration

| Variable / flag                              | Default                                            |
| -------------------------------------------- | -------------------------------------------------- |
| `MODE` / `--mode`                            | `cutoff` (or `project`)                            |
| `SOURCE_REPO_URL` / `--source`               | `https://github.com/Groffy-Cory/Groffy.git`        |
| `CUTOFF` / `--cutoff` (cutoff mode)          | `2026-10-23 00:00:00` (local timezone)             |
| `PROJECT_BRANCH` / `--project-branch` (project mode) | `cursor/don-eye-command-center`            |
| `PROJECT_DIR` / `--project-dir` (project mode) | `don-eye`                                        |
| `TODAY_BRANCH_NAME` / `--today-branch` (project mode) | `main`                                    |
| `BUILD_CHECK` (project mode)                 | `yes` — must be `yes` to push                      |
| `OLD_TARGET_URL` / `--old-target`            | `https://github.com/Groffy-Cory/realoldfriend.git` |
| `TODAY_TARGET_URL` / `--today-target`        | `https://github.com/Groffy-Cory/thedoneye.git`     |
| `WORKDIR` / `--workdir`                      | a new `mktemp -d` directory                        |
| `PUSH` / `--push`                            | `false`                                            |
| `CONFIRM_FORCE_MIRROR_PUSH`                  | unset — must be `yes` for a push to happen         |
| `ALLOW_EMPTY_OLD`, `ALLOW_EMPTY_TODAY`       | `no` — set to `yes` if an empty result is expected |
| `SKIP_TARGET_BACKUP`                         | `no` — targets are mirror-cloned before pushing    |

## Usage: project mode

Dry run (no pushes). Prints refs, commit counts and a log sample for both
outputs, runs the project checks below, and builds `today` on its own:

```bash
MODE=project ./scripts/split-history-by-cutoff.sh
```

Quick dry run without the build check (cannot be used to push):

```bash
MODE=project BUILD_CHECK=no WORKDIR=/tmp/split-run ./scripts/split-history-by-cutoff.sh
```

Push mode (only after reviewing a dry run and backing up both targets). Prefer
copying the exact command printed at the end of the dry run:

```bash
PUSH=true CONFIRM_FORCE_MIRROR_PUSH=yes MODE=project \
  ./scripts/split-history-by-cutoff.sh
```

Before any push, project mode checks that:

- `old` has no `cursor/don-eye-command-center` branch and no `don-eye/` path
  anywhere in its history, and every branch that never had `don-eye/` has
  exactly the same files as in the source.
- `today` has only the `main` branch, and its files exactly match
  `don-eye/` on `cursor/don-eye-command-center`.
- `today` builds on its own (`npm ci` + `npm run build` in an exported copy).
  The log is saved as `$WORKDIR/today-build-check.log`.

It also lists files changed on `cursor/don-eye-command-center` **outside**
`don-eye/` (currently the root `README.md` section about The DON Eye). Those
changes are in neither output; copy them over by hand if you want them.

## Usage: cutoff mode

Dry run (no pushes; prints refs, commit counts and a log sample for both outputs):

```bash
CUTOFF="2026-10-23 00:00:00" ./scripts/split-history-by-cutoff.sh
```

Dry run in a specific timezone and work directory:

```bash
TZ=America/New_York CUTOFF="2026-10-23 00:00:00" WORKDIR=/tmp/split-run \
  ./scripts/split-history-by-cutoff.sh
```

Push mode (only after reviewing a dry run and backing up both targets). Prefer
copying the exact command printed at the end of the dry run, which pins the
cutoff to an explicit UTC offset so a different `TZ` cannot change the split:

```bash
PUSH=true CONFIRM_FORCE_MIRROR_PUSH=yes CUTOFF="2026-10-23 00:00:00-04:00" \
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
- **Cutoff mode: skipping commits is not a snapshot-preserving split.** Skipped commits take
  their recorded changes with them, so the earliest commits in `today` may be
  missing files that were added or changed before the cutoff. Compare trees
  (`git --git-dir=<mirror> ls-tree -r --name-only HEAD`) before publishing.
- **Validation before any push.** The script fails if an output is empty
  (unless allowed), contains a commit on the wrong side of the cutoff (cutoff
  mode), or fails the project checks above (project mode). Even
  when allowed, an empty output is never mirror-pushed (that would delete every
  ref on its target).
- The push gates are checked before any cloning, and the dry run prints the
  exact push command for the same source and targets (and, in cutoff mode, the
  same cutoff instant pinned to an explicit UTC offset so a different `TZ`
  cannot change the split).
- In project mode `PUSH=true` also requires `BUILD_CHECK=yes`.
- GitHub `refs/pull/*` refs are removed from the working mirrors because GitHub
  rejects pushes to them. `git filter-repo` removes the `origin` remote; the
  script tolerates that and pushes only to an explicitly added remote.
