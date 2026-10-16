import React from 'react';
import { TrendingUp, IndianRupee, Store, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

const MarketCard = ({ data, mode = 'DEMO' }) => {
  if (!data) return null;

  const isReal = mode === 'REAL';
  const isIncreasing = data.trend === 'Increasing';
  const isDecreasing = data.trend === 'Decreasing';

  return (
    <div className="bg-white rounded-3xl p-6 border border-agro-100 shadow-soft hover:shadow-premium transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-agro-950">Market Intelligence</h3>
              <p className="text-xs text-gray-500">{data.marketName || 'Koyambedu Wholesale Market'}</p>
            </div>
          </div>
          <div>
            <span
              className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ${
                isReal
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-indigo-50 text-indigo-700 border-indigo-200'
              }`}
            >
              {isReal ? 'LIVE MANDI FEED' : 'DEMO MARKET MODE'}
            </span>
          </div>
        </div>

        {/* Price & Trend Highlight */}
        <div className="flex items-end justify-between my-4 p-4 bg-indigo-50/40 rounded-2xl border border-indigo-100/60">
          <div>
            <span className="text-xs text-indigo-800 font-medium">Spot Wholesale Price</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-extrabold text-agro-950">₹{data.currentPrice}</span>
              <span className="text-xs text-gray-500 font-medium">/{data.currency || 'kg'}</span>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <div
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                isIncreasing
                  ? 'bg-emerald-100 text-emerald-800'
                  : isDecreasing
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {isIncreasing ? (
                <ArrowUpRight className="w-3.5 h-3.5" />
              ) : isDecreasing ? (
                <ArrowDownRight className="w-3.5 h-3.5" />
              ) : (
                <Minus className="w-3.5 h-3.5" />
              )}
              <span>{data.trend}</span>
            </div>
            <span className="text-[10px] text-gray-500 mt-1">{data.trendPercentage || '+8.4%'} vs last week</span>
          </div>
        </div>

        {/* Mini 5-Day Trend Chart */}
        {data.priceHistory && data.priceHistory.length > 0 && (
          <div className="h-28 w-full my-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.priceHistory}>
                <defs>
                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" hide />
                <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
                <Tooltip
                  formatter={(val) => [`₹${val}/kg`, 'Wholesale']}
                  contentStyle={{ fontSize: '11px', borderRadius: '8px' }}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="#4f46e5"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#priceGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Market Condition & Demand Metrics */}
        <div className="grid grid-cols-2 gap-3 my-3">
          <div className="p-2.5 bg-gray-50 rounded-xl text-xs">
            <span className="text-gray-500 block text-[10px]">Market Demand</span>
            <span className="font-bold text-agro-950">{data.demand || 'High'}</span>
          </div>
          <div className="p-2.5 bg-gray-50 rounded-xl text-xs">
            <span className="text-gray-500 block text-[10px]">Selling Opportunity</span>
            <span className="font-bold text-emerald-700">{data.marketCondition || 'Favorable'}</span>
          </div>
        </div>
      </div>

      {/* Actionable recommendation */}
      <div className="pt-3 border-t border-gray-100">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-indigo-900 mb-1">
          Market Recommendation
        </h4>
        <p className="text-xs text-gray-700 leading-relaxed bg-indigo-50/30 p-2.5 rounded-xl border border-indigo-100/50">
          {data.marketRecommendation || 'Current market conditions appear favorable for selling.'}
        </p>
      </div>
    </div>
  );
};

export default MarketCard;
