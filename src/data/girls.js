const publicAsset = (path) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;

export const girls = [
  { id: 'emma', n: 'Emma', c: 'China', f: '🇨🇳', age: 22, col: 'pink', e: '🌸', city: 'Shanghai', zone: 'Asia/Shanghai', latitude: 31.23, longitude: 121.47, climate: 'Humid subtropical · weather unavailable', word: '闺蜜', sound: 'guī mì', lang: 'Mandarin Chinese', dream: 'Become a designer', lesson: 'To listen before fixing.', q: 'My best friend taught me my softness was never a weakness.', img: publicAsset('avatars/Emma.jpg'), world: 'Bamboo path', position: [-4.7, -.48, 4.2] },
  { id: 'anna', n: 'Anna', c: 'Ukraine', f: '🇺🇦', age: 24, col: 'lav', e: '🌷', city: 'Kyiv', zone: 'Europe/Kyiv', latitude: 50.45, longitude: 30.52, climate: 'Continental · weather unavailable', word: 'подруга', sound: 'podruha', lang: 'Ukrainian', dream: 'Open a flower studio', lesson: 'That distance can’t dilute real love.', q: 'Some friendships are not measured in kilometers, but in how quickly you still understand each other.', img: publicAsset('avatars/anna.jpg'), world: 'Sunflower field', position: [4.55, -.4, 1.15] },
  { id: 'elise', n: 'Élise', c: 'France', f: '🇫🇷', age: 23, col: 'cream', e: '🌹', city: 'Paris', zone: 'Europe/Paris', latitude: 48.85, longitude: 2.35, climate: 'Oceanic · weather unavailable', word: 'meilleure amie', sound: 'meh-yur ah-mee', lang: 'French', dream: 'Write a children’s book', lesson: 'To say the hard thing, kindly.', q: 'Maybe the best friendships are made of ordinary days you never want to forget.', img: publicAsset('avatars/elise-web.jpg'), world: 'Paris café', position: [-4.8, -.05, -2.05] },
  { id: 'mei', n: 'Mei', c: 'Malaysia', f: '🇲🇾', age: 21, col: 'blue', e: '🌼', city: 'Kuala Lumpur', zone: 'Asia/Kuala_Lumpur', latitude: 3.14, longitude: 101.69, climate: 'Tropical rain · weather unavailable', word: 'sahabat', sound: 'sa-ha-bat', lang: 'Malay', dream: 'Study abroad', lesson: 'That asking for help is brave.', q: 'She believed in my dream before I dared to.', img: publicAsset('avatars/mei.jpg'), world: 'Tropical rain', position: [4.5, .28, -5.25] },
  { id: 'yuki', n: 'Yuki', c: 'Japan', f: '🇯🇵', age: 22, col: 'peach', e: '🌺', city: 'Tokyo', zone: 'Asia/Tokyo', latitude: 35.68, longitude: 139.65, climate: 'Humid subtropical · weather unavailable', word: '親友', sound: 'shinyū', lang: 'Japanese', dream: 'Become an illustrator', lesson: 'To celebrate small wins loudly.', q: 'Some friends do not make your life easier. They make it brighter.', img: publicAsset('avatars/yuki.jpg'), world: 'Cherry blossom garden', position: [-4.75, .59, -8.65] },
  { id: 'grace', n: 'Grace', c: 'USA', f: '🇺🇸', age: 25, col: 'pink', e: '🌷', city: 'New York City', zone: 'America/New_York', latitude: 40.71, longitude: -74, climate: 'Humid continental · weather unavailable', word: 'bestie', sound: 'bes-tee', lang: 'American English', dream: 'Start a nonprofit', lesson: 'That vulnerability is a doorway.', q: 'Being a good friend is choosing kindness when nobody is watching.', img: publicAsset('avatars/grace.jpg'), world: 'Rooftop garden', position: [4.6, .85, -11.95] },
  { id: 'sofia', n: 'Sofia', c: 'Brazil', f: '🇧🇷', age: 23, col: 'lav', e: '🌼', city: 'Rio de Janeiro', zone: 'America/Sao_Paulo', latitude: -22.91, longitude: -43.17, climate: 'Tropical savanna · weather unavailable', word: 'melhor amiga', sound: 'mel-yor ah-mee-gah', lang: 'Brazilian Portuguese', dream: 'Dance professionally', lesson: 'To forgive faster.', q: 'Some friendships do not ask you to become someone else. They remind you that you were already becoming.', img: publicAsset('avatars/sofia.jpg'), world: 'Jacaranda dusk', position: [-4.7, 1.11, -15.3] },
  { id: 'diya', n: 'Diya', c: 'India', f: '🇮🇳', age: 20, col: 'peach', e: '🪷', city: 'Delhi', zone: 'Asia/Kolkata', latitude: 28.6, longitude: 77.2, climate: 'Semi-arid · weather unavailable', word: 'सहेली', sound: 'sa-hey-lee', lang: 'Hindi', dream: 'Be a doctor', lesson: 'That presence beats advice.', q: 'Growing up does not always mean leaving people behind. Sometimes, it means learning how to stay.', img: publicAsset('avatars/diya.jpg'), world: 'Lotus water', position: [4.62, 1.34, -18.65] },
  { id: 'lily', n: 'Lily', c: 'UK', f: '🇬🇧', age: 24, col: 'blue', e: '🌸', city: 'London', zone: 'Europe/London', latitude: 51.5, longitude: -0.12, climate: 'Temperate oceanic · weather unavailable', word: 'best friend', sound: 'best frend', lang: 'British English', dream: 'Curate a gallery', lesson: 'To take up space.', q: 'Maybe home is the people who remember who you were before you became who you are.', img: publicAsset('avatars/lily.jpg'), world: 'Rainy conservatory', position: [-4.75, 2.04, -22.05] },
  { id: 'mia', n: 'Mia', c: 'Australia', f: '🇦🇺', age: 23, col: 'pink', e: '🌺', city: 'Sydney', zone: 'Australia/Sydney', latitude: -33.86, longitude: 151.2, climate: 'Humid subtropical · weather unavailable', word: 'best mate', sound: 'best mayt', lang: 'Australian English', dream: 'Sail around the world', lesson: 'That roots can travel.', q: 'Some people leave your life. Some people become part of who you are.', img: publicAsset('avatars/mia-web.jpg'), world: 'Coastal wildflowers', position: [4.45, 1.73, -25.55] },
  { id: 'soo', n: 'Soo', c: 'Korea', f: '🇰🇷', age: 22, col: 'peach', e: '🌷', city: 'Seoul', zone: 'Asia/Seoul', latitude: 37.56, longitude: 126.97, climate: 'Humid continental · weather unavailable', word: '절친', sound: 'jeol-chin', lang: 'Korean', dream: 'Debut as a stylist', lesson: 'To dress for herself first.', q: 'Sometimes the person who believes in your dream first is not you.', img: publicAsset('avatars/soo-web.jpg'), world: 'Lantern courtyard', position: [0, 1.91, -29.15] },
];

export const colorByMood = {
  pink: ['#ff9bbf', '#f9d8e6'],
  lav: ['#b99cec', '#e8ddfb'],
  cream: ['#efc36b', '#fff0d0'],
  blue: ['#8fc8e9', '#d9f0fa'],
  peach: ['#ffad82', '#ffe0bd'],
};

export function localTime(girl) {
  try {
    return new Intl.DateTimeFormat('en-GB', { timeZone: girl.zone, hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date());
  } catch {
    return '—';
  }
}

export function isAwake(girl) {
  try {
    const hour = Number(new Intl.DateTimeFormat('en-GB', { timeZone: girl.zone, hour: '2-digit', hour12: false }).format(new Date()));
    return hour >= 7 && hour < 22;
  } catch {
    return true;
  }
}
