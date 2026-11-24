export interface QuizQuestion {
  questionEng: string;
  questionBm: string;
  optionsEng: string[];
  optionsBm: string[];
  correctIndex: number;
}

export interface LessonItem {
  id: string;
  type: 'article' | 'video';
  category: string;
  duration: string;
  level?: string;
  xpReward: number;
  thumbnail?: string;
  titleEng: string;
  titleBm: string;
  descEng: string;
  descBm: string;
  bodyEng: string[];
  bodyBm: string[];
  quiz: QuizQuestion[];
}

export const lessons: LessonItem[] = [
  {
    id: 'lesson-dividends',
    type: 'article',
    category: 'Basics',
    duration: '5 min',
    xpReward: 25,
    titleEng: 'What is a Dividend?',
    titleBm: 'Apakah Dividen?',
    descEng: 'Learn how Bursa Malaysia companies share cash profits with shareholders.',
    descBm: 'Pelajari bagaimana syarikat Bursa Malaysia berkongsi keuntungan tunai dengan pemegang saham.',
    bodyEng: [
      'A dividend is a portion of a company’s net profit paid directly to shareholders as cash. Mature Malaysian companies such as MAYBANK, PBBANK, and TENAGA regularly distribute dividends.',
      'Dividend Yield is calculated as (Annual Dividend per Share / Current Share Price) x 100%. For example, if a RM 10.00 stock pays RM 0.60 per year, its dividend yield is 6.0%.',
      'Watch out for dividend traps: an unusually high yield can sometimes happen because the share price fell sharply due to falling profits. Always check Net Profit and P/E Ratio together.',
    ],
    bodyBm: [
      'Dividen ialah sebahagian daripada keuntungan bersih syarikat yang dibayar terus kepada pemegang saham secara tunai. Syarikat matang seperti MAYBANK, PBBANK, dan TENAGA kerap membayar dividen.',
      'Hasil Dividen dikira sebagai (Dividen Tahunan Sesaham / Harga Saham Semasa) x 100%. Contohnya, jika saham RM 10.00 membayar RM 0.60 setahun, hasil dividennya ialah 6.0%.',
      'Berhati-hati dengan perangkap dividen: hasil terlalu tinggi kadang-kadang berlaku kerana harga saham jatuh mendadak akibat kejatuhan untung. Semak Untung Bersih dan Nisbah P/E bersama.',
    ],
    quiz: [
      {
        questionEng: 'If a Bursa stock costs RM 5.00 and pays RM 0.25 in annual dividends, what is its Dividend Yield?',
        questionBm: 'Jika saham Bursa berharga RM 5.00 dan membayar dividen tahunan RM 0.25, apakah Hasil Dividennya?',
        optionsEng: ['2.5%', '5.0%', '25.0%'],
        optionsBm: ['2.5%', '5.0%', '25.0%'],
        correctIndex: 1,
      },
      {
        questionEng: 'Where do sustainable cash dividends ultimately come from?',
        questionBm: 'Daripada manakah datangnya pembayaran dividen tunai yang mampan?',
        optionsEng: ['Company net profits and free cash flow', 'Borrowing short-term debt every month', 'Random stock split events'],
        optionsBm: ['Keuntungan bersih dan aliran tunai syarikat', 'Pinjaman hutang jangka pendek setiap bulan', 'Pecahan saham secara rawak'],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'lesson-bursa-basics',
    type: 'article',
    category: 'Market',
    duration: '8 min',
    xpReward: 25,
    titleEng: 'Understanding Bursa Malaysia',
    titleBm: 'Memahami Bursa Malaysia',
    descEng: "A starter guide to Malaysia's stock exchange, board lots, and Shariah screening.",
    descBm: 'Panduan permulaan tentang bursa saham Malaysia, lot papan, dan saringan Patuh Syariah.',
    bodyEng: [
      'Bursa Malaysia operates Monday to Friday in two trading sessions: 9:00 AM – 12:30 PM and 2:30 PM – 5:00 PM (MYT). Stocks are identified by both a ticker name (e.g., TENAGA) and a 4-digit code (5347).',
      'On Bursa Malaysia, 1 standard board lot equals 100 units (shares). In JomINVEST’s student sandbox, you can practice with any unit size from 1 unit upward before moving to 100-unit lots.',
      'The Securities Commission Malaysia (SC) publishes an official Shariah-compliant list twice a year, screening business activities and financial ratios so Muslim and ethical investors can invest with clarity.',
    ],
    bodyBm: [
      'Bursa Malaysia beroperasi Isnin hingga Jumaat dalam dua sesi dagangan: 9:00 pagi – 12:30 tengah hari dan 2:30 petang – 5:00 petang (MYT). Saham dikenali melalui nama kod (cth. TENAGA) dan nombor 4 digit (5347).',
      'Di Bursa Malaysia, 1 lot papan standard bersamaan 100 unit saham. Dalam kotak pasir JomINVEST, anda boleh berlatih dari 1 unit ke atas.',
      'Suruhanjaya Sekuriti Malaysia (SC) menerbitkan senarai rasmi sekuriti Patuh Syariah dua kali setahun berdasarkan saringan aktiviti perniagaan dan nisbah kewangan.',
    ],
    quiz: [
      {
        questionEng: 'How many shares make up 1 standard board lot on Bursa Malaysia?',
        questionBm: 'Berapakah bilangan unit saham dalam 1 lot standard di Bursa Malaysia?',
        optionsEng: ['10 units', '100 units', '1,000 units'],
        optionsBm: ['10 unit', '100 unit', '1,000 unit'],
        correctIndex: 1,
      },
      {
        questionEng: 'Which body issues the official Shariah-compliant stock list in Malaysia?',
        questionBm: 'Badan manakah yang mengeluarkan senarai rasmi saham Patuh Syariah di Malaysia?',
        optionsEng: ['Securities Commission Malaysia (SC)', 'Any social media finfluencer', 'Individual company marketing teams'],
        optionsBm: ['Suruhanjaya Sekuriti Malaysia (SC)', 'Mana-mana pempengaruh media sosial', 'Pasukan pemasaran syarikat'],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'lesson-risk-return',
    type: 'article',
    category: 'Strategy',
    duration: '6 min',
    xpReward: 25,
    titleEng: 'Risk vs. Return & Diversification',
    titleBm: 'Risiko vs. Pulangan & Kepelbagaian',
    descEng: 'How to balance growth potential and downside protection across Bursa sectors.',
    descBm: 'Cara mengimbangi potensi pertumbuhan dan perlindungan risiko merentas sektor Bursa.',
    bodyEng: [
      'Higher potential returns always carry higher volatility. Growth counters (like data-center or industrial exporters) can swing 3–5% in a day, while utilities and consumer staples move more steadily.',
      'Diversification means spreading your capital across uncorrelated sectors — for instance pairing Financial Services, Utilities, and Healthcare — so one industry downturn does not sink your whole portfolio.',
      'Never invest emergency cash you need within the next 6–12 months into equities; time in the market smooths out short-term dips.',
    ],
    bodyBm: [
      'Potensi pulangan yang lebih tinggi sentiasa datang dengan turun naik yang lebih besar. Saham pertumbuhan boleh bergerak 3–5% sehari berbanding saham utiliti yang lebih stabil.',
      'Kepelbagaian (diversifikasi) bermaksud mengagihkan modal merentas sektor berbeza — seperti Kewangan, Utiliti, dan Penjagaan Kesihatan — supaya kejatuhan satu sektor tidak menjejaskan keseluruhan portfolio.',
      'Jangan laburkan wang kecemasan yang diperlukan dalam tempoh 6–12 bulan ke dalam pasaran saham.',
    ],
    quiz: [
      {
        questionEng: 'Why do investors hold stocks from multiple sectors instead of just one stock?',
        questionBm: 'Mengapakah pelabur memegang saham daripada pelbagai sektor dan bukan satu saham sahaja?',
        optionsEng: ['To reduce single-company and single-sector risk', 'To pay more transaction fees', 'Because Bursa forbids owning one stock'],
        optionsBm: ['Untuk mengurangkan risiko tertumpu pada satu syarikat/sektor', 'Untuk membayar lebih yuran transaksi', 'Kerana Bursa melarang pegangan satu saham'],
        correctIndex: 0,
      },
      {
        questionEng: 'Which money should NOT be invested into stocks?',
        questionBm: 'Wang manakah yang TIDAK patut dilaburkan ke dalam saham?',
        optionsEng: ['Long-term savings for 5+ years', 'Next month’s tuition and emergency fund', 'Monthly surplus savings'],
        optionsBm: ['Simpanan jangka panjang 5+ tahun', 'Yuran pengajian bulan depan & tabung kecemasan', 'Lebihan simpanan bulanan'],
        correctIndex: 1,
      },
    ],
  },
  {
    id: 'video-chart-reading',
    type: 'video',
    category: 'Technical',
    duration: '12 min',
    level: 'Beginner',
    xpReward: 25,
    thumbnail: 'https://images.unsplash.com/photo-1579226905180-636b76d96082?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    titleEng: 'How to Read a Stock Chart',
    titleBm: 'Cara Membaca Carta Saham',
    descEng: 'Master trends, timeframe comparison (7D vs 1M), and trading volume without confusing jargon.',
    descBm: 'Kuasai trend, perbandingan tempoh masa (7H vs 1B), dan volum dagangan dengan mudah.',
    bodyEng: [
      'Key Video Takeaway 1 — Zoom Out First: A 1-day drop can look scary until you switch from 7D to 1M or 1Y and see a steady higher-highs uptrend.',
      'Key Video Takeaway 2 — Average Baseline: Comparing current price against the period average helps you spot whether you are chasing a spike or buying near fair support.',
      'Key Video Takeaway 3 — Volume Confirms Conviction: A price breakout accompanied by strong trading volume shows broad institutional participation rather than thin retail noise.',
    ],
    bodyBm: [
      'Intipati Video 1 — Lihat Tempoh Lebih Panjang: Kejatuhan sehari mungkin nampak membimbangkan sehingga anda menukar daripada 7D ke 1M dan melihat trend menaik yang sihat.',
      'Intipati Video 2 — Garis Purata: Membandingkan harga semasa dengan purata tempoh membantu anda mengelak daripada membeli pada puncak melampau.',
      'Intipati Video 3 — Volum Mengesahkan Minat: Kenaikan harga bersama volum dagangan tinggi menunjukkan penyertaan kukuh pelabur institusi.',
    ],
    quiz: [
      {
        questionEng: 'What does high trading volume during a price move indicate?',
        questionBm: 'Apakah maksud volum dagangan tinggi semasa pergerakan harga?',
        optionsEng: ['Strong market participation and liquidity', 'The company stopped operating', 'Dividends were cancelled'],
        optionsBm: ['Penyertaan pasaran dan kecairan yang kukuh', 'Syarikat berhenti beroperasi', 'Dividen dibatalkan'],
        correctIndex: 0,
      },
      {
        questionEng: 'Why should you check multiple timeframes (e.g., 7D and 1M) before trading?',
        questionBm: 'Mengapakah anda perlu menyemak pelbagai tempoh masa (7D dan 1M) sebelum berdagang?',
        optionsEng: ['To put short-term noise into broader trend context', 'It changes the stock’s dividend rate', 'It lowers brokerage fees'],
        optionsBm: ['Untuk melihat turun naik jangka pendek dalam konteks trend lebih luas', 'Ia mengubah kadar dividen saham', 'Ia mengurangkan yuran broker'],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'video-risk-management',
    type: 'video',
    category: 'Risk',
    duration: '15 min',
    level: 'Beginner',
    xpReward: 25,
    thumbnail: 'https://images.unsplash.com/photo-1668092547893-6402c0387885?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    titleEng: 'Position Sizing & Risk Management',
    titleBm: 'Saiz Posisi & Pengurusan Risiko',
    descEng: 'Protect your RM 10,000 student capital with smart position sizing and cash buffers.',
    descBm: 'Lindungi modal pelajar RM 10,000 anda dengan saiz posisi dan rizab tunai yang bijak.',
    bodyEng: [
      'Key Video Takeaway 1 — The 20% Rule: Avoid putting 100% of your RM 10,000 cash into a single stock. Capping each position at 15–25% keeps a bad earnings surprise manageable.',
      'Key Video Takeaway 2 — Dollar-Cost Averaging (DCA): Buying in smaller tranches over time reduces the regret of mistiming a market peak.',
      'Key Video Takeaway 3 — Keep a Cash Buffer: Holding 10–20% in virtual cash lets you take advantage of quality blue-chip pullbacks without panic-selling other winners.',
    ],
    bodyBm: [
      'Intipati Video 1 — Peraturan 20%: Elakkan meletakkan 100% daripada tunai RM 10,000 ke dalam satu saham sahaja. Hadkan setiap posisi sekitar 15–25%.',
      'Intipati Video 2 — Pemurataan Kos Ringgit (DCA): Membeli secara berperingkat mengurangkan risiko tersalah masuk pada harga tertinggi.',
      'Intipati Video 3 — Simpan Rizab Tunai: Menyimpan 10–20% tunai membolehkan anda membeli saham berkualiti ketika harga diskaun.',
    ],
    quiz: [
      {
        questionEng: 'What is Dollar-Cost Averaging (DCA)?',
        questionBm: 'Apakah maksud Pemurataan Kos Ringgit (DCA)?',
        optionsEng: ['Investing fixed amounts regularly over time instead of all at once', 'Borrowing margin to double your bet', 'Selling every stock after 24 hours'],
        optionsBm: ['Melabur jumlah tetap secara berkala dan bukannya sekali gus', 'Meminjam margin untuk menggandakan pertaruhan', 'Menjual setiap saham selepas 24 jam'],
        correctIndex: 0,
      },
      {
        questionEng: 'Why is keeping a 10–20% cash buffer helpful?',
        questionBm: 'Mengapakah menyimpan rizab tunai 10–20% membantu pelabur?',
        optionsEng: ['Gives flexibility to buy quality stocks during market dips', 'Cash automatically doubles every week', 'It hides losses from your portfolio'],
        optionsBm: ['Memberi fleksibiliti membeli saham berkualiti semasa pasaran turun', 'Tunai berganda secara automatik setiap minggu', 'Ia menyembunyikan kerugian portfolio'],
        correctIndex: 0,
      },
    ],
  },
];
