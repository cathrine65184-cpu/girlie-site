// Presentation metadata only: portraits, order, quotes and stories come from
// the existing museum datasets, never from a parallel collection.
export const depthAtmospheres = {
  emma: ['#eed8dd', '#cd9da8'], anna: ['#e1dbea', '#aaa0c3'],
  elise: ['#f0e8d9', '#cabc9f'], mei: ['#dce6e2', '#8fafa9'],
  yuki: ['#f0ddd4', '#cfaca0'], grace: ['#e2d6e1', '#b09cad'],
  sofia: ['#f0d9d1', '#d8a596'], diya: ['#eee2cb', '#cbb17f'],
  lily: ['#e8d7dc', '#b891a1'], mia: ['#dbe5e9', '#99b7c5'],
  soo: ['#eee1e6', '#c7abbc'],
};

export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
export const galleryStep = (height) => Math.max(1, height * .85);
export function mixColor(from, to, amount) {
  const rgb = (hex) => hex.match(/[a-f\d]{2}/gi).map((channel) => parseInt(channel, 16));
  return `rgb(${rgb(from).map((value, index) => Math.round(value + (rgb(to)[index] - value) * amount)).join(', ')})`;
}

export function portraitPose(index, position, velocity, reducedMotion) {
  const distance = Math.abs(index - position);
  if (reducedMotion) return { transform: 'translate(-50%, -50%)', opacity: Math.round(position) === index ? 1 : 0 };
  const spread = Math.min(distance, 1.8);
  const side = index % 2 ? 1 : -1;
  const x = side * spread * 470;
  const y = ((index % 3) - 1) * spread * 95 - velocity * 9;
  const z = -distance * 760 + Math.sin(Math.min(distance, 1) * Math.PI) * 90;
  return {
    transform: `translate(-50%, -50%) translate3d(${x}px, ${y}px, ${z}px) rotateX(${velocity * .9}deg) rotateY(${side * Math.min(distance, 1) * -4}deg)`,
    opacity: distance > 3 ? 0 : clamp(1 - distance * .27, 0, 1),
  };
}
