## Summary

<!-- 1–3 bullet points describing what this PR does and why -->

## Test Plan

<!-- How was this tested? Describe manual steps or E2E checks. -->

---

## Compliance Checklist

- [ ] No `style={{ }}` inline styles — use Tailwind classes or PWA CSS variable classes
- [ ] No types manually defined in `src/entities/*/api.ts` — use `src/generated/`
- [ ] Imports respect FSD layer order: `app → pages → widgets → features → entities → shared`
- [ ] Price visibility respects the `showPrices × businessModel` rule (Constitution v2.0 Principle VII)
- [ ] If `businessModel=ASSOCIATED` and `showPrices=true`: mandatory disclaimer is rendered
- [ ] `src/generated/` was NOT edited manually
- [ ] `pnpm typecheck` passes locally
- [ ] `pnpm build` passes locally — verify `dist/sw.js` exists (service worker must be present)
- [ ] `.env.example` updated if new `VITE_*` vars were added
