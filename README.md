# CoolVu Window Film Visualizer

This app lets customers upload a house photo, choose a CoolVu film option, and request a photorealistic window film visualization through OpenAI image edits.

## Stack

- Frontend: single-file React UI (`index.html`)
- Backend: Node + Express (`server.js`)
- OpenAI image endpoint: `POST /v1/images/edits`
- Model: `gpt-image-2`

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment file and set your server-side key:

```bash
cp .env.example .env
```

3. Start the app:

```bash
npm start
```

4. Open <http://localhost:4173>

## Security notes

- API keys are server-side only (`OPENAI_API_KEY` in `.env`).
- Do **not** place OpenAI keys in browser code.
- If any key was ever shared in chat, rotate/revoke it in the OpenAI dashboard immediately.

## Next step

- Replace the `Book a Consultation` link in `index.html` with your real booking URL.


## Railway deploy checklist

If Railway shows **"Script start.sh not found"** and **"Railpack could not determine how to build"**, Railway is not detecting the project as Node in your selected root directory.

This repo now includes a `Dockerfile` and sets `builder = "DOCKERFILE"` in `railway.toml`, so Railway can deploy without Railpack language detection.

1. In Railway service settings, make sure **Root Directory** is `/` (repo root).
2. Confirm these variables are set in Railway:
   - `OPENAI_API_KEY`
   - (optional) `PORT` (Railway usually injects this automatically)
3. Ensure the service is **Exposed** (Public Networking enabled) so you get a public URL.
4. Trigger a redeploy after adding/changing variables.
5. If it still fails at **Build image**, open deployment logs and check the first Railpack error line.

The app healthcheck path is `/api/films`, which should return JSON when the service is up.


## If Railway says repo has only `.gitkeep`

That error means Railway is connected to a different/empty GitHub repository (or branch), not this app code.

1. In Railway service settings, verify the linked GitHub repo is `coolvu-visualizer`.
2. Verify the branch is the one with commits (`work` or your default branch with app files).
3. In GitHub, confirm the repo root contains `package.json`, `server.js`, `index.html`, and/or `Dockerfile`.
4. If your local changes are not on GitHub yet, push them first, then redeploy.

Quick local check before pushing:

```bash
git remote -v
git branch --show-current
git log --oneline -5
```

If `git remote -v` shows nothing, set your GitHub remote and push:

```bash
git remote add origin https://github.com/<your-username>/coolvu-visualizer.git
git push -u origin work
```

Then in Railway, reconnect that exact repository/branch and redeploy.
