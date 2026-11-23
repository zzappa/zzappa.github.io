# zzappa's blog

A Hugo blog using the [Typo theme](https://github.com/tomfran/typo).
The theme is included in `themes/typo`, pinned to upstream commit
`1b3db752a3989a9f43a2da52db4f183110d30295`.

## Local preview

Install [Hugo](https://gohugo.io/installation/) (version 0.150.1 is used in CI),
then run:

```sh
hugo server
```

Open the local URL printed by Hugo. Articles live in `content/posts`, pages in
`content`, and images in `static/assets/img`. Build the production site with
`hugo --minify`.

## Writing a post

Copy `content/posts/YYYY-MM-DD-template.md` to a new file in `content/posts`
named `YYYY-MM-DD-post-slug.md`. Update its title, date, description, URL, and
body. The explicit URL keeps the date out of the address; give each post a
unique URL. Leave `draft: true` while writing and run `hugo server -D` to
preview drafts. Change it to `draft: false` when the post is ready to publish.
The template itself stays unpublished.

## GitHub Pages

The included workflow builds and deploys the site on pushes to `gh-pages`. In the
repository's Settings → Pages, set the build and deployment source to **GitHub
Actions** before publishing. The workflow does not run until changes are pushed.
