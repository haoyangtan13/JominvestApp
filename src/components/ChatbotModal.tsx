import { useState, useRef, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import { stocks as defaultStocks, type StockData } from '../data/stocks';
import type { PortfolioItem } from '../App';

export interface ChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'ENG' | 'BM';
  stocks?: StockData[];
  portfolio?: PortfolioItem[];
  cashBalance?: number;
  userProfile?: string;
  userName?: string;
}

interface Message {
  role: 'ai' | 'user';
  content: string;
  isTabular?: boolean;
}

export function ChatbotModal({
  isOpen,
  onClose,
  language,
  stocks = defaultStocks,
  portfolio = [],
  cashBalance = 10000,
  userProfile = 'Jom-Explorer (Aggressive)',
  userName = 'Tan'
}: ChatbotModalProps) {
  const firstName = (userName || 'Tan').split(' ')[0];

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'ai',
      content:
        language === 'ENG'
          ? `Greetings, ${firstName}. JomAI Research Copilot is synchronized with ${stocks.length} Bursa Malaysia securities and your live portfolio ledger. Query any issuer ticker, compare multiples, audit sector concentration, or verify SAC Shariah standing.`
          : `Salam sejahtera, ${firstName}. Pembantu Penyelidikan JomAI diselaraskan dengan ${stocks.length} sekuriti Bursa Malaysia dan lejar portfolio anda. Tanya mengenai sebarang saham, perbandingan gandaan, atau saringan Syariah MPS.`
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const texts = {
    ENG: {
      kicker: 'JOMAI · BURSA RESEARCH COPILOT',
      title: 'Institutional Research & Ledger Desk',
      placeholder: 'Query ticker (e.g. MAYBANK, TENAGA), compare multiples, or audit portfolio...',
      quickPromptsLabel: 'RESEARCH PROMPTS',
      quickReplies: [
        'Audit my portfolio',
        'Top dividend yields',
        'SAC Shariah issuers',
        'Compare MAYBANK vs CIMB',
        'Bursa contract fee schedule'
      ]
    },
    BM: {
      kicker: 'JOMAI · PEMBANTU PENYELIDIKAN BURSA',
      title: 'Meja Penyelidikan & Lejar Institusi',
      placeholder: 'Tanya kaunter (cth. MAYBANK, TENAGA), bandingkan gandaan, atau audit portfolio...',
      quickPromptsLabel: 'ARAHAN PANTAS',
      quickReplies: [
        'Audit portfolio saya',
        'Hasil dividen tertinggi',
        'Sekuriti patuh Syariah MPS',
        'Bandingkan MAYBANK vs CIMB',
        'Jadual yuran kontrak Bursa'
      ]
    }
  };

  const t = texts[language];
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const buildSmartResponse = (rawText: string): { content: string; isTabular: boolean } => {
    const lowerText = rawText.toLowerCase();

    // 1. Check if user mentions 1 or 2 stocks from `stocks`
    const matchedStocks = stocks.filter(s => {
      const tickerMatch = lowerText.includes(s.ticker.toLowerCase());
      const nameParts = s.name
        .toLowerCase()
        .replace(/berhad|bhd|malaysia|\(.*?\)/g, '')
        .trim()
        .split(/\s+/)
        .filter(w => w.length >= 4);
      const nameMatch = nameParts.some(part => lowerText.includes(part));
      return tickerMatch || nameMatch;
    });

    if (matchedStocks.length >= 2) {
      const [s1, s2] = matchedStocks;
      const r1 = Math.round(
        (s1.radarScores.value +
          s1.radarScores.growth +
          s1.radarScores.health +
          s1.radarScores.dividend +
          s1.radarScores.momentum) /
          5
      );
      const r2 = Math.round(
        (s2.radarScores.value +
          s2.radarScores.growth +
          s2.radarScores.health +
          s2.radarScores.dividend +
          s2.radarScores.momentum) /
          5
      );
      const content =
        language === 'ENG'
          ? `HEAD-TO-HEAD EQUITY COMPARISON: ${s1.ticker} vs ${s2.ticker}\n\n` +
            `01 / ${s1.name} (${s1.ticker} · ${s1.bursaCode})\n` +
            `Spot: RM ${s1.price} (${s1.changePercent}) | P/E: ${s1.peRatio}x | Yield: ${s1.dividendYield} | D/E: ${s1.debtEquity} | ${s1.isShariah ? 'SAC SHARIAH' : 'CONVENTIONAL'} | Composite Score: ${r1}/100\n\n` +
            `02 / ${s2.name} (${s2.ticker} · ${s2.bursaCode})\n` +
            `Spot: RM ${s2.price} (${s2.changePercent}) | P/E: ${s2.peRatio}x | Yield: ${s2.dividendYield} | D/E: ${s2.debtEquity} | ${s2.isShariah ? 'SAC SHARIAH' : 'CONVENTIONAL'} | Composite Score: ${r2}/100\n\n` +
            `DESK VERDICT: ${
              parseFloat(s1.dividendYield) > parseFloat(s2.dividendYield)
                ? `${s1.ticker} leads on indicated dividend distribution (${s1.dividendYield})`
                : `${s2.ticker} leads on indicated dividend distribution (${s2.dividendYield})`
            }, while ${
              s1.radarScores.growth >= s2.radarScores.growth ? s1.ticker : s2.ticker
            } exhibits superior earnings growth momentum.`
          : `PERBANDINGAN EKUITI: ${s1.ticker} lwn ${s2.ticker}\n\n` +
            `01 / ${s1.name} (${s1.ticker} · ${s1.bursaCode})\n` +
            `Harga: RM ${s1.price} (${s1.changePercent}) | P/E: ${s1.peRatio}x | Dividen: ${s1.dividendYield} | ${s1.isShariah ? 'SAC SHARIAH' : 'KONVENSIONAL'} | Skor: ${r1}/100\n\n` +
            `02 / ${s2.name} (${s2.ticker} · ${s2.bursaCode})\n` +
            `Harga: RM ${s2.price} (${s2.changePercent}) | P/E: ${s2.peRatio}x | Dividen: ${s2.dividendYield} | ${s2.isShariah ? 'SAC SHARIAH' : 'KONVENSIONAL'} | Skor: ${r2}/100`;

      return { content, isTabular: true };
    }

    if (matchedStocks.length === 1) {
      const s = matchedStocks[0];
      const avgRadar = Math.round(
        (s.radarScores.value +
          s.radarScores.growth +
          s.radarScores.health +
          s.radarScores.dividend +
          s.radarScores.momentum) /
          5
      );
      const content =
        language === 'ENG'
          ? `ISSUER BRIEF: ${s.name} (${s.ticker} / ${s.bursaCode})\n` +
            `Sector: ${s.sector} | Classification: ${s.isShariah ? 'SAC SHARIAH' : 'CONVENTIONAL'}\n` +
            `Spot Price: RM ${s.price} (${s.changePercent}) | 1 Board Lot (100 sh): RM ${(parseFloat(s.price) * 100).toFixed(2)}\n` +
            `Multiples: P/E ${s.peRatio}x | Indicated Yield: ${s.dividendYield} | Debt/Equity: ${s.debtEquity}\n` +
            `FY Financials: Revenue ${s.revenue} | Net Profit ${s.netProfit}\n\n` +
            `THESIS (${avgRadar}/100): ${s.description}`
          : `NOTA PENERBIT: ${s.name} (${s.ticker} / ${s.bursaCode})\n` +
            `Sektor: ${s.sector} | Status: ${s.isShariah ? 'SAC SHARIAH' : 'KONVENSIONAL'}\n` +
            `Harga Semasa: RM ${s.price} (${s.changePercent}) | 1 Lot (100 unit): RM ${(parseFloat(s.price) * 100).toFixed(2)}\n` +
            `Gandaan: P/E ${s.peRatio}x | Kadar Dividen: ${s.dividendYield} | Hutang/Ekuiti: ${s.debtEquity}\n` +
            `Kewangan: Hasil ${s.revenue} | Untung Bersih ${s.netProfit}`;

      return { content, isTabular: true };
    }

    // 2. Portfolio Audit
    if (
      lowerText.includes('portfolio') ||
      lowerText.includes('pegangan') ||
      lowerText.includes('audit') ||
      lowerText.includes('analyze my') ||
      lowerText.includes('check my')
    ) {
      const holdingsValue = portfolio.reduce(
        (acc, item) => acc + parseFloat(item.stock.price) * item.quantity,
        0
      );
      const totalEquity = holdingsValue + cashBalance;
      if (portfolio.length === 0) {
        const content =
          language === 'ENG'
            ? `PORTFOLIO LEDGER AUDIT (${firstName} · ${userProfile})\n` +
              `Open Positions: 0 securities\n` +
              `Available Buying Power: RM ${cashBalance.toFixed(2)} (100% cash reserve)\n\n` +
              `RECOMMENDATION: Deploy initial capital across 3 uncorrelated Bursa sectors via the Market Screener or Conviction Notes to establish baseline yield and growth exposure.`
            : `AUDIT LEJAR PORTFOLIO (${firstName} · ${userProfile})\n` +
              `Posisi Terbuka: 0 sekuriti\n` +
              `Kuasa Beli Tersedia: RM ${cashBalance.toFixed(2)} (100% rizab tunai)\n\n` +
              `CADANGAN: Mulakan pelaburan merentasi 3 sektor Bursa melalui Saringan Pasaran.`;
        return { content, isTabular: true };
      }

      const sectors: Record<string, number> = {};
      portfolio.forEach(item => {
        const val = parseFloat(item.stock.price) * item.quantity;
        sectors[item.stock.sector] = (sectors[item.stock.sector] || 0) + val;
      });
      const sortedSectors = Object.entries(sectors).sort((a, b) => b[1] - a[1]);
      const topSector = sortedSectors[0];
      const topSectorPct = Math.round((topSector[1] / holdingsValue) * 100);
      const holdingsSummary = portfolio
        .map(i => `${i.stock.ticker} (${i.quantity} sh)`)
        .join(', ');

      const content =
        language === 'ENG'
          ? `PORTFOLIO LEDGER AUDIT (${firstName} · ${userProfile})\n` +
            `Total Net Liquidity: RM ${totalEquity.toFixed(2)}\n` +
            `Holdings Value: RM ${holdingsValue.toFixed(2)} | Buying Power: RM ${cashBalance.toFixed(2)}\n` +
            `Open Positions (${portfolio.length}): ${holdingsSummary}\n` +
            `Lead Sector Exposure: ${topSector[0]} (${topSectorPct}% across ${sortedSectors.length} sector(s))\n\n` +
            `RISK NOTE: ${
              sortedSectors.length < 3
                ? 'Portfolio spans fewer than 3 sectors. Add an uncorrelated sector to reach institutional diversification standards.'
                : 'Multi-sector diversification across 3+ industries is optimal.'
            }`
          : `AUDIT LEJAR PORTFOLIO (${firstName} · ${userProfile})\n` +
            `Jumlah Kecairan Bersih: RM ${totalEquity.toFixed(2)}\n` +
            `Nilai Pegangan: RM ${holdingsValue.toFixed(2)} | Kuasa Beli: RM ${cashBalance.toFixed(2)}\n` +
            `Posisi Aktif (${portfolio.length}): ${holdingsSummary}\n` +
            `Sektor Utama: ${topSector[0]} (${topSectorPct}% merentasi ${sortedSectors.length} sektor).`;

      return { content, isTabular: true };
    }

    // 3. Shariah / SAC Screening
    if (
      lowerText.includes('shariah') ||
      lowerText.includes('syariah') ||
      lowerText.includes('sac') ||
      lowerText.includes('halal') ||
      lowerText.includes('islamic')
    ) {
      const shariahStocks = stocks.filter(s => s.isShariah).slice(0, 6);
      const listStr = shariahStocks
        .map(s => `${s.ticker} (RM ${s.price} · Yield ${s.dividendYield})`)
        .join('\n• ');
      const content =
        language === 'ENG'
          ? `SAC SHARIAH SCREENING METHODOLOGY (SC MALAYSIA)\n` +
            `The Securities Commission Shariah Advisory Council audits issuers semi-annually against business activity benchmarks (5% / 20%) and financial ratio ceilings (<33% conventional debt and cash over total assets).\n\n` +
            `SELECTED SAC SHARIAH ISSUERS:\n• ${listStr}`
          : `METODOLOGI SARINGAN SYARIAH MPS (SC MALAYSIA)\n` +
            `Majlis Penasihat Syariah SC menyaring sekuriti berdasarkan penanda aras aktiviti perniagaan dan nisbah kewangan (<33% hutang & tunai konvensional).\n\n` +
            `SEKURITI PATUH SYARIAH MPS:\n• ${listStr}`;
      return { content, isTabular: true };
    }

    // 4. Dividend Yield Inquiry
    if (
      lowerText.includes('dividend') ||
      lowerText.includes('dividen') ||
      lowerText.includes('passive') ||
      lowerText.includes('yield')
    ) {
      const topDiv = [...stocks]
        .sort(
          (a, b) =>
            parseFloat(b.dividendYield.replace('%', '')) -
            parseFloat(a.dividendYield.replace('%', ''))
        )
        .slice(0, 5);
      const divList = topDiv
        .map(s => `• ${s.ticker} (${s.bursaCode}): ${s.dividendYield} yield @ RM ${s.price}`)
        .join('\n');
      const content =
        language === 'ENG'
          ? `HIGHEST INDICATED DIVIDEND YIELDS (BURSA MALAYSIA)\n${divList}\n\n` +
            `NOTE: Malaysia operates a Single-Tier Dividend System; distributions are tax-exempt for retail shareholders.`
          : `HASIL DIVIDEN TERTINGGI (BURSA MALAYSIA)\n${divList}\n\n` +
            `NOTA: Malaysia mengamalkan Sistem Dividen Satu Peringkat yang dikecualikan cukai.`;
      return { content, isTabular: true };
    }

    // 5. Fees / Board Lot / Contract Note Schedule
    if (
      lowerText.includes('fee') ||
      lowerText.includes('yuran') ||
      lowerText.includes('lot') ||
      lowerText.includes('broker') ||
      lowerText.includes('stamp') ||
      lowerText.includes('contract') ||
      lowerText.includes('kos')
    ) {
      const content =
        language === 'ENG'
          ? `BURSA MALAYSIA CONTRACT NOTE & FEE SCHEDULE\n` +
            `01 / Standard Board Lot: 100 shares per lot (e.g. 100 sh @ RM 5.00 = RM 500.00 principal).\n` +
            `02 / Brokerage Fee: 0.10% of gross contract value (minimum RM 1.00).\n` +
            `03 / Clearing Fee: 0.03% of gross contract value (capped at RM 1,000.00).\n` +
            `04 / Stamp Duty: RM 1.00 per RM 1,000.00 (or fractional part) of contract value.\n\n` +
            `All simulated executions in JomINVEST automatically compute and deduct these exact statutory charges.`
          : `JADUAL LOT & YURAN NOTA KONTRAK BURSA MALAYSIA\n` +
            `01 / Saiz Lot Standard: 100 unit saham setiap lot.\n` +
            `02 / Yuran Broker: 0.10% daripada nilai kasar kontrak (minimum RM 1.00).\n` +
            `03 / Yuran Penjelasan: 0.03% daripada nilai kasar kontrak.\n` +
            `04 / Duti Setem: RM 1.00 bagi setiap RM 1,000.00 nilai kontrak.`;
      return { content, isTabular: true };
    }

    const content =
      language === 'ENG'
        ? `JomAI Research Copilot is ready to query all ${stocks.length} Bursa Malaysia issuers. Try entering:\n• "Compare MAYBANK vs CIMB"\n• "TENAGA" or "GAMUDA"\n• "Audit my portfolio"\n• "Top dividend yields" or "SAC Shariah issuers"`
        : `Pembantu Penyelidikan JomAI sedia menganalisis ${stocks.length} sekuriti Bursa Malaysia. Cuba tanya:\n• "Bandingkan MAYBANK vs CIMB"\n• "TENAGA" atau "GAMUDA"\n• "Audit portfolio saya"\n• "Hasil dividen tertinggi"`;

    return { content, isTabular: false };
  };

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    const newUserMsg: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const aiResponse = buildSmartResponse(text);
      const newAiMsg: Message = {
        role: 'ai',
        content: aiResponse.content,
        isTabular: aiResponse.isTabular
      };
      setMessages(prev => [...prev, newAiMsg]);
      setIsTyping(false);
    }, 450);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSendMessage(inputValue);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px]"
        onClick={onClose}
      />

      {/* Slide-Over Research Copilot Drawer */}
      <aside
        className="fixed inset-y-0 right-0 z-50 w-full max-w-md border-l flex flex-col shadow-2xl"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-hairline)',
          color: 'var(--ink-primary)'
        }}
      >
        {/* Drawer Header */}
        <div
          className="p-5 border-b flex items-start justify-between gap-3"
          style={{
            borderColor: 'var(--border-hairline)',
            backgroundColor: 'var(--bg-elevated)'
          }}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="jom-kicker">{t.kicker}</span>
              <span className="jom-tag jom-tag-shariah">KLSE DATA LINKED</span>
            </div>
            <h3 className="font-editorial text-2xl">{t.title}</h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="jom-btn py-1.5 px-2.5"
            title="Close Copilot Drawer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((message, index) => {
            const isUser = message.role === 'user';
            return (
              <div
                key={index}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div className="jom-kicker mb-1 px-0.5">
                  {isUser ? 'INVESTOR QUERY' : 'JOMAI DESK NOTE'}
                </div>
                <div
                  className={`max-w-[92%] rounded-lg p-3.5 border text-xs leading-relaxed whitespace-pre-line ${
                    message.isTabular ? 'font-tabular' : ''
                  }`}
                  style={
                    isUser
                      ? {
                          backgroundColor: 'var(--ink-primary)',
                          color: 'var(--ink-inverse)',
                          borderColor: 'var(--ink-primary)'
                        }
                      : {
                          backgroundColor: 'var(--bg-subtle)',
                          color: 'var(--ink-primary)',
                          borderColor: 'var(--border-hairline)'
                        }
                  }
                >
                  {message.content}
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex flex-col items-start">
              <div className="jom-kicker mb-1">JOMAI DESK NOTE</div>
              <div className="jom-panel-subtle px-3.5 py-2.5 font-tabular text-xs" style={{ color: 'var(--ink-secondary)' }}>
                Querying Bursa Malaysia multiples & position ledger...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Prompt Pills */}
        <div
          className="px-5 py-3 border-t space-y-2"
          style={{
            borderColor: 'var(--border-hairline)',
            backgroundColor: 'var(--bg-elevated)'
          }}
        >
          <div className="jom-kicker">{t.quickPromptsLabel}</div>
          <div className="flex flex-wrap gap-1.5">
            {t.quickReplies.map((reply, index) => (
              <button
                key={index}
                type="button"
                className="jom-btn py-1 px-2.5 text-xs"
                onClick={() => handleSendMessage(reply)}
              >
                {reply}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div
          className="p-4 border-t flex items-center gap-2"
          style={{
            borderColor: 'var(--border-hairline)',
            backgroundColor: 'var(--bg-surface)'
          }}
        >
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isTyping ? 'Compiling response...' : t.placeholder}
            disabled={isTyping}
            className="jom-input flex-1"
          />
          <button
            type="button"
            className="jom-btn jom-btn-primary py-2 px-3.5"
            onClick={() => handleSendMessage(inputValue)}
            disabled={isTyping || !inputValue.trim()}
          >
            <Send size={14} />
          </button>
        </div>
      </aside>
    </>
  );
}
