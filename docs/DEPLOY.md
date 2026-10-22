# Deploying Sahaya Setu (about 20 minutes, free tiers)

You need a GitHub account (you have one), plus free accounts on **Render** (backend) and **Vercel** (website).

## 1. Deploy the backend on Render
1. Go to render.com and sign in with GitHub.
2. Click **New +** then **Blueprint** and pick the `Sahaya_setu` repo. Render reads `render.yaml`.
   (Or choose **New + > Web Service**, set Root Directory `backend`, Build `pip install -r requirements.txt`,
   Start `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.)
3. Leave `ALLOWED_ORIGINS` empty for now. Click **Apply** and wait for the deploy.
4. Open `https://<your-service>.onrender.com/health`. You should see `{"ok":true}`. Note this URL.

## 2. Deploy the website on Vercel
1. Go to vercel.com and sign in with GitHub, click **Add New > Project**, import `Sahaya_setu`.
2. Set **Root Directory** to `frontend`.
3. Under **Environment Variables** add `VITE_API_URL` = your Render URL (no trailing slash).
4. Click **Deploy**. Note your site URL, for example `https://sahaya-setu.vercel.app`.

## 3. Connect them
1. In Render, open your service, then **Environment**, and set `ALLOWED_ORIGINS` to your Vercel URL (no trailing slash).
   To allow several, separate with commas.
2. Save. Render redeploys. Open your Vercel site and run a check.

## 4. Optional: "describe yourself in your own words"
In Render > Environment add `ANTHROPIC_API_KEY` (from console.anthropic.com). Without it the site works normally and
shows a polite "not set up" message for that one feature. Never put the key in GitHub or the frontend.

## Things to know
- **Free Render servers sleep** after inactivity, so the first request can take about 30 to 60 seconds. Open the site a
  few minutes before any demo.
- **Feedback is stored in a file on the server**, which is erased when Render redeploys or restarts on the free tier.
  Copy the numbers from `/feedback/summary` into your notes before redeploying. For permanent storage, move it to a
  free Neon Postgres database later.
- Voice input needs HTTPS (Vercel provides it) and works best in Chrome on Android or desktop.
- Every `git push` to `main` redeploys both services automatically.
