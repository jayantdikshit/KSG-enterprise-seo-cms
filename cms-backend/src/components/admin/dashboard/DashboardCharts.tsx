import React, { useState, useMemo, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList, AreaChart, Area, ReferenceLine, Label
} from 'recharts';
import { DashboardChartData } from '@/types/dashboard';

interface DashboardChartsProps {
  monthlyLeads?: DashboardChartData[];
  dailyLeads?: DashboardChartData[];
  monthlyBlogs?: DashboardChartData[];
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ monthlyLeads, dailyLeads, monthlyBlogs }) => {
  const [timeRange, setTimeRange] = useState<'7days' | '30days' | 'year'>('7days');
  const [lastUpdated, setLastUpdated] = useState<string>('just now');

  // Process data for the leads chart
  const leadsChartData = useMemo(() => {
    if (!dailyLeads && !monthlyLeads) return [];
    
    if (timeRange === 'year') {
      if (!monthlyLeads) return [];
      const currentYear = new Date().getFullYear().toString();
      return monthlyLeads
        .filter(d => d._id && d._id.startsWith(currentYear))
        .map(d => ({
          ...d,
          displayId: new Date(d._id + '-01').toLocaleString('default', { month: 'short' }),
          dateStr: d._id
        }))
        .sort((a, b) => a.dateStr.localeCompare(b.dateStr));
    } else {
      if (!dailyLeads) return [];
      
      const sorted = [...dailyLeads].sort((a, b) => (b._id > a._id ? 1 : -1));
      const daysToTake = timeRange === '7days' ? 7 : 30;
      const recent = sorted.slice(0, daysToTake).reverse();
      
      return recent.map(d => {
        const dateObj = new Date(d._id);
        return {
          ...d,
          displayId: `${dateObj.getDate()} ${dateObj.toLocaleString('default', { month: 'short' })}`,
          fullDate: d._id
        };
      });
    }
  }, [monthlyLeads, dailyLeads, timeRange]);

  const averageLeads = useMemo(() => {
    if (!leadsChartData || leadsChartData.length === 0) return 0;
    const total = leadsChartData.reduce((sum, item) => sum + item.count, 0);
    return Math.round(total / leadsChartData.length);
  }, [leadsChartData]);

  const todayStats = useMemo(() => {
    if (!dailyLeads || dailyLeads.length === 0) return { today: 0, trend: 0 };
    
    const sorted = [...dailyLeads].sort((a, b) => (b._id > a._id ? 1 : -1));
    const today = sorted[0]?.count || 0;
    const yesterday = sorted[1]?.count || 0;
    
    let trend = 0;
    if (yesterday > 0) {
      trend = Math.round(((today - yesterday) / yesterday) * 100);
    } else if (today > 0) {
      trend = 100; 
    }
    
    return { today, trend };
  }, [dailyLeads]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-3 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.1)]">
          <p className="text-gray-500 dark:text-gray-400 font-medium mb-1 text-sm">{label}</p>
          <p className="text-blue-600 dark:text-blue-400 font-bold text-lg flex items-center gap-2">
            Leads: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  if (!monthlyLeads && !monthlyBlogs) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {monthlyLeads && monthlyLeads.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-[20px] shadow-[0_20px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.2)] p-6 lg:col-span-2 relative overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
            <div>
              <h2 className="font-semibold text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wider mb-2">
                Lead Analytics
              </h2>
              <div className="flex items-end gap-3">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">
                  {todayStats.today} <span className="text-xl text-gray-500 dark:text-gray-400 font-medium">Leads Today</span>
                </span>
                {todayStats.trend !== 0 && (
                  <span className={`flex items-center text-sm font-semibold px-2 py-1 rounded-full mb-1 ${todayStats.trend > 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {todayStats.trend > 0 ? '↑' : '↓'} {Math.abs(todayStats.trend)}% vs Yesterday
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex bg-gray-100 dark:bg-gray-700/50 p-1 rounded-full">
              {[
                { id: '7days', label: '7 Days' },
                { id: '30days', label: '30 Days' },
                { id: 'year', label: 'Year' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setTimeRange(tab.id as any)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
                    timeRange === tab.id 
                      ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm' 
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="h-[420px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={leadsChartData as any[]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLeadsPremium" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#60A5FA" stopOpacity={0}/>
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="#6B7280" opacity={0.1} vertical={false} />
                <XAxis 
                  dataKey="displayId" 
                  stroke="#9CA3AF" 
                  axisLine={false} 
                  tickLine={false} 
                  dy={10} 
                  tick={{ fontSize: 12, fill: '#6B7280' }} 
                />
                <YAxis 
                  stroke="#9CA3AF" 
                  axisLine={false} 
                  tickLine={false} 
                  dx={-10} 
                  tick={{ fontSize: 12, fill: '#6B7280' }} 
                  allowDecimals={false}
                />
                <Tooltip 
                  content={<CustomTooltip />}
                  cursor={{ stroke: '#60A5FA', strokeWidth: 1, strokeDasharray: '4 4', opacity: 0.5 }}
                />
                <ReferenceLine 
                  y={averageLeads} 
                  stroke="#9CA3AF" 
                  strokeDasharray="3 3" 
                  opacity={0.5}
                >
                  <Label value={`Avg: ${averageLeads}`} position="insideTopRight" fill="#9CA3AF" fontSize={12} offset={10} />
                </ReferenceLine>
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  name="Leads" 
                  stroke="#3B82F6" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorLeadsPremium)" 
                  activeDot={{ r: 6, strokeWidth: 2, stroke: '#FFFFFF', fill: '#3B82F6', filter: 'url(#glow)' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          <div className="absolute bottom-4 right-6 text-xs text-gray-400 dark:text-gray-500">
            Updated {lastUpdated}
          </div>
        </div>
      )}

      {monthlyBlogs && monthlyBlogs.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-[20px] shadow-[0_10px_20px_rgba(0,0,0,0.05)] p-6 lg:col-span-2">
          <h2 className="font-semibold mb-6 text-gray-800 dark:text-gray-100 uppercase tracking-wider text-sm">Monthly Blogs Published</h2>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyBlogs} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} vertical={false} />
                <XAxis dataKey="_id" stroke="#9CA3AF" axisLine={false} tickLine={false} dy={10} tick={{ fontSize: 12 }} />
                <YAxis stroke="#9CA3AF" axisLine={false} tickLine={false} dx={-10} tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)' }}
                  itemStyle={{ color: '#10B981', fontWeight: 'bold' }}
                  cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                />
                <Bar dataKey="count" name="Published Blogs" fill="url(#colorBlogs)" radius={[6, 6, 0, 0]} maxBarSize={60}>
                  <LabelList dataKey="count" position="top" fill="#9CA3AF" fontSize={12} fontWeight="bold" />
                </Bar>
                <defs>
                  <linearGradient id="colorBlogs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={1}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
