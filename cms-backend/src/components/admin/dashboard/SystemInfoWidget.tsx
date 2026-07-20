import React from 'react';
import { Server, Database, Clock, User as UserIcon } from 'lucide-react';
import { SystemInfo } from '@/types/dashboard';

interface SystemInfoWidgetProps {
  systemInfo?: SystemInfo;
  userEmail?: string;
  role?: string;
}

export const SystemInfoWidget: React.FC<SystemInfoWidgetProps> = ({ systemInfo, userEmail, role }) => {
  if (!systemInfo) return null;

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${d}d ${h}h ${m}m`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden mt-6">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">System Information</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">Current server status and active user details.</p>
      </div>
      <div className="px-4 py-5 sm:p-0">
        <dl className="sm:divide-y sm:divide-gray-200 dark:sm:divide-gray-700">
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
              <UserIcon className="w-4 h-4 mr-2" /> Logged in as
            </dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
              {userEmail} <span className="text-gray-400 ml-2">({role})</span>
            </dd>
          </div>
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
              <Server className="w-4 h-4 mr-2" /> Server Status
            </dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2 flex items-center">
              <span className={`w-2.5 h-2.5 rounded-full mr-2 ${systemInfo.serverStatus === 'Online' ? 'bg-green-500' : 'bg-red-500'}`}></span>
              {systemInfo.serverStatus}
            </dd>
          </div>
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
              <Database className="w-4 h-4 mr-2" /> Database Connection
            </dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2 flex items-center">
              <span className={`w-2.5 h-2.5 rounded-full mr-2 ${systemInfo.databaseStatus === 'Connected' ? 'bg-green-500' : 'bg-red-500'}`}></span>
              {systemInfo.databaseStatus}
            </dd>
          </div>
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
              <Clock className="w-4 h-4 mr-2" /> Server Uptime
            </dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
              {formatUptime(systemInfo.uptime)}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
};
