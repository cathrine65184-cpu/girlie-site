const publicAsset = (path) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;

export const girls = [
  { id: 'emma', n: 'Emma', c: 'China', f: '🇨🇳', age: 22, col: 'pink', e: '🌸', city: 'Shanghai', zone: 'Asia/Shanghai', climate: 'Humid subtropical · 24°C', word: '闺蜜', sound: 'guī mì', lang: 'Mandarin Chinese', dream: 'Become a designer', lesson: 'To listen before fixing.', q: 'My best friend taught me my softness was never a weakness.', img: publicAsset('avatars/Emma.jpg'), world: 'Bamboo path', position: [-4.7, -.48, 4.2] },
  { id: 'anna', n: 'Anna', c: 'Ukraine', f: '🇺🇦', age: 24, col: 'lav', e: '🌷', city: 'Kyiv', zone: 'Europe/Kyiv', climate: 'Continental · 18°C', word: 'подруга', sound: 'podruha', lang: 'Ukrainian', dream: 'Open a flower studio', lesson: 'That distance can’t dilute real love.', q: 'We met through language exchange and never stopped translating each other’s hearts.', img: publicAsset('avatars/anna.jpg'), world: 'Sunflower field', position: [4.55, -.4, 1.15] },
  { id: 'elise', n: 'Élise', c: 'France', f: '🇫🇷', age: 23, col: 'cream', e: '🌹', city: 'Paris', zone: 'Europe/Paris', climate: 'Oceanic · 19°C', word: 'meilleure amie', sound: 'meh-yur ah-mee', lang: 'French', dream: 'Write a children’s book', lesson: 'To say the hard thing, kindly.', q: 'A true friend is the one who stays for the boring afternoons.', img: publicAsset('avatars/elise-web.jpg'), world: 'Paris café', position: [-4.8, -.05, -2.05] },
  { id: 'mei', n: 'Mei', c: 'Malaysia', f: '🇲🇾', age: 21, col: 'blue', e: '🌼', city: 'Kuala Lumpur', zone: 'Asia/Kuala_Lumpur', climate: 'Tropical rain · 29°C', word: 'sahabat', sound: 'sa-ha-bat', lang: 'Malay', dream: 'Study abroad', lesson: 'That asking for help is brave.', q: 'She believed in my dream before I dared to.', img: publicAsset('avatars/mei.jpg'), world: 'Tropical rain', position: [4.5, .28, -5.25] },
  { id: 'yuki', n: 'Yuki', c: 'Japan', f: '🇯🇵', age: 22, col: 'peach', e: '🌺', city: 'Tokyo', zone: 'Asia/Tokyo', climate: 'Humid subtropical · 26°C', word: '親友', sound: 'shinyū', lang: 'Japanese', dream: 'Become an illustrator', lesson: 'To celebrate small wins loudly.', q: 'We grew up together by growing apart and back again.', img: publicAsset('avatars/yuki.jpg'), world: 'Cherry blossom garden', position: [-4.75, .59, -8.65] },
  { id: 'grace', n: 'Grace', c: 'USA', f: '🇺🇸', age: 25, col: 'pink', e: '🌷', city: 'New York', zone: 'America/New_York', climate: 'Humid continental · 23°C', word: 'bestie', sound: 'bes-tee', lang: 'American English', dream: 'Start a nonprofit', lesson: 'That vulnerability is a doorway.', q: 'My friends are the family I assembled myself.', img: publicAsset('avatars/grace.jpg'), world: 'Rooftop garden', position: [4.6, .85, -11.95] },
  { id: 'sofia', n: 'Sofia', c: 'Brazil', f: '🇧🇷', age: 23, col: 'lav', e: '🌼', city: 'São Paulo', zone: 'America/Sao_Paulo', climate: 'Subtropical highland · 21°C', word: 'melhor amiga', sound: 'mel-yor ah-mee-gah', lang: 'Brazilian Portuguese', dream: 'Dance professionally', lesson: 'To forgive faster.', q: 'We laugh until it heals.', img: publicAsset('avatars/sofia.jpg'), world: 'Jacaranda dusk', position: [-4.7, 1.11, -15.3] },
  { id: 'diya', n: 'Diya', c: 'India', f: '🇮🇳', age: 20, col: 'peach', e: '🪷', city: 'Delhi', zone: 'Asia/Kolkata', climate: 'Semi-arid · 33°C', word: 'सहेली', sound: 'sa-hey-lee', lang: 'Hindi', dream: 'Be a doctor', lesson: 'That presence beats advice.', q: 'She sat with me in silence and that was everything.', img: publicAsset('avatars/diya.jpg'), world: 'Lotus water', position: [4.62, 1.34, -18.65] },
  { id: 'lily', n: 'Lily', c: 'UK', f: '🇬🇧', age: 24, col: 'blue', e: '🌸', city: 'London', zone: 'Europe/London', climate: 'Temperate oceanic · 17°C', word: 'best friend', sound: 'best frend', lang: 'British English', dream: 'Curate a gallery', lesson: 'To take up space.', q: 'Friendship is the art I never have to explain.', img: publicAsset('avatars/lily.jpg'), world: 'Rainy conservatory', position: [-4.75, 2.04, -22.05] },
  { id: 'mia', n: 'Mia', c: 'Australia', f: '🇦🇺', age: 23, col: 'pink', e: '🌺', city: 'Sydney', zone: 'Australia/Sydney', climate: 'Humid subtropical · 16°C', word: 'best mate', sound: 'best mayt', lang: 'Australian English', dream: 'Sail around the world', lesson: 'That roots can travel.', q: 'Some people feel like home in any time zone.', img: publicAsset('avatars/mia-web.jpg'), world: 'Coastal wildflowers', position: [4.45, 1.73, -25.55] },
  { id: 'soo', n: 'Soo', c: 'Korea', f: '🇰🇷', age: 22, col: 'peach', e: '🌷', city: 'Seoul', zone: 'Asia/Seoul', climate: 'Humid continental · 25°C', word: '절친', sound: 'jeol-chin', lang: 'Korean', dream: 'Debut as a stylist', lesson: 'To dress for herself first.', q: 'She hypes my mirror photos like they are art in a gallery.', img: publicAsset('avatars/soo-web.jpg'), world: 'Lantern courtyard', position: [0, 1.91, -29.15] },
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
