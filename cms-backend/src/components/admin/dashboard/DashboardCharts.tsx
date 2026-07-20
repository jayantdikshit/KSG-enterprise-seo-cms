import React from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { DashboardChartData } from '@/types/dashboard';

interface DashboardChartsProps {
  monthlyLeads?: DashboardChartData[];
  monthlyBlogs?: DashboardChartData[];
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ monthlyLeads, monthlyBlogs }) => {
  if (!monthlyLeads && !monthlyBlogs) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {monthlyLeads && monthlyLeads.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h2 className="font-semibold mb-4 text-gray-800 dark:text-gray-100">Monthly Leads</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyLeads} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                <XAxis dataKey="_id" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' }}
                  itemStyle={{ color: '#60A5FA' }}
                />
                <Legend />
                <Line type="monotone" dataKey="count" name="Leads" stroke="#3B82F6" strokeWidth={3} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {monthlyBlogs && monthlyBlogs.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h2 className="font-semibold mb-4 text-gray-800 dark:text-gray-100">Monthly Blogs</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyBlogs} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                <XAxis dataKey="_id" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' }}
                  itemStyle={{ color: '#34D399' }}
                />
                <Legend />
                <Bar dataKey="count" name="Published Blogs" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
