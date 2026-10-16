<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Interior Design prototype keeps all data in a browser-local store (src/lib/store.ts, localStorage + cross-tab sync) with seeded demo data; app routes use `ssr: false`. Why: frontend-only prototype deployable as a static web app; swap for a real backend when going to production.
