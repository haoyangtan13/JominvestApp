import { useState } from 'react';
import { ArrowLeft, Trash2, Plus, Search, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { StockData, stocks } from '../data/stocks';
import { Screen } from '../App';

interface WatchlistPageProps {
    navigateTo: (screen: Screen) => void;
    language: 'ENG' | 'BM';
    watchlist: StockData[];
    addToWatchlist: (stock: StockData) => void;
    removeFromWatchlist: (stockId: number) => void;
}

export function WatchlistPage({ navigateTo, language, watchlist, addToWatchlist, removeFromWatchlist }: WatchlistPageProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const texts = {
        ENG: {
            title: 'My Watchlist',
            back: 'Back to Dashboard',
            addStock: 'Add Stock',
            searchPlaceholder: 'Search to add...',
            emptyState: 'Your watchlist is empty. Add stocks to track them!',
            remove: 'Remove',
            added: 'Added',
            columns: {
                symbol: 'Symbol',
                price: 'Price',
                change: '24h Change',
                action: 'Action'
            }
        },
        BM: {
            title: 'Senarai Pantau Saya',
            back: 'Kembali ke Dashboard',
            addStock: 'Tambah Saham',
            searchPlaceholder: 'Cari untuk tambah...',
            emptyState: 'Senarai pantau anda kosong. Tambah saham untuk memantau!',
            remove: 'Buang',
            added: 'Ditambah',
            columns: {
                symbol: 'Simbol',
                price: 'Harga',
                change: 'Perubahan 24j',
                action: 'Tindakan'
            }
        }
    };

    const t = texts[language];

    // Filter stocks for search (excluding ones already in watchlist)
    const availableStocks = stocks.filter(
        s => !watchlist.some(w => w.id === s.id) &&
            (s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.ticker.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-gray-50 p-4 pb-20 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => navigateTo('dashboard')} className="p-2">
                        <ArrowLeft size={24} />
                    </Button>
                    <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
                </div>

                {/* Search & Add Section */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium uppercase tracking-wide text-gray-500">{t.addStock}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <Input
                                placeholder={t.searchPlaceholder}
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        {searchQuery && (
                            <div className="mt-4 space-y-2">
                                {availableStocks.length > 0 ? (
                                    availableStocks.slice(0, 3).map(stock => (
                                        <div key={stock.id} className="flex items-center justify-between p-3 bg-white border rounded-lg hover:shadow-sm transition-shadow">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold text-xs">
                                                    {stock.ticker}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{stock.name}</p>
                                                    <p className="text-xs text-gray-500">{stock.ticker}</p>
                                                </div>
                                            </div>
                                            <Button size="sm" onClick={() => { addToWatchlist(stock); setSearchQuery(''); }}>
                                                <Plus size={16} className="mr-1" /> {t.addStock}
                                            </Button>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500 text-center py-4">No stocks found.</p>
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
                            <Card key={stock.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shadow-sm ${stock.changePercent.startsWith('+') ? 'bg-green-500' : 'bg-red-500'}`}>
                                            {stock.changePercent.startsWith('+') ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900">{stock.ticker}</h3>
                                            <p className="text-sm text-gray-500">{stock.name}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="text-right hidden sm:block">
                                            <p className="font-mono font-bold text-lg">{stock.price}</p>
                                            <p className={`text-xs font-bold ${stock.changePercent.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                                                {stock.changePercent}
                                            </p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                                            onClick={() => removeFromWatchlist(stock.id)}
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
