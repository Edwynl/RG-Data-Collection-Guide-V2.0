# White-label deployments

Each customer edition lives in its own subdirectory so it can be deployed as an independent Vercel project while the Retragreen edition remains at the repository root.

- `steira-air/` — Steira Air branded Data Collection Guide

## Recommended GitHub and Vercel layout

| Vercel project | Root Directory | Suggested project name |
| --- | --- | --- |
| Retragreen | repository root (`.`) | `retragreen-data-collection` |
| Steira Air | `brands/steira-air` | `steira-air-data-collection` |

Connect both Vercel projects to the same GitHub repository, then select the matching **Root Directory** for each project. Both editions are static sites and do not require a build command.

If the Retragreen domain must never serve the white-label files under a nested URL, exclude `brands/` from that root deployment with a root-level `.vercelignore`, or move the Retragreen edition into its own project directory before production deployment.
