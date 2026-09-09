Same-site desktop downloads (/downloads)
=========================================

Do NOT git-commit installer binaries — they are large; GitHub rejects files > 100 MB in normal git.

Stable URLs (served by nginx after `vite build` copies `public/downloads` into dist):

  /downloads/pms-lighter.deb
  /downloads/pms-lighter-setup.exe

Automatic (recommended for Coolify / Docker)
--------------------------------------------

1. Create a GitHub Release from tag `v*` (workflow builds + uploads versioned assets).

2. Set `GITHUB_TOKEN` in Coolify → frontend service → **Build arguments** (classic PAT:
   `repo` scope, or fine-grained: read access to contents + metadata for this repo).

3. On each deploy/rebuild, the frontend Dockerfile runs
   `scripts/download_release_installers.py`, which calls the GitHub API for
   `releases/latest` (or `GITHUB_RELEASE_TAG` if set), picks `pms-lighter*.deb`
   and `*setup*.exe`, and writes the stable filenames above into the image.

4. **Docker build cache:** If you publish a new desktop release but do NOT push new
   frontend code, Docker may reuse an old cached layer and keep **previous** installers.
   Fix: in Coolify → frontend → **Build arguments**, after each new GitHub Release set
   `DESKTOP_INSTALLERS_FETCH_KEY` to the new tag (e.g. `v1.0.3`) or any new
   string, OR set `GITHUB_RELEASE_TAG` to that exact tag. Then force rebuild.

5. If `GITHUB_TOKEN` is set, a failed download now **fails the image build** (no silent skip).

Local: from `frontend/`, with token in environment:

  export GITHUB_TOKEN=ghp_...
  npm run sync-desktop-release

Manual (without GitHub during web build)
----------------------------------------

1. Build installers: `npm run desktop:dist:linux` / `desktop:dist:win`
2. Linux only quick copy: `npm run sync-desktop-web` → copies .deb to public/downloads/
3. Or copy binaries into `public/downloads/` with the exact names listed at the top.
