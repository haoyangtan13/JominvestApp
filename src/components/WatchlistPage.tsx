import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Trash2, Plus, Search, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { StockData } from '../data/stocks';
import { Screen } from '../App';
import { searchBursaStocksOnDemand } from '../services/bursaService';

interface WatchlistPageProps {
  navigateTo: (screen: Screen) => void;
  language: 'ENG' | 'BM';
  stocks: StockData[];
  watchlist: StockData[];
  addToWatchlist: (stock: StockData) => void;
  removeFromWatchlist: (stockId: string) => void;
  setSelectedStock: (stock: StockData) => void;
}

export function WatchlistPage({
  navigateTo,
  language,
  stocks,
  watchlist,
  addToWatchlist,
  removeFromWatchlist,
  setSelectedStock
}: WatchlistPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [onDemandResults, setOnDemandResults] = useState<StockData[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const texts = {
    ENG: {
      title: 'My Watchlist',
      back: 'Back to Dashboard',
      addStock: 'Add Bursa Malaysia Stock',
      searchPlaceholder: 'Search ticker, name, or .KL code to add (e.g. MAYBANK, 1155.KL)...',
      emptyState: 'Your watchlist is empty. Search above to add Bursa Malaysia stocks!',
      remove: 'Remove',
      added: 'Added',
      shariah: '☪️ Shariah',
      noStocksFound: 'No stocks found matching your search.'
    },
    BM: {
      title: 'Senarai Pantau Saya',
      back: 'Kembali ke Dashboard',
      addStock: 'Tambah Saham Bursa Malaysia',
      searchPlaceholder: 'Cari simbol, nama, atau kod .KL untuk tambah (cth: MAYBANK, 1155.KL)...',
      emptyState: 'Senarai pantau anda kosong. Cari di atas untuk menambah saham!',
      remove: 'Buang',
      added: 'Ditambah',
      shariah: '☪️ Syariah',
      noStocksFound: 'Tiada saham ditemui.'
    }
  };

  const t = texts[language];

  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setOnDemandResults([]);
      setIsSearching(false);
      return;
    }

    let cancelled = false;
    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const discovered = await searchBursaStocksOnDemand(q, stocks);
        if (!cancelled) {
          setOnDemandResults(discovered);
        }
      } finally {
        if (!cancelled) {
          setIsSearching(false);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery, stocks]);

  // Filter stocks for search (excluding ones already in watchlist)
  const availableStocks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    const localMatches = stocks.filter(
      s =>
        !watchlist.some(w => w.id === s.id || w.bursaCode === s.bursaCode) &&
        (s.name.toLowerCase().includes(q) ||
          s.ticker.toLowerCase().includes(q) ||
          s.bursaCode.toLowerCase().includes(q) ||
          s.sector.toLowerCase().includes(q))
    );

    const map = new Map<string, StockData>();
    localMatches.forEach(s => map.set(s.bursaCode, s));
    onDemandResults.forEach(s => {
      const alreadyWatched = watchlist.some(
        w => w.id === s.id || w.bursaCode === s.bursaCode
      );
      if (!alreadyWatched && !map.has(s.bursaCode)) {
        map.set(s.bursaCode, s);
      }
    });

    return Array.from(map.values());
  }, [searchQuery, stocks, watchlist, onDemandResults]);

  const handleCardClick = (stock: StockData) => {
    setSelectedStock(stock);
    navigateTo('stock-details');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-20 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigateTo('dashboard')} className="p-2">
            <ArrowLeft size={24} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
            <p className="text-xs text-gray-500">
              {watchlist.length} {language === 'ENG' ? 'stocks tracked' : 'saham dipantau'}
            </p>
          </div>
        </div>

        {/* Search & Add Section */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium uppercase tracking-wide text-gray-500">
                {t.addStock}
              </CardTitle>
              {isSearching && (
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Loader2 size={14} className="animate-spin" />
                  Searching Bursa (.KL)...
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder={t.searchPlaceholder}
                className="pl-10"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            {searchQuery.trim() && (
              <div className="mt-4 space-y-2">
                {availableStocks.length > 0 ? (
                  availableStocks.slice(0, 6).map(stock => (
                    <div
                      key={stock.id}
                      onClick={() => handleCardClick(stock)}
                      className="flex items-center justify-between p-3 bg-white border rounded-lg hover:shadow-sm transition-shadow cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold text-xs">
                          {stock.ticker.slice(0, 4)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold text-gray-900">{stock.name}</p>
                            {stock.isShariah && (
                              <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 text-[10px] px-1.5 py-0">
                                {t.shariah}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">
                            {stock.ticker} · <span className="font-mono">{stock.bursaCode}</span> · RM {stock.price}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={e => {
                          e.stopPropagation();
                          addToWatchlist(stock);
                          setSearchQuery('');
                        }}
                      >
                        <Plus size={16} className="mr-1" /> {language === 'ENG' ? 'Add' : 'Tambah'}
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    {isSearching ? 'Searching Bursa Malaysia (.KL)...' : t.noStocksFound}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Watchlist Items */}
        <div className="space-y-4">
          {watchlist.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
              <TrendingUp className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">{t.emptyState}</p>
            </div>
          ) : (
            watchlist.map(stock => (
              <Card
                key={stock.id}
                onClick={() => handleCardClick(stock)}
                className="hover:shadow-md transition-shadow cursor-pointer"
              >
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shadow-sm shrink-0 ${
                        stock.isPositive ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    >
                      {stock.isPositive ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-lg text-gray-900">{stock.ticker}</h3>
                        <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {stock.bursaCode}
                        </span>
                        {stock.isShariah && (
                          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 text-[10px] px-2 py-0">
                            {t.shariah}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {stock.name} · {stock.sector}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                    <div className="text-right">
                      <p className="font-mono font-bold text-lg">RM {stock.price}</p>
                      <p
                        className={`text-xs font-bold ${
                          stock.isPositive ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {stock.changePercent}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                      onClick={e => {
                        e.stopPropagation();
                        removeFromWatchlist(stock.id);
                      }}
                    >
                      <Trash2 size={20} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
