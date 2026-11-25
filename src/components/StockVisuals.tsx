import {
  Landmark,
  Zap,
  Factory,
  HeartPulse,
  Radio,
  Cpu,
  ShoppingBag,
  Building2,
  Sprout,
  Layers,
} from 'lucide-react';

interface StockVisual {
  icon: typeof Landmark;
  bg: string;
  border: string;
  color: string;
  shadow: string;
}

function resolveSectorVisual(sector: string, ticker: string): StockVisual {
  const s = (sector || '').toLowerCase();
  const t = (ticker || '').toUpperCase();

  if (s.includes('financial') || ['MAYBANK', 'PBBANK', 'CIMB', 'RHBBANK', 'HLBANK'].includes(t)) {
    return {
      icon: Landmark,
      bg: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
      border: '#6ee7b7',
      color: '#047857',
      shadow: '#a7f3d0',
    };
  }
  if (s.includes('utilit') || t === 'TENAGA' || t === 'YTLPOWR' || t === 'PETGAS') {
    return {
      icon: Zap,
      bg: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
      border: '#fcd34d',
      color: '#b45309',
      shadow: '#fde68a',
    };
  }
  if (s.includes('health') || t === 'IHH' || t === 'TOPGLOV') {
    return {
      icon: HeartPulse,
      bg: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
      border: '#fca5a5',
      color: '#b91c1c',
      shadow: '#fecaca',
    };
  }
  if (s.includes('telecom') || t === 'CDB' || t === 'MAXIS' || t === 'AXIATA' || t === 'TM') {
    return {
      icon: Radio,
      bg: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
      border: '#93c5fd',
      color: '#1d4ed8',
      shadow: '#bfdbfe',
    };
  }
  if (s.includes('tech') || t === 'INARI' || t === 'MYEG') {
    return {
      icon: Cpu,
      bg: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)',
      border: '#5eead4',
      color: '#0f766e',
      shadow: '#99f6e4',
    };
  }
  if (s.includes('plantation') || t === 'SIMEPLT' || t === 'IOICORP' || t === 'KLK') {
    return {
      icon: Sprout,
      bg: 'linear-gradient(135deg, #f7fee7 0%, #ecfccb 100%)',
      border: '#bef264',
      color: '#3f6212',
      shadow: '#d9f99d',
    };
  }
  if (s.includes('consumer') || t === 'NESTLE' || t === 'MRDIY' || t === 'GENTING') {
    return {
      icon: ShoppingBag,
      bg: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
      border: '#fdba74',
      color: '#c2410c',
      shadow: '#fed7aa',
    };
  }
  if (s.includes('industrial') || t === 'PCHEM' || t === 'PMETAL') {
    return {
      icon: Factory,
      bg: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
      border: '#cbd5e1',
      color: '#334155',
      shadow: '#cbd5e1',
    };
  }
  if (s.includes('property') || s.includes('construction') || t === 'GAMUDA') {
    return {
      icon: Building2,
      bg: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
      border: '#86efac',
      color: '#15803d',
      shadow: '#bbf7d0',
    };
  }
  return {
    icon: Layers,
    bg: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
    border: '#a7f3d0',
    color: '#065f46',
    shadow: '#a7f3d0',
  };
}

interface StockBadgeProps {
  ticker: string;
  sector?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function StockBadge({ ticker, sector = '', size = 'md' }: StockBadgeProps) {
  const vis = resolveSectorVisual(sector, ticker);
  const Icon = vis.icon;

  const dims =
    size === 'sm'
      ? { box: '2.5rem', radius: '0.8rem', icon: 18, showText: false, sub: '0.5rem' }
      : size === 'lg'
        ? { box: '3.75rem', radius: '1.1rem', icon: 21, showText: true, sub: ticker.length > 5 ? '0.52rem' : '0.62rem' }
        : { box: '3rem', radius: '0.92rem', icon: 17, showText: true, sub: ticker.length > 5 ? '0.47rem' : '0.56rem' };

  return (
    <div
      aria-hidden="true"
      style={{
        width: dims.box,
        height: dims.box,
        borderRadius: dims.radius,
        background: vis.bg,
        border: `2px solid ${vis.border}`,
        boxShadow: `0 3px 0 0 ${vis.shadow}`,
        color: vis.color,
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2px',
        padding: '2px',
        flexShrink: 0,
      }}
    >
      <Icon size={dims.icon} strokeWidth={2.4} />
      {dims.showText && (
        <span
          className="jomi-display"
          style={{
            fontSize: dims.sub,
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: '-0.01em',
            whiteSpace: 'nowrap',
          }}
        >
          {ticker}
        </span>
      )}
    </div>
  );
}

interface MiniSparklineProps {
  data: number[];
  isPositive: boolean;
  width?: number;
  height?: number;
  idSuffix?: string;
}

export function MiniSparkline({
  data,
  isPositive,
  width = 84,
  height = 32,
  idSuffix = 'spark',
}: MiniSparklineProps) {
  if (!data || data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pad = 3;

  const coords = data.map((value, index) => {
    const x = (index / (data.length - 1)) * (width - pad * 2) + pad;
    const y = height - pad - ((value - min) / range) * (height - pad * 2);
    return { x, y };
  });

  const linePath = coords.map((c, idx) => `${idx === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L ${coords[coords.length - 1].x.toFixed(1)} ${height} L ${coords[0].x.toFixed(1)} ${height} Z`;
  const last = coords[coords.length - 1];
  const stroke = isPositive ? '#10b981' : '#ef4444';
  const gradId = `jomi-spark-${idSuffix}-${isPositive ? 'up' : 'dn'}`;

  return (
    <svg width={width} height={height} style={{ flexShrink: 0, overflow: 'visible' }} aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity={0.32} />
          <stop offset="100%" stopColor={stroke} stopOpacity={0.0} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradId})`} />
      <path
        d={linePath}
        fill="none"
        stroke={stroke}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={last.x} cy={last.y} r="3" fill={stroke} stroke="#ffffff" strokeWidth="1.5" />
    </svg>
  );
}
