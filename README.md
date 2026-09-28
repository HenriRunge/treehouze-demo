# Treehouze Web Demo — SwiftUI Fidelity Port

This is a browser-native port of the current Treehouze v31 deterministic investor demo. The SwiftUI project remains the source of truth for the visual hierarchy and scripted flows; this web version mirrors its layout, WhatsApp styling, spacing, message widths, interactive reply groups, contact cards, location cards, composer, inbox, and home screen as closely as possible with HTML/CSS/JavaScript.

## Run locally

No dependencies or build step are required.

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Update the existing GitHub Pages demo

Replace the files in your local `treehouze-demo` repository with the contents of this folder, then run:

```bash
git add .
git commit -m "Match web demo to SwiftUI v31"
git push
```

The existing GitHub Pages workflow will redeploy automatically.

## Demo kickoff prompts

1. Tennis: `Hey, I want to play tennis tonight between 6 and 9. Can you find someone for me?`
2. New to Berlin: `Hey Treehouze, I just moved to Berlin. Do I know anyone here?`
3. Night out: `Some friends are visiting me tonight and I want to show them Berlin nightlife. Can you plan the night for us?`
4. Talent: `I'm looking for someone for a project. Can you help me find the right person in my network?`
5. Nora intro: `Nora Klein — https://www.linkedin.com/in/nora-klein — I'd like to meet her to learn about her experience building consumer communities and get her perspective on Treehouze. Do I know anyone who could help with an intro?`
6. Sponsors: `I want to host a founder event in Berlin. Do I know any potential sponsors, or anyone in my network who could introduce me to one?`

Talent brief:
`I'm looking for a freelance growth marketer in Berlin with experience in consumer apps and community building. Ideally they've worked with early-stage startups, can help with acquisition and retention, and are open to a short-term project that could turn into a longer collaboration.`

## Notes

- Fully local and deterministic: no backend, auth, APIs, or real WhatsApp connection.
- Contact/social links are demo data.
- On desktop, `Restart demo` remains outside the simulated phone. It is hidden on mobile so it does not alter the phone UI.
- The browser implementation is not literally SwiftUI, but its visual specification is taken directly from the v31 Swift source.
