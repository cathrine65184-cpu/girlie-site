const publicAsset = (path) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;

// These are web-ready copies of the supplied GLBs. The source files remain untouched
// in Downloads; each entry is a physical exhibit rather than a procedural icon.
export const tripoFlowerAssets = {
  emma: { url: publicAsset('models/flowers/emma-lily-of-the-valley.glb'), scale: 2.15, lift: 0, hitY: 1.08, labelY: 1.68, radius: 1.05 },
  anna: { url: publicAsset('models/flowers/anna-hydrangea.glb'), scale: 2.05, lift: 0, hitY: 1.03, labelY: 1.62, radius: 1.14 },
  elise: { url: publicAsset('models/flowers/elise-white-clematis.glb'), scale: 1.82, lift: .91, hitY: .91, labelY: 1.76, radius: 1.12 },
  mei: { url: publicAsset('models/flowers/mei-daisy.glb'), scale: 1.78, lift: .89, hitY: .89, labelY: 1.69, radius: 1.05 },
  yuki: { url: publicAsset('models/flowers/yuki-lavender.glb'), scale: 2.2, lift: 0, hitY: 1.1, labelY: 1.72, radius: .94 },
  grace: { url: publicAsset('models/flowers/grace-iris.glb'), scale: 2.1, lift: 0, hitY: 1.05, labelY: 1.68, radius: 1.06 },
  sofia: { url: publicAsset('models/flowers/sofia-lotus.glb'), scale: 1.92, lift: .96, hitY: .96, labelY: 1.84, radius: 1.18 },
  diya: { url: publicAsset('models/flowers/diya-yellow-lily.glb'), scale: 2.15, lift: 1.08, hitY: 1.08, labelY: 2.0, radius: 1.05 },
  lily: { url: publicAsset('models/flowers/lily-cherry-tree.glb'), scale: 3.35, lift: 1.52, hitY: 1.52, labelY: 2.86, radius: 1.5 },
  mia: { url: publicAsset('models/flowers/mia-pink-rose.glb'), scale: 1.95, lift: .98, hitY: .98, labelY: 1.86, radius: 1.12 },
  soo: { url: publicAsset('models/flowers/soo-bonsai.glb'), scale: 2.75, lift: 1.31, hitY: 1.31, labelY: 2.52, radius: 1.38 },
};
