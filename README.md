# Democracy — real-time party game

## Run locally

With Node installed, run `node server.js` from this folder and visit `http://localhost:3000`.

Players on the same Wi-Fi can join using your computer's local network address instead of `localhost` (for example, `http://192.168.x.x:3000`). The room code is shown inside the game.

## Get a real shareable link (Render)

1. Make a free GitHub account, if needed.
2. Create a new empty GitHub repository called `democracy-party-game`.
3. Upload **every file in this folder** into that repository, keeping the files together at the repository's top level. In particular, include `server.js`, `package.json`, `index.html`, `app.js`, and `style.css`.
4. Go to Render, sign in with GitHub, and select **New → Blueprint**.
5. Select the `democracy-party-game` repository. Render detects the included `render.yaml`; choose **Apply**.
6. Wait for the service status to become **Live**. Render shows a public URL such as `https://democracy-party-game.onrender.com`.
7. Open that URL, create a room, and use **Copy invite**. That copied link works for anyone with an internet connection.

The public URL is the address to share—not `localhost` and not the GitHub page.

### Important for this first version

Free hosted services may pause after inactivity. If a friend opens the URL after it has been unused, the first page load can take a short time. Rooms persist while the deployed server is running, and reset after the server restarts.

For a durable production game, replace the in-memory `rooms` map in `server.js` with a shared database/realtime service (such as Redis or Supabase). This first build is intentionally self-contained: rooms persist while the deployed server is running, and reset when it restarts.
