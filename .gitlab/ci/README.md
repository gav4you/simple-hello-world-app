# GitLab CI Kits (Breslov Academy)

These modular CI files are meant to be **included** from the canonical root `.gitlab-ci.yml`
without overwriting it.

## Minimal include block (copy/paste)
Add to your root `.gitlab-ci.yml` (append to an existing `include:` list if you already have one):

```yml
include:
  - local: .gitlab/ci/kit.rules.yml
  - local: .gitlab/ci/kit.ci-node-windows.yml
  - local: .gitlab/ci/kit.security-basics.yml
  # Optional (requires Linux runner):
  # - local: .gitlab/ci/kit.releases.yml
```

## Notes
- Windows runner must have **Node.js** installed and the runner shell should be **PowerShell / pwsh**.
- `zip_stable` uses `scripts/release.ps1` and produces `artifacts/breslov-academy-<tag>.zip`.
