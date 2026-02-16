// キーと指の対応表
const keyFingerMap = {
    // 左手
    'q': { hand: 'left', finger: '小指' },
    'a': { hand: 'left', finger: '小指' },
    'z': { hand: 'left', finger: '小指' },
    'w': { hand: 'left', finger: '薬指' },
    's': { hand: 'left', finger: '薬指' },
    'x': { hand: 'left', finger: '薬指' },
    'e': { hand: 'left', finger: '中指' },
    'd': { hand: 'left', finger: '中指' },
    'c': { hand: 'left', finger: '中指' },
    'r': { hand: 'left', finger: '人差し指' },
    'f': { hand: 'left', finger: '人差し指' },
    'v': { hand: 'left', finger: '人差し指' },
    't': { hand: 'left', finger: '人差し指' },
    'g': { hand: 'left', finger: '人差し指' },
    'b': { hand: 'left', finger: '人差し指' },
    // 右手
    'y': { hand: 'right', finger: '人差し指' },
    'h': { hand: 'right', finger: '人差し指' },
    'n': { hand: 'right', finger: '人差し指' },
    'u': { hand: 'right', finger: '人差し指' },
    'j': { hand: 'right', finger: '人差し指' },
    'm': { hand: 'right', finger: '人差し指' },
    'i': { hand: 'right', finger: '中指' },
    'k': { hand: 'right', finger: '中指' },
    ',': { hand: 'right', finger: '中指' },
    'o': { hand: 'right', finger: '薬指' },
    'l': { hand: 'right', finger: '薬指' },
    '.': { hand: 'right', finger: '薬指' },
    'p': { hand: 'right', finger: '小指' },
    ';': { hand: 'right', finger: '小指' },
    '/': { hand: 'right', finger: '小指' },
    '!': { hand: 'left', finger: '小指' },  // 1のShift
    '?': { hand: 'right', finger: '小指' },  // /のShift
    // 数字キー
    '1': { hand: 'left', finger: '小指' },
    '2': { hand: 'left', finger: '薬指' },
    '3': { hand: 'left', finger: '中指' },
    '4': { hand: 'left', finger: '人差し指' },
    '5': { hand: 'left', finger: '人差し指' },
    '6': { hand: 'right', finger: '人差し指' },
    '7': { hand: 'right', finger: '人差し指' },
    '8': { hand: 'right', finger: '中指' },
    '9': { hand: 'right', finger: '薬指' },
    '0': { hand: 'right', finger: '小指' },
    // 記号キー
    '-': { hand: 'right', finger: '小指' },  // ー
    '^': { hand: 'right', finger: '小指' },  // ^
    '¥': { hand: 'right', finger: '小指' },  // ¥
    '@': { hand: 'right', finger: '小指' },  // @
    '[': { hand: 'right', finger: '小指' },  // [
    ';': { hand: 'right', finger: '小指' },
    ':': { hand: 'right', finger: '小指' },  // :
    ']': { hand: 'right', finger: '小指' },  // ]
    ',': { hand: 'right', finger: '中指' },
    '.': { hand: 'right', finger: '薬指' },
    '/': { hand: 'right', finger: '小指' },
    '\\': { hand: 'right', finger: '小指' }, // _ (バックスラッシュ)

    // Shift修飾が必要な文字（主要なもの）
    '~': { hand: 'right', finger: '小指', shift: 'left' },  // ^のShift
    '&': { hand: 'right', finger: '人差し指', shift: 'left' }, // 6のShift
    '!': { hand: 'left', finger: '小指', shift: 'right' },  // 1のShift
    '?': { hand: 'right', finger: '小指', shift: 'left' },  // /のShift

    ' ': { hand: 'both', finger: '親指' }
};

// ...（中略）...


// 難易度別のキー
const levelKeys = {
    easy: ['a', 's', 'd', 'f', 'j', 'k', 'l', ';'],  // ホームポジション
    medium: ['a', 's', 'd', 'f', 'j', 'k', 'l', ';', 'q', 'w', 'e', 'r', 'u', 'i', 'o', 'p', 'g', 'h'],
    hard: ['a', 's', 'd', 'f', 'j', 'k', 'l', ';', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'g', 'h', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '!', '?', '-']
};

// 難易度別の単語リスト（日本語の単語とローマ字）- 各40個
const levelWords = {
    easy: [
        { word: 'あさ', romaji: 'asa', meaning: '朝' },
        { word: 'いえ', romaji: 'ie', meaning: '家' },
        { word: 'うえ', romaji: 'ue', meaning: '上' },
        { word: 'おか', romaji: 'oka', meaning: '丘' },
        { word: 'かお', romaji: 'kao', meaning: '顔' },
        { word: 'さけ', romaji: 'sake', meaning: '酒' },
        { word: 'たこ', romaji: 'tako', meaning: 'たこ' },
        { word: 'なす', romaji: 'nasu', meaning: 'なす' },
        { word: 'はな', romaji: 'hana', meaning: '花' },
        { word: 'まど', romaji: 'mado', meaning: '窓' },
        { word: 'いぬ', romaji: 'inu', meaning: '犬' },
        { word: 'ねこ', romaji: 'neko', meaning: '猫' },
        { word: 'とり', romaji: 'tori', meaning: '鳥' },
        { word: 'さる', romaji: 'saru', meaning: '猿' },
        { word: 'うし', romaji: 'usi', meaning: '牛' },
        { word: 'うま', romaji: 'uma', meaning: '馬' },
        { word: 'ひつじ', romaji: 'hituji', meaning: '羊' },
        { word: 'とら', romaji: 'tora', meaning: '虎' },
        { word: 'くま', romaji: 'kuma', meaning: '熊' },
        { word: 'きつね', romaji: 'kitune', meaning: '狐' },
        { word: 'あめ', romaji: 'ame', meaning: '雨' },
        { word: 'ゆき', romaji: 'yuki', meaning: '雪' },
        { word: 'くも', romaji: 'kumo', meaning: '雲' },
        { word: 'ほん', romaji: 'hon', meaning: '本' },
        { word: 'かみ', romaji: 'kami', meaning: '紙' },
        { word: 'ふで', romaji: 'fude', meaning: '筆' },
        { word: 'いす', romaji: 'isu', meaning: '椅子' },
        { word: 'つくえ', romaji: 'tukue', meaning: '机' },
        { word: 'かばん', romaji: 'kaban', meaning: 'かばん' },
        { word: 'くつ', romaji: 'kutu', meaning: '靴' },
        { word: 'ぼうし', romaji: 'bousi', meaning: '帽子' },
        { word: 'てぶくろ', romaji: 'tebukuro', meaning: '手袋' },
        { word: 'みず', romaji: 'mizu', meaning: '水' },
        { word: 'ひ', romaji: 'hi', meaning: '火' },
        { word: 'つち', romaji: 'tuti', meaning: '土' },
        { word: 'いし', romaji: 'isi', meaning: '石' },
        { word: 'き', romaji: 'ki', meaning: '木' },
        { word: 'くさ', romaji: 'kusa', meaning: '草' },
        { word: 'たけ', romaji: 'take', meaning: '竹' },
        { word: 'もり', romaji: 'mori', meaning: '森' }
    ],
    medium: [
        { word: 'さくら', romaji: 'sakura', meaning: '桜' },
        { word: 'うめ', romaji: 'ume', meaning: '梅' },
        { word: 'もも', romaji: 'momo', meaning: '桃' },
        { word: 'うみ', romaji: 'umi', meaning: '海' },
        { word: 'やま', romaji: 'yama', meaning: '山' },
        { word: 'かわ', romaji: 'kawa', meaning: '川' },
        { word: 'そら', romaji: 'sora', meaning: '空' },
        { word: 'かぜ', romaji: 'kaze', meaning: '風' },
        { word: 'ひかり', romaji: 'hikari', meaning: '光' },
        { word: 'みずうみ', romaji: 'mizuumi', meaning: '湖' },
        { word: 'こころ', romaji: 'kokoro', meaning: '心' },
        { word: 'ゆめ', romaji: 'yume', meaning: '夢' },
        { word: 'ほし', romaji: 'hosi', meaning: '星' },
        { word: 'つき', romaji: 'tuki', meaning: '月' },
        { word: 'たいよう', romaji: 'taiyou', meaning: '太陽' },
        { word: 'にじ', romaji: 'niji', meaning: '虹' },
        { word: 'はる', romaji: 'haru', meaning: '春' },
        { word: 'なつ', romaji: 'natu', meaning: '夏' },
        { word: 'あき', romaji: 'aki', meaning: '秋' },
        { word: 'ふゆ', romaji: 'fuyu', meaning: '冬' },
        { word: '1がつ', romaji: '1gatu', meaning: '1月' },
        { word: '2がつ', romaji: '2gatu', meaning: '2月' },
        { word: '3がつ', romaji: '3gatu', meaning: '3月' },
        { word: '4がつ', romaji: '4gatu', meaning: '4月' },
        { word: '5がつ', romaji: '5gatu', meaning: '5月' },
        { word: '6がつ', romaji: '6gatu', meaning: '6月' },
        { word: '7がつ', romaji: '7gatu', meaning: '7月' },
        { word: '8がつ', romaji: '8gatu', meaning: '8月' },
        { word: '9がつ', romaji: '9gatu', meaning: '9月' },
        { word: '10がつ', romaji: '10gatu', meaning: '10月' },
        { word: '11がつ', romaji: '11gatu', meaning: '11月' },
        { word: '12がつ', romaji: '12gatu', meaning: '12月' },
        { word: '1ねんせい', romaji: '1nensei', meaning: '1年生' },
        { word: '3じのおやつ', romaji: '3jinooyatu', meaning: '3時のおやつ' },
        { word: '100てん', romaji: '100ten', meaning: '100点' },
        { word: '365にち', romaji: '365niti', meaning: '365日' },
        { word: '2026ねん', romaji: '2026nen', meaning: '2026年' },
        { word: '7つのうみ', romaji: '7tunoumi', meaning: '7つの海' },
        { word: 'ひこうき', romaji: 'hikouki', meaning: '飛行機' },
        { word: 'ふね', romaji: 'fune', meaning: '船' }
    ],
    hard: [
        { word: 'ありがとう！', romaji: 'arigatou!', meaning: 'ありがとう！' },
        { word: 'おはよう！', romaji: 'ohayou!', meaning: 'おはよう！' },
        { word: 'こんにちは！', romaji: 'konnitiha!', meaning: 'こんにちは！' },
        { word: 'がんばって！', romaji: 'ganbatte!', meaning: 'がんばって！' },
        { word: 'おめでとう！', romaji: 'omedetou!', meaning: 'おめでとう！' },
        { word: 'だいじょうぶ？', romaji: 'daijoubu?', meaning: 'だいじょうぶ？' },
        { word: 'わかりました。', romaji: 'wakarimasita.', meaning: 'わかりました。' },
        { word: 'すみません。', romaji: 'sumimasen.', meaning: 'すみません。' },
        { word: 'いただきます！', romaji: 'itadakimasu!', meaning: 'いただきます！' },
        { word: 'ごちそうさま！', romaji: 'gotisousama!', meaning: 'ごちそうさま！' },
        { word: 'がっこう', romaji: 'gakkou', meaning: '学校' },
        { word: 'ぎゅうにゅう', romaji: 'gyuunyuu', meaning: '牛乳' },
        { word: 'ぐあい', romaji: 'guai', meaning: '具合' },
        { word: 'げんき', romaji: 'genki', meaning: '元気' },
        { word: 'ごはん', romaji: 'gohan', meaning: 'ごはん' },
        { word: 'ざっし', romaji: 'zassi', meaning: '雑誌' },
        { word: 'じてんしゃ', romaji: 'jitensya', meaning: '自転車' },
        { word: 'ずっと', romaji: 'zutto', meaning: 'ずっと' },
        { word: 'ぜんぶ', romaji: 'zenbu', meaning: '全部' },
        { word: 'ぞう', romaji: 'zou', meaning: '象' },
        { word: 'だいすき', romaji: 'daisuki', meaning: '大好き' },
        { word: 'ちょっと', romaji: 'tyotto', meaning: 'ちょっと' },
        { word: 'でんわ', romaji: 'denwa', meaning: '電話' },
        { word: 'どうぞ', romaji: 'douzo', meaning: 'どうぞ' },
        { word: 'ばんごはん', romaji: 'bangohan', meaning: '晩ごはん' },
        { word: 'びっくり', romaji: 'bikkuri', meaning: 'びっくり' },
        { word: 'ぶどう', romaji: 'budou', meaning: 'ぶどう' },
        { word: 'べんきょう', romaji: 'benkyou', meaning: '勉強' },
        { word: 'ぼく', romaji: 'boku', meaning: '僕' },
        { word: 'ぱん', romaji: 'pan', meaning: 'パン' },
        { word: 'ぴかぴか', romaji: 'pikapika', meaning: 'ぴかぴか' },
        { word: 'ぷれぜんと', romaji: 'purezento', meaning: 'プレゼント' },
        { word: 'ぺっと', romaji: 'petto', meaning: 'ペット' },
        { word: 'ぽけっと', romaji: 'poketto', meaning: 'ポケット' },
        { word: 'きゃべつ', romaji: 'kyabetu', meaning: 'キャベツ' },
        { word: 'きゅうり', romaji: 'kyuuri', meaning: 'きゅうり' },
        { word: 'きょうだい', romaji: 'kyoudai', meaning: '兄弟' },
        { word: 'しゃしん', romaji: 'syasin', meaning: '写真' },
        { word: 'しゅくだい', romaji: 'syukudai', meaning: '宿題' },
        { word: 'しょうがっこう', romaji: 'syougakkou', meaning: '小学校' },
        // 長音
        { word: 'こーひー', romaji: 'ko-hi-', meaning: 'コーヒー' },
        { word: 'けーき', romaji: 'ke-ki', meaning: 'ケーキ' },
        { word: 'すぽーつ', romaji: 'supo-tu', meaning: 'スポーツ' },
        { word: 'にゅーす', romaji: 'nyu-su', meaning: 'ニュース' },
        { word: 'じゅーす', romaji: 'jyu-su', meaning: 'ジュース' },
        { word: 'でーた', romaji: 'de-ta', meaning: 'データ' },
        { word: 'ちーむ', romaji: 'ti-mu', meaning: 'チーム' },
        { word: 'めーる', romaji: 'me-ru', meaning: 'メール' },
        { word: 'ぷーる', romaji: 'pu-ru', meaning: 'プール' },
        { word: 'すたーと', romaji: 'suta-to', meaning: 'スタート' },
        // 波ダッシュ
        { word: 'たのしい〜', romaji: 'tanosii~', meaning: 'たのしい〜' },
        { word: 'うれしい〜', romaji: 'uresii~', meaning: 'うれしい〜' },
        { word: 'おいしい〜', romaji: 'oisii~', meaning: 'おいしい〜' },
        { word: 'だいすき〜', romaji: 'daisuki~', meaning: 'だいすき〜' },
        { word: 'げんき〜', romaji: 'genki~', meaning: 'げんき〜' },
        // ＆
        { word: 'らぶ＆ぴーす', romaji: 'rabu&pi-su', meaning: 'LOVE & PEACE' },
        { word: 'あっぷ＆だうん', romaji: 'appu&daun', meaning: 'UP & DOWN' },
        { word: 'ぶらっく＆ほわいと', romaji: 'burakku&howaito', meaning: 'BLACK & WHITE' },
        { word: 'ろっく＆ろーる', romaji: 'rokku&ro-ru', meaning: 'ROCK & ROLL' },
        { word: 'ゆ〜＆み〜', romaji: 'yu~&mi~', meaning: 'YOU & ME' },
        // 数字
        { word: '1しゅうかん', romaji: '1syuukan', meaning: '1週間' },
        { word: '24じかん', romaji: '24jikan', meaning: '24時間' },
        { word: '100ぱーせんと', romaji: '100pa-sento', meaning: '100パーセント' },
        { word: '365にち', romaji: '365niti', meaning: '365日' },
        { word: '1000えん', romaji: '1000en', meaning: '1000円' },
        { word: '2026ねん', romaji: '2026nen', meaning: '2026年' },
        { word: '12じ30ぷん', romaji: '12ji30pun', meaning: '12時30分' },
        { word: '7つのたいざい', romaji: '7tunotaizai', meaning: '7つの大罪' },
        { word: '10かいだて', romaji: '10kaidate', meaning: '10階建て' },
        { word: '50めーとるそう', romaji: '50me-torusou', meaning: '50メートル走' }
    ]
};

// グローバル変数
let currentMode = 'single';  // 'single', 'word', 'review'
let currentLevel = 'easy';
let currentKeyIndex = 0;
let currentKey = '';
let currentWord = '';  // ローマ字
let currentWordObj = null;  // 単語オブジェクト（word, romaji, meaning）
let currentWordIndex = 0;
let practiceKeys = [];
let correctCount = 0;
let totalCount = 0;
let soundEnabled = true;

// 間違えた単語リスト
let mistakenWords = [];
// プレイ履歴リスト
let playHistory = [];

// タイマー関連
let timeLimit = 60;  // 60秒
let timeRemaining = 60;
let timerInterval = null;
let isTimerMode = false;
let isInputBlocked = false; // 入力ブロックフラグ

// ... (Web Audio APIなどはそのまま)

// DOM要素
// ... (既存のもの)
const reviewBtn = document.getElementById('reviewBtn'); // 追加

// ... (loadHighScoresなどはそのまま)

// 復習モードを開始
function startReview() {
    if (mistakenWords.length === 0) {
        alert('復習する間違いがありません！');
        return;
    }

    currentMode = 'review';
    timeLimit = 30; // 復習モードは30秒

    // 間違えた単語をコピーして練習リストに設定（ディープコピーで安全に）
    try {
        const tempKeys = JSON.parse(JSON.stringify(mistakenWords));
        // 有効なデータのみ抽出
        practiceKeys = tempKeys.filter(k => k && k.word && k.romaji);

        if (practiceKeys.length === 0) {
            alert('復習可能なデータがありません');
            return;
        }
    } catch (e) {
        console.error(e);
        alert('復習データの読み込みに失敗しました');
        return;
    }

    // シャッフル
    shuffleArray(practiceKeys);

    correctCount = 0;
    totalCount = 0;
    currentKeyIndex = 0;
    isTimerMode = true;

    // UI設定
    levelSelection.style.display = 'none';
    document.querySelector('.mode-buttons').style.display = 'none';
    levelButtons.style.display = 'none';
    practiceScreen.style.display = 'block';

    currentModeElement.textContent = `復習モード (${practiceKeys.length}語)`;

    // 復習モードではハイスコア表示は不要なので、表示エリアを隠すだけにする
    highScoreDisplay.style.display = 'none';

    nextTarget();
    updateStats();

    // 既存のタイマーがあれば停止してから開始
    stopTimer();
    startTimer();
}



// 記録関連（localStorageに保存）
let highScores = {
    single: { easy: 0, medium: 0, hard: 0 },
    word: { easy: 0, medium: 0, hard: 0 }
};

// Web Audio API for sound effects
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// DOM要素
const levelSelection = document.getElementById('levelSelection');
const practiceScreen = document.getElementById('practiceScreen');
const levelButtons = document.getElementById('levelButtons');
const targetKeyElement = document.getElementById('targetKey');
const instructionElement = document.getElementById('instruction');
const correctCountElement = document.getElementById('correctCount');
const totalCountElement = document.getElementById('totalCount');
const accuracyElement = document.getElementById('accuracy');
const successMessage = document.getElementById('successMessage');
const soundToggle = document.getElementById('soundToggle');
const currentModeElement = document.getElementById('currentMode');
const timerDisplay = document.getElementById('timerDisplay');
const highScoreDisplay = document.getElementById('highScoreDisplay');

// 記録を読み込む
function loadHighScores() {
    const saved = localStorage.getItem('typingHighScores');
    if (saved) {
        highScores = JSON.parse(saved);
    }
}

// 記録を保存する
function saveHighScores() {
    localStorage.setItem('typingHighScores', JSON.stringify(highScores));
}

// 記録を更新する
function updateHighScore(score) {
    if (!highScores[currentMode]) return false;
    const currentHighScore = highScores[currentMode][currentLevel];
    if (score > currentHighScore) {
        highScores[currentMode][currentLevel] = score;
        saveHighScores();
        return true;  // 新記録
    }
    return false;
}

// 最高記録を表示
function displayHighScore() {
    if (!highScores[currentMode]) {
        highScoreDisplay.style.display = 'none';
        return;
    }
    const highScore = highScores[currentMode][currentLevel];
    if (highScore > 0) {
        highScoreDisplay.textContent = `最高記録: ${highScore}回`;
        highScoreDisplay.style.display = 'block';
    } else {
        highScoreDisplay.style.display = 'none';
    }
}

// 履歴を読み込む
function loadHistory() {
    const saved = localStorage.getItem('typingPlayHistory');
    if (saved) {
        try {
            playHistory = JSON.parse(saved);
        } catch (e) { /* ignore */ }
    }
}

// 履歴を保存する
function saveHistory() {
    localStorage.setItem('typingPlayHistory', JSON.stringify(playHistory));
}

// 履歴を追記する
function recordHistory() {
    const now = new Date();
    const dateStr = `${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    // 復習モードの場合、レベルはない
    let levelStr = '-';
    if (currentMode !== 'review') {
        levelStr = currentLevel === 'easy' ? 'やさしい' : currentLevel === 'medium' ? 'ふつう' : 'むずかしい';
    }

    let modeStr = '';
    if (currentMode === 'single') modeStr = '1文字';
    else if (currentMode === 'word') modeStr = '単語';
    else if (currentMode === 'review') modeStr = '復習';

    const historyItem = {
        date: dateStr,
        mode: modeStr,
        level: levelStr,
        score: correctCount,
        miss: totalCount - correctCount
    };

    playHistory.unshift(historyItem);
    if (playHistory.length > 50) playHistory.pop();

    saveHistory();
}

function showHistory() {
    const tbody = document.getElementById('historyListBody');
    const msg = document.getElementById('noHistoryMsg');
    tbody.innerHTML = '';

    if (playHistory.length === 0) {
        msg.style.display = 'block';
    } else {
        msg.style.display = 'none';
        playHistory.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="padding: 10px; border-bottom: 1px solid #edf2f7; color: #718096;">${item.date}</td>
                <td style="padding: 10px; border-bottom: 1px solid #edf2f7; color: #2d3748; font-weight: bold;">
                    ${item.mode} <span style="font-size: 0.8em; color: #a0aec0;">${item.level !== '-' ? '(' + item.level + ')' : ''}</span>
                </td>
                <td style="padding: 10px; border-bottom: 1px solid #edf2f7; color: #38a169; font-weight: bold;">
                    ${item.score}回 <span style="font-size: 0.8em; color: #e53e3e;">(ミス${item.miss})</span>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    document.querySelector('.mode-buttons').style.display = 'none';
    document.querySelector('.review-area').style.display = 'none';
    document.querySelector('.history-area').style.display = 'none';
    document.getElementById('historyScreen').style.display = 'block';
}

function closeHistory() {
    document.getElementById('historyScreen').style.display = 'none';
    backToMenu();
}

function clearHistory() {
    if (confirm('履歴をすべて消去しますか？')) {
        playHistory = [];
        localStorage.removeItem('typingPlayHistory');
        showHistory();
    }
}

// タイマーを開始
function startTimer() {
    stopTimer(); // 既存のタイマーを確実に停止

    timeRemaining = timeLimit;
    updateTimerDisplay();

    timerInterval = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();

        if (timeRemaining <= 0) {
            endPractice();
        }
    }, 1000);
}

// タイマー表示を更新
function updateTimerDisplay() {
    timerDisplay.textContent = `残り時間: ${timeRemaining}秒`;

    // 残り10秒以下で色を変える
    if (timeRemaining <= 10) {
        timerDisplay.style.color = '#ff3333';
        timerDisplay.style.fontWeight = 'bold';
    } else {
        timerDisplay.style.color = '#667eea';
        timerDisplay.style.fontWeight = 'normal';
    }
}

// タイマーを停止
function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

// 練習終了
function endPractice() {
    stopTimer();

    // 履歴を記録
    recordHistory();

    const isNewRecord = updateHighScore(correctCount);

    // 結果表示
    const resultMessage = document.getElementById('resultMessage');
    const finalScore = document.getElementById('finalScore');
    const newRecordBadge = document.getElementById('newRecordBadge');

    finalScore.textContent = correctCount;

    if (isNewRecord) {
        newRecordBadge.style.display = 'block';
        playWordCompleteSound();
    } else {
        newRecordBadge.style.display = 'none';
    }

    resultMessage.style.display = 'flex';
}

// 結果画面を閉じる
function closeResult() {
    document.getElementById('resultMessage').style.display = 'none';
    backToMenu();
}

// 再挑戦
function retry() {
    document.getElementById('resultMessage').style.display = 'none';
    startPractice(currentLevel);
}

// 正解の効果音を再生（明るい音）
function playCorrectSound() {
    if (!soundEnabled) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);

    const oscillator2 = audioContext.createOscillator();
    const gainNode2 = audioContext.createGain();
    oscillator2.connect(gainNode2);
    gainNode2.connect(audioContext.destination);
    oscillator2.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.05);
    oscillator2.type = 'sine';
    gainNode2.gain.setValueAtTime(0.2, audioContext.currentTime + 0.05);
    gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    oscillator2.start(audioContext.currentTime + 0.05);
    oscillator2.stop(audioContext.currentTime + 0.3);
}

// 不正解の効果音を再生（低い音）
function playIncorrectSound() {
    if (!soundEnabled) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
    oscillator.type = 'sawtooth';

    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
}

// 単語完成の効果音を再生（華やかな音）
function playWordCompleteSound() {
    if (!soundEnabled) return;

    const frequencies = [523.25, 659.25, 783.99];
    frequencies.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        const startTime = audioContext.currentTime + (index * 0.1);
        oscillator.frequency.setValueAtTime(freq, startTime);
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);

        oscillator.start(startTime);
        oscillator.stop(startTime + 0.4);
    });
}

// モード選択
function selectMode(mode) {
    currentMode = mode;
    levelButtons.style.display = 'block';

    document.querySelector('.mode-buttons').style.display = 'none';
}

// 配列をシャッフルする関数（フィッシャー・イェーツのシャッフル）
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// 練習開始
function startPractice(level) {
    timeLimit = 60;  // 60秒にリセット
    currentLevel = level;

    if (currentMode === 'single') {
        practiceKeys = [...levelKeys[level]];
    } else {
        practiceKeys = [...levelWords[level]];
    }

    // ランダムに出題するためにシャッフル
    shuffleArray(practiceKeys);

    correctCount = 0;
    totalCount = 0;
    currentKeyIndex = 0;
    isTimerMode = true;

    levelSelection.style.display = 'none';
    practiceScreen.style.display = 'block';

    const modeText = currentMode === 'single' ? '1文字ずつ練習' : '単語で練習';
    const levelText = level === 'easy' ? 'やさしい' : level === 'medium' ? 'ふつう' : 'むずかしい';
    currentModeElement.textContent = `${modeText} - ${levelText}`;

    displayHighScore();
    nextTarget();
    updateStats();
    startTimer();
}

// メニューに戻る
function backToMenu() {
    // 練習画面が表示中なら履歴を保存（途中終了や復習完了時）
    if (practiceScreen.style.display === 'block') {
        recordHistory();
    }

    isInputBlocked = false;
    stopTimer();
    practiceScreen.style.display = 'none';
    levelSelection.style.display = 'block';

    document.querySelector('.mode-buttons').style.display = 'flex';
    levelButtons.style.display = 'none';

    // 復習エリアと履歴エリアを再表示
    document.querySelector('.review-area').style.display = 'block';
    document.querySelector('.history-area').style.display = 'block';
    document.getElementById('historyScreen').style.display = 'none';

    // 復習ボタンの表示更新
    reviewBtn.style.display = 'inline-block';

    // アニメーションを一度オフにする
    reviewBtn.style.animation = 'none';
    reviewBtn.offsetHeight; // リフローをトリガー

    if (mistakenWords.length > 0) {
        reviewBtn.disabled = false;
        reviewBtn.classList.remove('disabled');
        // 有効時は鮮やかなグラデーション
        reviewBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        reviewBtn.style.color = 'white';
        reviewBtn.style.cursor = 'pointer';
        reviewBtn.style.border = 'none';
        reviewBtn.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)'; // 影を強調
        reviewBtn.style.transform = 'translateY(-2px)'; // 少し浮いているように

        reviewBtn.textContent = `🔄 間違えた単語を復習 (${mistakenWords.length}語)`;
        reviewBtn.style.animation = 'pulse 2s infinite ease-in-out';
    } else {
        reviewBtn.disabled = true;
        reviewBtn.classList.add('disabled');
        // 無効時は見やすいグレーと枠線
        reviewBtn.style.background = '#f8f9fa';
        reviewBtn.style.color = '#718096'; // 文字を濃く
        reviewBtn.style.border = '2px solid #cbd5e0'; // 枠線で存在感を出す
        reviewBtn.style.cursor = 'not-allowed';
        reviewBtn.style.boxShadow = 'none';
        reviewBtn.style.transform = 'none';

        reviewBtn.textContent = '復習する単語はありません';
        reviewBtn.style.animation = 'none';
    }
}




// 次のターゲットに進む
function nextTarget() {
    isInputBlocked = true;
    setTimeout(() => {
        isInputBlocked = false;
    }, 200);

    if (currentMode === 'single') {
        currentKey = practiceKeys[currentKeyIndex];
        updateDisplaySingle();
        highlightKey(currentKey);
    } else {
        currentWordObj = practiceKeys[currentKeyIndex];

        if (!currentWordObj) {
            console.error('Word object not found at index:', currentKeyIndex);
            alert('問題データの読み込みエラーが発生しました。メニューに戻ります。');
            backToMenu();
            return;
        }

        currentWord = currentWordObj.romaji;
        currentWordIndex = 0;
        currentKey = currentWord[0];
        updateDisplayWord();
        highlightKey(currentKey);
    }
}

// 1文字モードの表示を更新
function updateDisplaySingle() {
    const keyInfo = keyFingerMap[currentKey];
    const handText = keyInfo.hand === 'left' ? '左手' : keyInfo.hand === 'right' ? '右手' : '両手';
    const keyDisplay = currentKey === ' ' ? 'スペース' : currentKey;

    targetKeyElement.textContent = keyDisplay;

    // Shiftキーが必要な記号の場合
    let instruction = '';
    if (currentKey === '!') {
        instruction = '右手でShiftキーを押しながら、左手の小指で「1」を押してください';
    } else if (currentKey === '?') {
        instruction = '左手でShiftキーを押しながら、右手の小指で「/」を押してください';
    } else {
        instruction = `${handText}の${keyInfo.finger}で「${keyDisplay}」を押してください`;
    }

    instructionElement.textContent = instruction;
}

// 単語モードの表示を更新
function updateDisplayWord() {
    let displayHTML = `<div style="font-size: 0.8em; color: #764ba2; margin-bottom: 10px;">${currentWordObj.word} (${currentWordObj.meaning})</div>`;

    displayHTML += '<div style="font-size: 1.2em; letter-spacing: 0.2em;">';
    for (let i = 0; i < currentWord.length; i++) {
        if (i < currentWordIndex) {
            displayHTML += `<span style="color: #66cc66; font-weight: bold;">${currentWord[i]}</span>`;
        } else if (i === currentWordIndex) {
            displayHTML += `<span class="current-key">${currentWord[i]}</span>`;
        } else {
            displayHTML += `<span style="color: #ccc;">${currentWord[i]}</span>`;
        }
    }
    displayHTML += '</div>';
    targetKeyElement.innerHTML = displayHTML;

    const keyInfo = keyFingerMap[currentKey];
    const handText = keyInfo.hand === 'left' ? '左手' : keyInfo.hand === 'right' ? '右手' : '両手';

    // Shiftキーが必要な記号の場合
    let instruction = '';
    if (currentKey === '!') {
        instruction = '右手でShiftキーを押しながら、左手の小指で「1」を押してください';
    } else if (currentKey === '?') {
        instruction = '左手でShiftキーを押しながら、右手の小指で「/」を押してください';
    } else if (currentKey === '~') {
        instruction = '左手でShiftキーを押しながら、右手の小指で「^」を押してください';
    } else if (currentKey === '&') {
        instruction = '右手でShiftキーを押しながら、左手の小指で「6」を押してください';
    } else {
        instruction = `${handText}の${keyInfo.finger}で「${currentKey}」を押してください`;
    }

    instructionElement.textContent = instruction;
}

// キーをハイライト
function highlightKey(key) {
    document.querySelectorAll('.key').forEach(k => k.classList.remove('active'));

    // Shiftキーが必要な文字と、そのベースとなるキー（Shiftなしで押すキー）の対応
    const shiftKeyMap = {
        '!': { base: '1', shift: 'ShiftR' },
        '?': { base: '/', shift: 'ShiftL' },
        '~': { base: '^', shift: 'ShiftL' },
        '&': { base: '6', shift: 'ShiftL' }
    };

    const shiftInfo = shiftKeyMap[key];

    if (shiftInfo) {
        // Shiftキーが必要な場合
        // 1. ベースキーをハイライト
        const baseKeyElement = document.querySelector(`.key[data-key="${shiftInfo.base}"]`);
        if (baseKeyElement) {
            baseKeyElement.classList.add('active');
        }
        // 2. Shiftキーをハイライト
        const shiftElement = document.querySelector(`.key[data-key="${shiftInfo.shift}"]`);
        if (shiftElement) {
            shiftElement.classList.add('active');
        }
    } else {
        // 通常のキーハイライト
        const keyElement = document.querySelector(`.key[data-key="${key}"]`);
        if (keyElement) {
            keyElement.classList.add('active');
        }
    }
}

// 成功メッセージを表示
function showSuccessMessage() {
    successMessage.classList.add('show');
    setTimeout(() => {
        successMessage.classList.remove('show');
    }, 800);
}

// 統計を更新
function updateStats() {
    correctCountElement.textContent = correctCount;
    totalCountElement.textContent = totalCount;
    const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 100;
    accuracyElement.textContent = accuracy + '%';
}

// キーボードイベント
document.addEventListener('keydown', (event) => {
    if (practiceScreen.style.display === 'none') {
        return;
    }

    if (event.ctrlKey || event.altKey || event.metaKey) {
        return;
    }

    // 修飾キー単体での押下は無視
    if (['SHIFT', 'CONTROL', 'ALT', 'META', 'CAPSLOCK', 'TAB', 'ENTER', 'BACKSPACE'].includes(event.key.toUpperCase())) {
        return;
    }

    // 入力ブロック中は無視
    if (isInputBlocked) {
        event.preventDefault();
        return;
    }

    const pressedKey = event.key.toLowerCase();
    const expectedKey = currentKey === ' ' ? ' ' : currentKey;

    // Shiftキーが必要な文字の場合の文字変換（例：1のShift -> !）
    // event.keyは通常、入力された文字そのものを返すため、特別な処理は不要だが
    // 念のため正解判定を行う（Shift + 1 を押すと "!" になる）

    totalCount++;

    if (pressedKey === expectedKey) {
        correctCount++;

        if (currentMode === 'single') {
            playCorrectSound();
            showSuccessMessage();

            setTimeout(() => {
                currentKeyIndex = (currentKeyIndex + 1) % practiceKeys.length;
                nextTarget();
                updateStats();
            }, 300);
        } else {
            currentWordIndex++;

            if (currentWordIndex >= currentWord.length) {
                playWordCompleteSound();
                showSuccessMessage();

                // 復習モードの場合、正解した単語をリストから削除
                if (currentMode === 'review') {
                    const completedWord = practiceKeys[currentKeyIndex];

                    // 間違いリストから削除
                    mistakenWords = mistakenWords.filter(w => w.word !== completedWord.word);

                    // 現在のプレイリストからも削除
                    practiceKeys.splice(currentKeyIndex, 1);

                    // インデックス調整（削除したので詰められる）
                    if (currentKeyIndex >= practiceKeys.length) {
                        currentKeyIndex = 0;
                    }

                    // 全て完了したら終了
                    if (practiceKeys.length === 0) {
                        setTimeout(() => {
                            stopTimer(); // タイマー停止
                            alert('素晴らしい！全ての復習が完了しました！');
                            backToMenu();
                        }, 500);
                        return;
                    }

                    // 次の問題へ（インデックスは進めない）
                    setTimeout(() => {
                        nextTarget();
                        updateStats();
                    }, 500);
                    return;
                }

                setTimeout(() => {
                    currentKeyIndex = (currentKeyIndex + 1) % practiceKeys.length;
                    nextTarget();
                    updateStats();
                }, 500);
            } else {
                playCorrectSound();
                currentKey = currentWord[currentWordIndex];
                updateDisplayWord();
                highlightKey(currentKey);
                updateStats();
            }
        }
    } else {
        playIncorrectSound();
        updateStats();

        // 単語モードの場合、間違えた単語をリストに追加
        if (currentMode === 'word') {
            const wordObj = practiceKeys[currentKeyIndex];
            // 重複チェック（同じ単語は追加しない）
            const isAlreadyAdded = mistakenWords.some(w => w.word === wordObj.word);
            if (!isAlreadyAdded) {
                mistakenWords.push(wordObj);
            }
        } else if (currentMode === 'review') {
            const wordObj = practiceKeys[currentKeyIndex];
            // 復習モードで間違えたら、リストの末尾に追加して再度挑戦させる（そのセッション中）
            if (!wordObj.hasAddedRetry) {
                const retryObj = JSON.parse(JSON.stringify(wordObj));
                delete retryObj.hasAddedRetry; // フラグ削除
                practiceKeys.push(retryObj);

                wordObj.hasAddedRetry = true; // 現在のオブジェクトは追加済み

                // 表示更新
                currentModeElement.textContent = `復習モード (${practiceKeys.length}語)`;
            }
        }
    }

    event.preventDefault();
});

// キーボードのキーをクリックしたときの処理
document.querySelectorAll('.key').forEach(key => {
    key.addEventListener('click', () => {
        const keyValue = key.getAttribute('data-key');
        const event = new KeyboardEvent('keydown', {
            key: keyValue === ' ' ? ' ' : keyValue.toLowerCase(),
            bubbles: true
        });
        document.dispatchEvent(event);
    });
});

// 効果音トグル
soundToggle.addEventListener('change', (event) => {
    soundEnabled = event.target.checked;
    if (soundEnabled) {
        playCorrectSound();
    }
});

// 初期化
loadHighScores();
loadHistory();
