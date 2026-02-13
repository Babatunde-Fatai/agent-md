# agent-md for Complete Beginners (No Coding Experience Needed)

This guide assumes you are new to coding.

Goal: make your Next.js website also publish simple Markdown files at URLs like:

- `https://your-site.com/agent/index.json`
- `https://your-site.com/agent/docs/some-page.md`

## What this tool does (simple version)

Think of `agent-md` like a translator:

1. It reads your website pages.
2. It turns those pages into plain Markdown files.
3. It puts those files in your app's `public/agent` folder.
4. When you deploy your site, those files are live on the internet.

You do not add this to runtime code or middleware. You run it during build/deploy.

## Before you start

You need these installed on your computer:

1. Node.js 20+
2. Git
3. A Next.js project

If your Next app already runs with `npm run dev`, you are ready.

## Step-by-step from this repository to deployment

### Step 1: Open terminal in your Next.js app

Go to your Next.js project folder in terminal.

Example:

```bash
cd /path/to/your-next-app
```

### Step 2: Install agent-md

```bash
npm install --save-dev agent-md
```

### Step 3: Install browser runtime used by agent-md

This is needed so JavaScript-heavy pages can render correctly.

```bash
npx playwright install chromium
```

### Step 4: Add an npm script in your `package.json`

Open your app's `package.json` and edit scripts.

If your current build is:

```json
{
  "scripts": {
    "build": "next build"
  }
}
```

Change it to:

```json
{
  "scripts": {
    "build": "next build && agent-md build --sitemap https://your-domain.com/sitemap.xml --out public/agent --renderer playwright --concurrency 3 --timeout 30000 --extra-wait-ms 1000"
  }
}
```

Replace `https://your-domain.com` with your real domain.

If you do not have a sitemap yet, use a text file approach:

1. Create `urls.txt` in your project root.
2. Put one full URL per line.
3. Use this build script instead:

```json
{
  "scripts": {
    "build": "next build && agent-md build --urls urls.txt --out public/agent"
  }
}
```

### Step 5: Run the build locally once

```bash
npm run build
```

After build finishes, check these files exist:

1. `public/agent/index.json`
2. `public/agent/...some-files....md`

### Step 6: Deploy your Next.js app normally

Deploy with your normal flow (Vercel, Netlify, self-host, etc.).

Because Next serves everything in `public/`, your new files are now online.

### Step 7: Verify in browser

After deploy, open:

1. `https://your-domain.com/agent/index.json`
2. One Markdown URL listed inside that JSON

If both open, setup is complete.

## Do I add this inside page code?

No.

You do not import it in React components.
You do not add it to `middleware.ts`.
You do not run it per user request.

It only runs at build/deploy time.

## Common mistakes and fixes

1. Error: cannot fetch sitemap
Cause: wrong sitemap URL.
Fix: open sitemap URL in browser and confirm it exists.

2. No markdown files generated
Cause: sitemap empty or blocked pages.
Fix: test with `--urls urls.txt` first.

3. Pages miss content
Cause: page needs extra time for JavaScript.
Fix: increase `--extra-wait-ms` to `1500` or more.

## Copy-paste GitHub Action option (no local terminal each time)

You can use this repo's workflow template:

- `.github/workflows/generate-agent-markdown.yml`

It can generate files on every push to `main`.

## You are done

Once this is set, every deploy can regenerate fresh agent Markdown automatically.
