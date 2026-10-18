# Atmospheric story gallery

Museum Stories now opens `DepthStoriesGallery`; garden entry points use the same
component. The flower garden, GLBs, girl order, portraits and authored story
datasets are unchanged. The existing `StoryOverlay` remains the only reader.

## Interaction and ownership

- Native vertical scrolling drives a damped CSS perspective scene. Each portrait
  has a true Z offset; velocity adds a small tilt/drift. Background palettes blend
  continuously. No additional WebGL renderer, dependencies or perpetual RAF loop.
- The existing canvas is paused while the opaque gallery covers it. Lenis/body
  scrolling are suspended; native scrolling inside the gallery/reader is retained.
- The gallery stays mounted behind a story. It becomes inert, stops animating,
  freezes scrolling and restores its fractional position on return, including
  when the viewport changes while reading. Continue visiting advances in the
  gallery (wrapping after Soo), without moving the garden camera.
- Previous/next buttons, arrow keys, Page Up/Down, Home/End and Escape are supported.
  Dialog focus is contained and restored. Reduced motion removes depth and tilt.
- Missing WebGL leaves the navigation and CSS gallery usable. Failed gallery
  images retain the girl's name and story entry. All real portrait paths are reused.
- New UI strings use the existing EN/中文 `useLocale()` dictionary. Quotes use the
  same English/Chinese exhibit getters as the reader, without rewriting content.

## Verification

```sh
npm ci
npm run build
node --test scripts/depth-gallery.test.mjs
npm run preview -- --host 127.0.0.1
```

With Playwright available, run the browser suite against the production preview:

```sh
GIRLIE_TEST_URL=http://127.0.0.1:4173/ node scripts/test-depth-gallery.mjs
```

If using an existing Playwright installation or Chromium executable, provide
`PLAYWRIGHT_MODULE` (absolute path to its `index.mjs`) and
`PLAYWRIGHT_CHROMIUM_EXECUTABLE`. `GIRLIE_TEST_OUTPUT` selects the screenshot folder.

The suite covers every portrait/story pairing, quotes, language switching,
fractional return position, continuation, resizing while reading, focus/keyboard,
wheel input, four layouts, actual mobile touch events, reduced motion, missing
WebGL/image fallbacks, garden resumption and existing room/interview login entry.

Private-room integration files, authentication, Supabase schema/functions and
user data are untouched. Entry checks are not a logged-in backend/upload test;
the suite does not create accounts or write any private memories.

Existing integration observation: opening the legacy room also requests the
Supabase `star_charts` endpoint, which currently returns HTTP 404. This is outside
the new gallery and is reported separately by the browser suite; no schema or
Private House changes were made to mask it. The gallery itself has no console
errors or missing local assets in the production-preview checks.

Motion reference: https://tympanus.net/Tutorials/DepthGallery/ — original Girlie
implementation using CSS perspective, not a copy of the reference's assets/code.
