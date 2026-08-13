import { createContext, useContext, useEffect, useMemo, useState } from 'react';

// These are the languages Girlie currently supports. Keep UI copy here so the
// museum, interview and private archive always change together.
export const localeOptions = [['en', 'EN'], ['zh', '中文']];

const copy = {
  en: {
    language: 'Language', collections: 'Museum', museumCollections: 'Museum collections', livingMuseum: 'A living friendship museum', halls: 'Menu',
    friendshipArchive: 'Museum Stories', languageGallery: 'Language Gallery', starObservatory: 'Friendship Atlas', listeningRoom: 'Listening Room',
    privateHouse: 'Private Girlie', privateGirlie: 'Private Girlie', friendshipArchives: 'My Private Girlie',
    tellStory: 'AI Friendship Interview', tellFriendship: 'Tell Your Friendship', beginStory: 'Start Your Interview',
    close: 'Close ×', glowing: 'glowing', resting: 'resting', privateForTwo: '🔒 Private to you and your friend.',
    landingEyebrow: 'GIRLIE · A DIGITAL FRIENDSHIP MUSEUM', landingTitle: 'A museum for the friendships we never want to forget.',
    landingBody: 'Discover friendship stories from girls around the world — and create a private digital home for your own.',
    exploreMuseum: 'Explore the Museum', exploreMuseumDesc: 'Discover real friendship stories from girls around the world.',
    tellFriendshipDesc: 'Talk to our AI Friendship Interviewer and turn your memories into your own Private Girlie.',
    exploreGirls: 'Explore the Museum', archiveEyebrow: 'PUBLIC GIRLIE · FRIENDSHIP MUSEUM', archiveTitle: 'Every friendship leaves a trace.', archiveBody: 'Walk slowly. Each flower holds a city, a word, and a friendship story.', beginVisiting: 'Begin visiting',
    scrollArchive: 'Public Girlie · Museum Stories', scrollPrompt: 'Scroll gently to meet the girls, one story at a time',
    endingEyebrow: 'A LIVING MUSEUM', endingTitle: 'More friendship stories are always finding their way here.', endingBody: 'Every girl has a story; every friendship has a memory that deserves a place to stay.',
    howWorksTitle: 'Your friendship, remembered.', howExploreNumber: '01 — Explore', howExploreTitle: 'Friendship Museum', howExploreBody: 'Discover stories, memories and friendships from girls around the world.',
    howTalkNumber: '02 — Talk', howTalkTitle: 'AI Friendship Interview', howTalkBody: 'Tell your story through a gentle conversation. You do not need to know how to write it.',
    howRememberNumber: '03 — Remember', howRememberTitle: 'Private Girlie', howRememberBody: 'Your conversation becomes a private digital home filled with your memories.',
    publicGirlie: 'Public Girlie', publicMuseumTitle: 'The Museum', publicMuseumBody: 'Stories shared with the world.', privateGirlieLabel: 'Private Girlie', privateHomeTitle: 'Your Friendship Home', privateHomeBody: 'Your own memories, created from your interview.',
    storyBridge: 'Museum → AI Interview → Private Girlie', storyJourney: 'Girlie friendship journey', promisePreserved: 'A promise preserved in the archive',

    buildSecretHouse: 'Create My Private Girlie', interviewCollection: 'YOUR STORY · PRIVATE', friendshipInterview: 'AI Friendship Interview', saveClose: 'Save & close',
    archivistConversation: 'This is where your story begins', interviewTitle: 'Tell us the story of your friendship.',
    interviewBody: 'A gentle conversation that helps you remember the little things — how you met, what you survived together, and what makes her your person.',
    interviewReassurance: 'No forms. No perfect answers. Just tell your story.', archivist: 'The interviewer', you: 'You', memoriesGathered: '{count} {unit} gathered', memory: 'memory', memories: 'memories',
    readyToRemember: 'Your friendship is taking shape →', writeAnything: 'Write as much or as little as you want…', leaveUnwritten: 'Leave this part unwritten', continue: 'Continue', skip: 'I’d rather leave that part unwritten.',
    firstQuestion: 'Let’s start somewhere easy. When did you first meet her?', localArchiveReady: 'I can already feel the shape of this friendship. When you’re ready, we can turn these memories into your Private Girlie — nothing is public unless you decide it should be.',
    finishInterview: 'Finish this interview', continueInterview: 'Keep talking', takingShapeTitle: 'Your friendship is taking shape. 🌷',
    takingShapeBody: 'Your conversation revealed memories, milestones, little details and the people who matter most.', takingShapeBridge: 'AI Interview → your story → Private Girlie',
    createPrivateGirlie: 'Create My Private Girlie →', createPrivateBody: 'Turn this conversation into a private digital home you can return to.', creatingPrivate: 'Creating your Private Girlie…',

    authPrivate: 'Private Girlie', authTitle: 'A private digital home for your friendship.', authBody: 'Create an account to keep your interview, memories and archive safely linked to you. Nothing is added to the public museum.',
    yourName: 'Your name', email: 'Email', password: 'Password (6+ characters)', createPrivate: 'Create my Private Girlie', enterPrivate: 'Enter my Private Girlie', accountExists: 'I already have an account', createInstead: 'Create an account instead', checkEmail: 'Check your email to confirm your Private Girlie.', welcomeBack: 'Welcome back to your Private Girlie.',
    archiveBack: '← My Private Girlie', privateArchive: 'Private Friendship Archive', locked: 'private', sharedPermission: 'shared by permission', doneEditing: 'Done editing', editArchive: 'Edit archive', addMemory: '＋ Add a memory',
    myArchive: 'My Private Girlie', forFriend: 'For {name}', takingShape: 'A friendship still taking shape', privateDefault: 'private to you and your friend', ourStory: 'Our Story', timeline: 'Friendship Timeline', undated: 'Undated', firstDate: 'The first date can arrive whenever you remember it.',
    importantPlaces: 'Important Places', placesEmpty: 'A school gate, a bakery, a city far away — add them through a memory.', friendshipObjects: 'Friendship Objects', objectsEmpty: 'When an object appears in your story, it will find a place here.', object: 'Object',
    friendshipBloom: 'Friendship Bloom', bloomEmpty: 'The themes of your friendship will bloom here.', herSentence: 'A sentence to keep', sentenceWaiting: 'The strongest sentence is still on its way.', timeCapsule: 'Time Capsule', openIn: 'Open in {value}', capsuleBody: 'Keep a letter, a voice note, or one small hope for later.',
    privateArchives: 'My Private Girlie', shelfTitle: 'A shelf for the friendships that are yours.', signOut: 'Sign out', signInForever: 'Sign in to keep forever', roomProtected: 'Private to you and your friend. Your archive is never shown in the public museum.', accountBefore: 'Start your interview to begin building a private home for this friendship.',
    privateWelcomeTitle: 'Welcome to your private friendship home.', privateWelcomeBody: 'Your AI interview becomes the foundation of this space. Nothing here is added to the public museum.',
    myFriendships: 'My friendships', archives: 'archives', archive: 'archive', savedPrivately: 'saved privately', accountRequired: 'saved in this browser', friendshipProgress: 'A friendship in progress',
    firstShelf: 'Your Private Girlie is waiting for its first memory. 🌷', shelfBody: 'Start your AI Friendship Interview to begin building it.', startInterview: 'Start Your Interview', enterPrivateGirlie: 'Enter My Private Girlie',
    originalWords: 'your original words', aiAssisted: 'AI-assisted organization', versionsPreserved: 'Story v{version} · {count} {label} preserved', version: 'version', versions: 'versions',
  },
  zh: {
    language: '语言', collections: '博物馆', museumCollections: '博物馆馆藏', livingMuseum: '会生长的友谊博物馆', halls: '菜单',
    friendshipArchive: '博物馆故事', languageGallery: '语言展厅', starObservatory: '友谊星图', listeningRoom: '聆听室',
    privateHouse: '私密 Girlie', privateGirlie: '私密 Girlie', friendshipArchives: '我的私密 Girlie',
    tellStory: 'AI 友谊访谈', tellFriendship: '讲讲你们的友谊', beginStory: '开始访谈',
    close: '关闭 ×', glowing: '正在发光', resting: '正在沉睡', privateForTwo: '🔒 只属于你和朋友的私密空间。',
    landingEyebrow: 'GIRLIE · 数字友谊博物馆', landingTitle: '一座珍藏不愿忘记的友谊的博物馆。',
    landingBody: '发现来自世界各地女孩的友谊故事，也为你自己的故事创建一个私密的数字家园。',
    exploreMuseum: '探索博物馆', exploreMuseumDesc: '发现来自世界各地女孩真实的友谊故事。',
    tellFriendshipDesc: '与 AI 友谊访谈者聊聊，让你们的回忆成为自己的私密 Girlie。',
    exploreGirls: '探索博物馆', archiveEyebrow: '公共 GIRLIE · 友谊博物馆', archiveTitle: '每一段友谊都会留下痕迹。', archiveBody: '慢慢走。每朵花都保存着一座城市、一个词语与一段友谊故事。', beginVisiting: '开始参观',
    scrollArchive: '公共 Girlie · 博物馆故事', scrollPrompt: '轻轻向后滚动，依次遇见女孩们的故事',
    endingEyebrow: '会生长的博物馆', endingTitle: '更多友谊故事正不断来到这里。', endingBody: '每个女孩都有故事，每段友谊都有值得留下的记忆。',
    howWorksTitle: '让友谊被好好记住。', howExploreNumber: '01 — 探索', howExploreTitle: '友谊博物馆', howExploreBody: '发现来自世界各地女孩的故事、回忆与友谊。',
    howTalkNumber: '02 — 聊聊', howTalkTitle: 'AI 友谊访谈', howTalkBody: '在温柔的对话里讲述你们的故事。你不必先知道该怎样写。',
    howRememberNumber: '03 — 珍藏', howRememberTitle: '私密 Girlie', howRememberBody: '对话会成为一座装满你们回忆的私密数字家园。',
    publicGirlie: '公共 Girlie', publicMuseumTitle: '友谊博物馆', publicMuseumBody: '与世界分享的故事。', privateGirlieLabel: '私密 Girlie', privateHomeTitle: '你们的友谊之家', privateHomeBody: '从访谈中生长出的专属回忆。',
    storyBridge: '博物馆 → AI 访谈 → 私密 Girlie', storyJourney: 'Girlie 友谊旅程', promisePreserved: '档案中珍藏的约定',

    buildSecretHouse: '创建我的私密 Girlie', interviewCollection: '你的故事 · 私密', friendshipInterview: 'AI 友谊访谈', saveClose: '保存并关闭',
    archivistConversation: '故事从这里开始', interviewTitle: '讲讲你们友谊的故事。',
    interviewBody: '一段温柔的对话，帮你记起那些小事——如何相遇、如何一起度过难关，以及为什么她是你最重要的人。',
    interviewReassurance: '没有表格，也没有标准答案。只要讲讲你们的故事。', archivist: '访谈者', you: '你', memoriesGathered: '已收集 {count} 个{unit}', memory: '记忆', memories: '记忆',
    readyToRemember: '你们的友谊正在成形 →', writeAnything: '想写多少都可以…', leaveUnwritten: '这部分暂时不写', continue: '继续', skip: '这部分我想暂时不写。',
    firstQuestion: '我们从一个简单的地方开始吧。你们第一次见面是什么时候？', localArchiveReady: '我已经能感到这段友谊的轮廓了。准备好时，我们可以把这些记忆整理成你的私密 Girlie——除非你决定分享，否则没有任何内容会公开。',
    finishInterview: '完成这次访谈', continueInterview: '继续聊聊', takingShapeTitle: '你们的友谊正在成形。🌷',
    takingShapeBody: '这段对话带来了回忆、重要时刻、微小细节，以及那些最重要的人。', takingShapeBridge: 'AI 访谈 → 你们的故事 → 私密 Girlie',
    createPrivateGirlie: '创建我的私密 Girlie →', createPrivateBody: '把这段对话变成一座可以随时回来的私密数字家园。', creatingPrivate: '正在创建你的私密 Girlie…',

    authPrivate: '私密 Girlie', authTitle: '一座只属于你们友谊的数字家园。', authBody: '创建账号，安全保存访谈、回忆与档案。它们不会进入公共友谊博物馆。',
    yourName: '你的名字', email: '邮箱', password: '密码（至少 6 位）', createPrivate: '创建我的私密 Girlie', enterPrivate: '进入我的私密 Girlie', accountExists: '我已经有账号', createInstead: '改为创建账号', checkEmail: '请查看邮箱，确认你的私密 Girlie。', welcomeBack: '欢迎回到你的私密 Girlie。',
    archiveBack: '← 我的私密 Girlie', privateArchive: '私密友谊档案', locked: '私密', sharedPermission: '经允许分享', doneEditing: '完成编辑', editArchive: '编辑档案', addMemory: '＋ 添加一段记忆',
    myArchive: '我的私密 Girlie', forFriend: '献给 {name}', takingShape: '一段仍在成形的友谊', privateDefault: '只属于你和朋友', ourStory: '我们的故事', timeline: '友谊时间线', undated: '未标日期', firstDate: '第一天会在你想起时来到。',
    importantPlaces: '重要地点', placesEmpty: '学校门口、面包店或遥远的城市——在一段记忆里把它们加进来。', friendshipObjects: '友谊物件', objectsEmpty: '当一个物件出现在故事中，它会在这里找到位置。', object: '物件',
    friendshipBloom: '友谊之花', bloomEmpty: '属于你们友谊的主题会在这里绽放。', herSentence: '想留住的一句话', sentenceWaiting: '最有力量的一句话还在路上。', timeCapsule: '时间胶囊', openIn: '{value} 后开启', capsuleBody: '留下一封信、一段语音，或一个给未来的小小愿望。',
    privateArchives: '我的私密 Girlie', shelfTitle: '一层只属于你自己的友谊书架。', signOut: '退出登录', signInForever: '登录以永久保存', roomProtected: '只属于你和朋友。你的档案永远不会出现在公共博物馆中。', accountBefore: '开始访谈，为这段友谊建造一座私密家园。',
    privateWelcomeTitle: '欢迎来到你们的私密友谊之家。', privateWelcomeBody: 'AI 友谊访谈会成为这个空间的基础。这里的内容不会进入公共博物馆。',
    myFriendships: '我的友谊', archives: '份档案', archive: '份档案', savedPrivately: '已私密保存', accountRequired: '已保存在此浏览器', friendshipProgress: '一段正在展开的友谊',
    firstShelf: '你的私密 Girlie 正等待第一段记忆。🌷', shelfBody: '开始 AI 友谊访谈，让它慢慢成形。', startInterview: '开始访谈', enterPrivateGirlie: '进入我的私密 Girlie',
    originalWords: '你的原话', aiAssisted: 'AI 协助整理', versionsPreserved: '故事第 {version} 版 · 已保留 {count} 个{label}', version: '版本', versions: '版本',
  },
};

const LocaleContext = createContext(null);
const key = 'girlie_locale';
const format = (value, variables = {}) => String(value).replace(/\{(\w+)\}/g, (_, name) => variables[name] ?? '');

export function LocaleProvider({ children }) {
  const [locale, setLocaleState] = useState(() => { try { return localStorage.getItem(key) === 'zh' ? 'zh' : 'en'; } catch { return 'en'; } });
  const setLocale = (next) => { if (!copy[next]) return; setLocaleState(next); try { localStorage.setItem(key, next); } catch {} };
  useEffect(() => { document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en'; }, [locale]);
  const value = useMemo(() => ({ locale, setLocale, t: (name, variables) => format(copy[locale][name] ?? copy.en[name] ?? name, variables) }), [locale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() { const value = useContext(LocaleContext); if (!value) throw new Error('LocaleProvider is required'); return value; }
export function LocaleMenu({ className = '' }) {
  const { locale, setLocale, t } = useLocale();
  return <label className={`locale-menu ${className}`}><span className="sr-only">{t('language')}</span><select aria-label={t('language')} value={locale} onChange={(event) => setLocale(event.target.value)}>{localeOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>;
}
