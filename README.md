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

```
npx wrangler deploy
```

## Terminal easter eggs

- `ls`, `cd`, `cat`, `pwd`, Tab completion. `cd` scrolls the page.
- `.secrets` needs a password: the word after "veni, vidi".
