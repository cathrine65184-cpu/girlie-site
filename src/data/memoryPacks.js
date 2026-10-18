// The owner confirmed publication rights and identifiable-person consent in chat.
// These are thematic editorial selections, not biographies of the selected archive representatives.
const photo = (id, en, zh, ratio = 4 / 3) => ({
  id: `memory-${id}`, image: `images/girlie-memories/memory-${id}-1280.webp`,
  smallImage: `images/girlie-memories/memory-${id}-640.webp`,
  alt: { en, zh }, description: { en, zh }, ratio,
  storyId: null, date: null, location: null,
  publicationStatus: 'approved', permissionStatus: 'confirmed',
});

export const memoryPacks = [
  { id: 'sleepovers', number: '01', titleKey: 'packSleep', headingKey: 'sleepHeading', introKey: 'sleepIntro', moodKey: 'sleepMood', color: '#f7e8ed', photos: [
    photo(2, 'Two friends laughing together on a bed, photographed with flash.', '两位朋友在床上一起笑，闪光灯留下了这一瞬间。'),
    photo(3, 'Two friends wearing hair rollers, reading a magazine on a bed.', '两位戴着发卷的朋友在床上一起看杂志。'),
    photo(4, 'Two friends in robes with face masks, cucumber slices and hair rollers.', '两位朋友穿着浴袍，敷着面膜和黄瓜片，头上戴着发卷。'),
    photo(20, 'A close-up selfie of two friends wearing sheet masks.', '两位敷着面膜的朋友靠在一起自拍。', 1200 / 735),
    photo(21, 'Two friends holding matching teddy bears in front of them.', '两位朋友抱着同款毛绒小熊。', 736 / 475),
  ] },
  { id: 'getting-ready', number: '02', titleKey: 'packReady', headingKey: 'readyHeading', introKey: 'readyIntro', moodKey: 'readyMood', color: '#eee8f1', photos: [
    photo(10, 'Two friends applying makeup side by side in a mirror.', '两位朋友对着镜子并肩化妆。', 1170 / 773),
    photo(6, 'A friend helping style another friend’s hair beside a mirror.', '一位朋友在镜子旁帮另一位朋友整理头发。'),
    photo(11, 'Two friends with hair rollers making playful faces for a mirror selfie.', '两位戴着发卷的朋友对着镜子做鬼脸自拍。'),
    photo(22, 'Two friends smiling at their compact camera in a mirror.', '两位朋友拿着小相机，对着镜子开心自拍。'),
  ] },
  { id: 'summer', number: '03', titleKey: 'packSummer', headingKey: 'summerHeading', introKey: 'summerIntro', moodKey: 'summerMood', color: '#f9eedf', photos: [
    photo(13, 'Two friends in sunglasses eating ice cream outdoors.', '两位戴着墨镜的朋友在户外吃冰淇淋。', 1199 / 885),
    photo(9, 'Sunlight fills a car as two friends raise their hands through the sunroof.', '阳光洒进车厢，两位朋友将手伸向天窗。', 3 / 2),
    photo(15, 'Two friends making playful poses beside water in golden sunlight.', '金色阳光下，两位朋友在水边摆出俏皮的姿势。'),
    photo(17, 'Two friends embracing beside a car in the setting sun.', '夕阳下，两位朋友在车旁拥抱。', 3 / 2),
    photo(23, 'Two friends lying beside each other on sunlit grass.', '两位朋友并排躺在洒满阳光的草地上。'),
  ] },
  { id: 'silly', number: '04', titleKey: 'packSilly', headingKey: 'sillyHeading', introKey: 'sillyIntro', moodKey: 'sillyMood', color: '#f7e2e8', photos: [
    photo(12, 'Two friends holding pink doughnuts over their eyes.', '两位朋友把粉色甜甜圈举到眼睛前。'),
    photo(7, 'Two friends dancing along to a video game in a living room.', '两位朋友在客厅跟着体感游戏跳舞。', 735 / 551),
    photo(8, 'Two friends playfully balancing together in a living room.', '两位朋友在客厅玩托举平衡游戏。', 3 / 2),
    photo(14, 'Two friends holding pink flowers in front of their faces outdoors.', '两位朋友在户外用粉色花朵挡住脸。'),
    photo(24, 'A motion-blurred photograph of two friends dancing outside at dusk.', '黄昏时两位朋友在户外跳舞，动作留下模糊的影子。', 640 / 428),
  ] },
].map((pack) => ({ ...pack, photos: pack.photos.map((item) => ({ ...item, chapter: pack.id })) }));
