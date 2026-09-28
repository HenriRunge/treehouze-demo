# Deploy Treehouze Demo with GitHub Pages

This folder is ready to publish as a static GitHub Pages site.

## Option A — GitHub web UI

1. Create a new repository, e.g. `treehouze-demo`.
2. Upload the contents of this folder to the repository root and commit to `main`.
3. Open **Settings → Pages** in the repository.
4. Under **Build and deployment**, choose **GitHub Actions** as the source.
5. Open the **Actions** tab. The included `Deploy Treehouze demo to GitHub Pages` workflow will deploy the site.
6. GitHub will show the public Pages URL after deployment.

Typical URL:
`https://YOUR-GITHUB-USERNAME.github.io/treehouze-demo/`

## Option B — Git from Terminal

```bash
git init
git add .
git commit -m "Publish Treehouze web demo"
git branch -M main
git remote add origin https://github.com/YOUR-GITHUB-USERNAME/treehouze-demo.git
git push -u origin main
```

Then choose **Settings → Pages → GitHub Actions** once.

## Custom domain later

Once the demo works, a domain such as `demo.treehouze.com` can point at GitHub Pages from the repository's Pages settings. Do not add a `CNAME` file until the actual domain is configured.

## Local test

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.
