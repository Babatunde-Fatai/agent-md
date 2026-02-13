# Releasing agent-md to npm

This project publishes to npm when a Git tag like `v0.1.1` is pushed.

## One-time setup

1. Create an npm account and create an automation token.
2. In GitHub repo settings, add secret `NPM_TOKEN` with that token.
3. Confirm package name availability:

```bash
npm view agent-md
```

If it exists and is not yours, rename `name` in `package.json`.

## Release checklist

1. Ensure working tree is clean.
2. Run release verification:

```bash
npm run release:check
```

3. Bump version and create tag:

```bash
npm run release:tag:patch
# or: npm run release:tag:minor
# or: npm run release:tag:major
```

4. Push commit and tags:

```bash
git push origin main --follow-tags
```

5. GitHub Actions workflow `.github/workflows/publish-npm.yml` publishes package.

## Notes

- Workflow runs `npm run prepublishOnly` before publish.
- Publish command uses `npm publish --provenance --access public`.
- If you prefer npm Trusted Publishing (OIDC), configure npm package trust for this GitHub repository and then the same workflow can publish without using `NPM_TOKEN`.
