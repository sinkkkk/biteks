# biteks

Source for [biteks.ee](https://biteks.ee). It's a single-page site on Cloudflare Workers.

```
public/
  index.html          the site (HTML, CSS, JS and the WebGL bit field, all in one file)
  404.html            not-found page
  0.ico, 1.ico        favicons
  history/2025/       the previous biteks.ee, untouched (opened from the terminal's .secrets)
wrangler.jsonc        Cloudflare config
```

## Run locally

Any static server pointed at `public/` works:

```
python3 -m http.server 4321 --directory public
```

The contact form posts to `/api/contact`, which only exists on Cloudflare. Locally the form shows its fallback message (email siim@biteks.ee).

## Deploy

Always go through the npm scripts, never plain `npx wrangler`. `~/.zshrc` exports the work
account's `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID`, and the machine-wide wrangler login
is the work account too. The scripts remove both and keep a separate personal login in
`.wrangler-home/` (gitignored).

```
npm install
npm run login     # once, log in as the personal account
npm run whoami    # should show the personal account
npm run deploy
```

## Terminal easter eggs

- `ls`, `cd`, `cat`, `pwd`, Tab completion. `cd` scrolls the page.
- `.secrets` needs a password: the word after "veni, vidi".
