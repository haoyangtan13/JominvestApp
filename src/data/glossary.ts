export type GlossaryCategory = 'Basics' | 'Valuation' | 'Trading' | 'Shariah & MY';

export interface GlossaryCard {
  id: string;
  category: GlossaryCategory;
  termEng: string;
  termBm: string;
  shortEng: string;
  shortBm: string;
  detailEng: string;
  detailBm: string;
  exampleEng: string;
  exampleBm: string;
}

export const glossaryFlashcards: GlossaryCard[] = [
  {
    id: 'board-lot',
    category: 'Trading',
    termEng: 'Board Lot (100 Units)',
    termBm: 'Lot Dagangan (100 Unit)',
    shortEng: 'The standard minimum trading block of 100 shares on Bursa Malaysia.',
    shortBm: 'Blok dagangan minimum standard sebanyak 100 unit saham di Bursa Malaysia.',
    detailEng:
      'On Bursa Malaysia, stocks are quoted per share in Ringgit Malaysia, but regular orders are placed in multiples of 1 board lot (100 units). Quantities below 100 units are traded separately as odd lots with lower liquidity.',
    detailBm:
      'Di Bursa Malaysia, harga saham disebut bagi setiap unit dalam Ringgit Malaysia, tetapi pesanan biasa dibuat dalam gandaan 1 lot dagangan (100 unit). Kuantiti bawah 100 unit didagangkan sebagai lot ganjil dengan kecairan yang lebih rendah.',
    exampleEng:
      'If MAYBANK trades at RM 10.00 per share, buying 1 lot (100 units) costs RM 1,000 before fees.',
    exampleBm:
      'Jika harga MAYBANK ialah RM 10.00 sesaham, pembelian 1 lot (100 unit) berharga RM 1,000 sebelum yuran.'
  },
  {
    id: 'cds-account',
    category: 'Basics',
    termEng: 'CDS Account',
    termBm: 'Akaun CDS',
    shortEng: 'Your electronic account with Bursa Malaysia Depository that holds your shares.',
    shortBm: 'Akaun elektronik anda dengan Bursa Malaysia Depository yang menyimpan pegangan saham anda.',
    detailEng:
      'The Central Depository System (CDS) replaces physical paper share certificates with electronic records. You must open a CDS account (Direct or Nominee) alongside a trading account through a licensed Malaysian stockbroker before buying Bursa stocks.',
    detailBm:
      'Sistem Depositori Pusat (CDS) menggantikan sijil saham kertas dengan rekod elektronik. Anda perlu membuka akaun CDS (Langsung atau Nomini) bersama akaun dagangan melalui broker saham berlesen di Malaysia sebelum membeli saham Bursa.',
    exampleEng:
      'When you buy 5 lots of TENAGA via your broker app, those 500 units are credited into your CDS account after settlement.',
    exampleBm:
      'Apabila anda membeli 5 lot TENAGA melalui aplikasi broker, 500 unit tersebut dikreditkan ke dalam akaun CDS anda selepas penyelesaian.'
  },
  {
    id: 'dividend-yield',
    category: 'Valuation',
    termEng: 'Dividend Yield (DY)',
    termBm: 'Hasil Dividen (DY)',
    shortEng: 'Annual cash dividend expressed as a percentage of the current share price.',
    shortBm: 'Dividen tunai tahunan yang dinyatakan sebagai peratusan daripada harga saham semasa.',
    detailEng:
      'Calculated as (Annual Dividend per Share / Current Share Price) x 100%. Under Malaysia’s single-tier tax system, cash dividends paid by listed companies are generally tax-exempt for individual investors. Always check earnings sustainability to avoid dividend traps.',
    detailBm:
      'Dikira sebagai (Dividen Tahunan Sesaham / Harga Saham Semasa) x 100%. Di bawah sistem cukai satu peringkat Malaysia, dividen tunai syarikat tersenarai umumnya dikecualikan cukai bagi pelabur individu. Sentiasa semak kemampanan keuntungan untuk mengelakkan perangkap dividen.',
    exampleEng:
      'A stock priced at RM 5.00 paying RM 0.25 in total annual dividends has a Dividend Yield of 5.0%.',
    exampleBm:
      'Saham berharga RM 5.00 yang membayar jumlah dividen tahunan RM 0.25 mempunyai Hasil Dividen sebanyak 5.0%.'
  },
  {
    id: 'ex-date',
    category: 'Trading',
    termEng: 'Ex-Date (Ex-Dividend Date)',
    termBm: 'Tarikh Ex (Tarikh Tanpa Dividen)',
    shortEng: 'The first trading day a stock trades without entitlement to the upcoming dividend.',
    shortBm: 'Hari dagangan pertama sesuatu saham didagangkan tanpa kelayakan dividen yang akan datang.',
    detailEng:
      'Under Bursa Malaysia’s T+2 settlement cycle, you must buy and hold shares before the Ex-Date (on or before the Cum-Date) to appear on the Record of Depositors on Entitlement Date. Buying on or after the Ex-Date means the seller keeps that dividend.',
    detailBm:
      'Di bawah kitaran penyelesaian T+2 Bursa Malaysia, anda mesti membeli dan memegang saham sebelum Tarikh Ex (pada atau sebelum Tarikh Cum) untuk tersenarai pada Tarikh Kelayakan. Membeli pada atau selepas Tarikh Ex bermakna penjual mengekalkan dividen tersebut.',
    exampleEng:
      'If a stock’s Ex-Date is Thursday, you must buy the shares by Wednesday’s market close to receive the dividend.',
    exampleBm:
      'Jika Tarikh Ex sesuatu saham ialah Khamis, anda mesti membeli saham sebelum penutupan pasaran hari Rabu untuk menerima dividen.'
  },
  {
    id: 'pe-ratio',
    category: 'Valuation',
    termEng: 'P/E Ratio',
    termBm: 'Nisbah P/E (Harga kepada Perolehan)',
    shortEng: 'Compares a stock’s share price to its annual earnings per share.',
    shortBm: 'Membandingkan harga sesaham dengan perolehan tahunan sesaham syarikat.',
    detailEng:
      'Price-to-Earnings Ratio = Share Price / Earnings Per Share (EPS). It shows how many Ringgit investors pay for RM 1.00 of annual net profit. A lower P/E may signal undervaluation, while a higher P/E often reflects stronger growth expectations.',
    detailBm:
      'Nisbah Harga kepada Perolehan = Harga Saham / Perolehan Sesaham (EPS). Ia menunjukkan berapa Ringgit pelabur sanggup bayar untuk RM 1.00 keuntungan bersih tahunan. P/E rendah boleh menandakan penilaian murah, manakala P/E tinggi sering mencerminkan jangkaan pertumbuhan lebih tinggi.',
    exampleEng:
      'A company trading at RM 6.00 with an EPS of RM 0.40 has a P/E Ratio of 15x.',
    exampleBm:
      'Syarikat yang didagangkan pada RM 6.00 dengan EPS RM 0.40 mempunyai Nisbah P/E sebanyak 15x.'
  },
  {
    id: 'eps',
    category: 'Valuation',
    termEng: 'Earnings Per Share (EPS)',
    termBm: 'Perolehan Sesaham (EPS)',
    shortEng: 'The portion of a company’s net profit allocated to each ordinary share.',
    shortBm: 'Bahagian keuntungan bersih syarikat yang diperuntukkan kepada setiap saham biasa.',
    detailEng:
      'Calculated as Net Profit Attributable to Shareholders divided by the weighted average number of shares in issue. Rising EPS over consecutive quarters usually points to healthy core profitability and supports share price growth.',
    detailBm:
      'Dikira sebagai Keuntungan Bersih Milik Pemegang Saham dibahagikan dengan purata berwajaran bilangan saham terbitan. EPS yang meningkat secara konsisten menandakan kecekapan keuntungan teras yang sihat dan menyokong kenaikan harga saham.',
    exampleEng:
      'If a Bursa company earns RM 200 million net profit with 1 billion shares issued, its EPS is RM 0.20 (20 sen).',
    exampleBm:
      'Jika syarikat Bursa meraih keuntungan bersih RM 200 juta dengan 1 bilion saham terbitan, EPS ialah RM 0.20 (20 sen).'
  },
  {
    id: 'market-cap',
    category: 'Valuation',
    termEng: 'Market Capitalization',
    termBm: 'Permodalan Pasaran',
    shortEng: 'The total market value of a listed company’s issued shares.',
    shortBm: 'Jumlah nilai pasaran bagi semua saham terbitan sesebuah syarikat tersenarai.',
    detailEng:
      'Market Cap = Current Share Price x Total Issued Shares. Investors use it—not share price alone—to judge company size across small-cap, mid-cap, and large-cap tiers on Bursa Malaysia.',
    detailBm:
      'Permodalan Pasaran = Harga Saham Semasa x Jumlah Saham Terbitan. Pelabur menggunakannya—bukan harga sesaham semata-mata—untuk menilai saiz syarikat antara kategori modal kecil, sederhana, dan besar di Bursa Malaysia.',
    exampleEng:
      'A company with 2 billion shares trading at RM 1.50 has a Market Cap of RM 3.0 billion, larger than a RM 10.00 stock with only 50 million shares (RM 500 million).',
    exampleBm:
      'Syarikat dengan 2 bilion saham pada harga RM 1.50 mempunyai Permodalan Pasaran RM 3.0 bilion, lebih besar daripada saham RM 10.00 yang hanya mempunyai 50 juta saham (RM 500 juta).'
  },
  {
    id: 'shariah-compliant',
    category: 'Shariah & MY',
    termEng: 'Shariah-Compliant (SC List)',
    termBm: 'Patuh Syariah (Senarai SC)',
    shortEng: 'Bursa stocks approved by the Securities Commission Malaysia’s Shariah Advisory Council.',
    shortBm: 'Saham Bursa yang diluluskan oleh Majlis Penasihat Syariah Suruhanjaya Sekuriti Malaysia.',
    detailEng:
      'The Shariah Advisory Council (SAC) of the Securities Commission Malaysia reviews listed stocks twice a year (May and November). Companies must pass both business activity benchmarks (5% and 20% thresholds) and financial ratio limits (cash and conventional debt below 33% of total assets).',
    detailBm:
      'Majlis Penasihat Syariah (MPS) Suruhanjaya Sekuriti Malaysia menyemak saham tersenarai dua kali setahun (Mei dan November). Syarikat mesti melepasi penanda aras aktiviti perniagaan (had 5% dan 20%) serta nisbah kewangan (tunai dan hutang konvensional di bawah 33% daripada jumlah aset).',
    exampleEng:
      'Stocks marked [S] on Malaysian broker platforms, such as TENAGA or MAXIS, appear on the latest SC Shariah-compliant list.',
    exampleBm:
      'Saham bertanda [S] di platform broker Malaysia, seperti TENAGA atau MAXIS, tersenarai dalam senarai patuh Syariah SC terkini.'
  },
  {
    id: 'blue-chip',
    category: 'Basics',
    termEng: 'Blue-Chip Stock',
    termBm: 'Saham Cip Biru',
    shortEng: 'Shares of large, financially strong companies with proven track records.',
    shortBm: 'Saham syarikat besar yang kukuh dari segi kewangan dengan rekod prestasi yang terbukti.',
    detailEng:
      'Blue-chip companies typically lead their industries, maintain steady cash flows, and pay regular dividends through market cycles. While generally less volatile than ACE Market or small-cap counters, their prices can still decline during economic downturns.',
    detailBm:
      'Syarikat cip biru lazimnya menerajui industri masing-masing, mengekalkan aliran tunai yang stabil, dan membayar dividen berkala merentas kitaran pasaran. Walaupun kurang meruap berbanding kaunter Pasaran ACE atau modal kecil, harganya masih boleh susut semasa kemelesetan ekonomi.',
    exampleEng:
      'Major Malaysian banks and utilities such as MAYBANK, PBBANK, and PETGAS are widely regarded as local blue-chip stocks.',
    exampleBm:
      'Bank dan syarikat utiliti utama Malaysia seperti MAYBANK, PBBANK, dan PETGAS sering dianggap sebagai saham cip biru tempatan.'
  },
  {
    id: 'dca',
    category: 'Basics',
    termEng: 'Dollar-Cost Averaging (DCA)',
    termBm: 'Pemurataan Kos Dolar (DCA)',
    shortEng: 'Investing a fixed Ringgit amount on a regular schedule regardless of share price.',
    shortBm: 'Melabur jumlah Ringgit yang tetap secara berkala tanpa mengira turun naik harga saham.',
    detailEng:
      'By investing consistently every month, you automatically buy more shares when prices dip and fewer shares when prices rise. This reduces the risk of mistiming the market, though on Bursa Malaysia investors should also watch minimum brokerage fees on small orders.',
    detailBm:
      'Dengan melabur secara konsisten setiap bulan, anda secara automatik membeli lebih banyak unit apabila harga rendah dan lebih sedikit apabila harga tinggi. Ini mengurangkan risiko tersalah masa pasaran, namun di Bursa Malaysia pelabur perlu peka terhadap yuran broker minimum bagi pesanan kecil.',
    exampleEng:
      'Allocating RM 1,000 every payday into a chosen stock or ETF builds your position steadily without guessing market tops or bottoms.',
    exampleBm:
      'Memperuntukkan RM 1,000 setiap hari gaji ke dalam saham atau ETF pilihan membina pegangan anda secara berdisiplin tanpa meneka puncak atau dasar pasaran.'
  },
  {
    id: 'fbm-klci',
    category: 'Shariah & MY',
    termEng: 'FBM KLCI',
    termBm: 'FBM KLCI',
    shortEng: 'Malaysia’s benchmark stock index tracking the 30 largest Main Market companies.',
    shortBm: 'Indeks penanda aras pasaran saham Malaysia yang menjejaki 30 syarikat terbesar Pasaran Utama.',
    detailEng:
      'The FTSE Bursa Malaysia KLCI measures the overall performance of Bursa Malaysia’s top 30 eligible companies ranked by full market capitalization and reviewed semi-annually. Investors use it as a barometer for local equity market sentiment.',
    detailBm:
      'FTSE Bursa Malaysia KLCI mengukur prestasi keseluruhan 30 syarikat teratas Bursa Malaysia yang layak mengikut permodalan pasaran penuh dan disemak dua kali setahun. Pelabur menggunakannya sebagai barometer sentimen pasaran ekuiti tempatan.',
    exampleEng:
      'If the FBM KLCI rises from 1,580 to 1,620 points (+2.5%), major index constituents like MAYBANK, CIMB, and TENAGA are generally trending higher.',
    exampleBm:
      'Jika FBM KLCI meningkat daripada 1,580 kepada 1,620 mata (+2.5%), komponen utama indeks seperti MAYBANK, CIMB, dan TENAGA lazimnya turut meningkat.'
  },
  {
    id: 'brokerage-stamp-duty',
    category: 'Shariah & MY',
    termEng: 'Brokerage & Stamp Duty',
    termBm: 'Yuran Brokeraj & Duti Setem',
    shortEng: 'Mandatory transaction costs paid whenever you buy or sell Bursa Malaysia shares.',
    shortBm: 'Kos transaksi wajib yang dibayar setiap kali anda membeli atau menjual saham Bursa Malaysia.',
    detailEng:
      'Every trade incurs broker’s commission (often 0.05% to 0.42% with a minimum fee), a 0.03% Bursa clearing fee (capped at RM 1,000 per contract), and stamp duty (RM 1.50 per RM 1,000 or part thereof of contract value, capped at RM 1,000 per contract for shares). Understanding these fees prevents small trades from losing too much to friction.',
    detailBm:
      'Setiap dagangan melibatkan komisen broker (lazimnya 0.05% hingga 0.42% dengan fi minimum), fi penjelasan Bursa 0.03% (dihadkan pada RM 1,000 setiap kontrak), dan duti setem (RM 1.50 bagi setiap RM 1,000 nilai kontrak atau sebahagiannya, dihadkan pada RM 1,000 setiap kontrak saham). Memahami kos ini mengelakkan dagangan kecil terhakis oleh caj.',
    exampleEng:
      'On a RM 2,000 stock purchase, paying an RM 8.00 minimum brokerage, RM 0.60 clearing fee, and RM 3.00 stamp duty means total buy fees are RM 11.60 (about 0.58%).',
    exampleBm:
      'Bagi pembelian saham bernilai RM 2,000, caj broker minimum RM 8.00, fi penjelasan RM 0.60, dan duti setem RM 3.00 menjadikan jumlah kos belian RM 11.60 (sekitar 0.58%).'
  },
  {
    id: 'roe',
    category: 'Valuation',
    termEng: 'Return on Equity (ROE)',
    termBm: 'Pulangan atas Ekuiti (ROE)',
    shortEng: 'Measures how efficiently a company generates profit from shareholders’ equity.',
    shortBm: 'Mengukur kecekapan syarikat menjana keuntungan daripada ekuiti pemegang saham.',
    detailEng:
      'ROE = (Net Profit / Shareholders’ Equity) x 100%. Consistently strong ROE (for example above 12% to 15%) often indicates a durable competitive advantage, though investors should check debt levels because high borrowing can artificially inflate ROE.',
    detailBm:
      'ROE = (Keuntungan Bersih / Ekuiti Pemegang Saham) x 100%. ROE yang kukuh secara konsisten (contohnya melebihi 12% hingga 15%) sering menunjukkan kelebihan daya saing yang mampan, namun pelabur perlu menyemak tahap hutang kerana pinjaman tinggi boleh menaikkan ROE secara buatan.',
    exampleEng:
      'A company earning RM 150 million net profit on RM 1.0 billion of shareholders’ equity delivers an ROE of 15.0%.',
    exampleBm:
      'Syarikat yang menjana keuntungan bersih RM 150 juta atas ekuiti pemegang saham RM 1.0 bilion mencatat ROE sebanyak 15.0%.'
  },
  {
    id: 'limit-vs-market-order',
    category: 'Trading',
    termEng: 'Limit Order vs. Market Order',
    termBm: 'Pesanan Had lwn. Pesanan Pasaran',
    shortEng: 'Control your exact execution price with a limit order or prioritize instant fill with a market order.',
    shortBm: 'Kawal harga pelaksanaan tepat dengan pesanan had atau utamakan padanan segera dengan pesanan pasaran.',
    detailEng:
      'A Limit Order lets you set the maximum price you will pay to buy or the minimum price you will accept to sell, protecting against sudden price spikes in thin order books. A Market Order executes immediately against the best available queued price, risking slippage on less liquid counters.',
    detailBm:
      'Pesanan Had membolehkan anda menetapkan harga maksimum belian atau harga minimum jualan untuk melindungi daripada lonjakan harga mendadak dalam buku pesanan nipis. Pesanan Pasaran dilaksanakan serta-merta pada harga terbaik sedia ada, dengan risiko gelinciran harga pada kaunter kurang cair.',
    exampleEng:
      'If a stock’s best seller asks RM 2.05 while the buyer bids RM 2.02, placing a Buy Limit at RM 2.02 waits for a seller at that price instead of immediately paying RM 2.05.',
    exampleBm:
      'Jika penjual terbaik menawarkan RM 2.05 manakala pembeli membida RM 2.02, meletakkan Pesanan Had Beli pada RM 2.02 akan menunggu penjual pada harga tersebut berbanding terus membayar RM 2.05.'
  },
  {
    id: 'cut-loss',
    category: 'Trading',
    termEng: 'Cut Loss (Stop-Loss)',
    termBm: 'Potong Rugi (Henti Rugi)',
    shortEng: 'A pre-defined price level to sell a losing stock and cap downside risk.',
    shortBm: 'Paras harga yang ditetapkan awal untuk menjual saham rugi bagi mengehadkan risiko kerugian.',
    detailEng:
      'Setting a cut-loss point before entering a trade removes emotional hesitation when a company’s thesis breaks or a downtrend worsens. Preserving capital keeps small losses from compounding into deep drawdowns that take much larger percentage gains to recover.',
    detailBm:
      'Menetapkan paras potong rugi sebelum memulakan dagangan mengelakkan keraguan emosi apabila tesis pelaburan gagal atau aliran menurun berlarutan. Mengekalkan modal mengelakkan kerugian kecil bertukar menjadi susut nilai besar yang sukar dipulihkan.',
    exampleEng:
      'Buying 10 lots at RM 1.00 (RM 1,000) with an 8% cut-loss at RM 0.92 caps your loss near RM 80 instead of risking a 40% drop to RM 0.60.',
    exampleBm:
      'Membeli 10 lot pada RM 1.00 (RM 1,000) dengan had potong rugi 8% pada RM 0.92 mengehadkan kerugian sekitar RM 80 berbanding menanggung kejatuhan 40% ke RM 0.60.'
  }
];
