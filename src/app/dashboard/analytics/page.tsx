"use client";

import { motion } from "framer-motion";
import { 
  ChartBarIcon,
  ClockIcon,
  CalendarDaysIcon,
  FireIcon,
  HeartIcon,
  PlayIcon,
  StarIcon,
  ArrowTrendingUpIcon
} from "@heroicons/react/24/outline";

export default function AnalyticsPage() {
  const stats = {
    totalListeningTime: 1245,
    completedContent: 24,
    streak: 7,
    averageDaily: 89,
    totalLikes: 156,
    totalViews: 2340,
    favoriteCategory: "ビジネス",
    weeklyProgress: [65, 78, 92, 45, 123, 89, 156]
  };

  const weekDays = ['月', '火', '水', '木', '金', '土', '日'];

  const StatCard = ({ 
    title, 
    value, 
    unit, 
    icon: Icon, 
    color, 
    trend, 
    trendValue 
  }: {
    title: string;
    value: number | string;
    unit?: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    trend?: 'up' | 'down';
    trendValue?: string;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{title}</p>
          <div className="flex items-baseline space-x-2 mt-1">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            {unit && <span className="text-gray-500 dark:text-gray-400 text-sm">{unit}</span>}
          </div>
          {trend && trendValue && (
            <div className={`flex items-center mt-2 text-sm ${
              trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              <ArrowTrendingUpIcon className={`h-4 w-4 mr-1 ${trend === 'down' ? 'rotate-180' : ''}`} />
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-8 text-white"
      >
        <div className="flex items-center space-x-3 mb-4">
          <ChartBarIcon className="h-8 w-8" />
          <h2 className="text-3xl font-bold">学習分析</h2>
        </div>
        <p className="text-purple-100 text-lg">
          あなたの学習パフォーマンスと進捗を詳しく分析します
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="総学習時間"
          value={Math.floor(stats.totalListeningTime / 60)}
          unit="時間"
          icon={ClockIcon}
          color="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
          trend="up"
          trendValue="+12% 先週比"
        />
        
        <StatCard
          title="完了コンテンツ"
          value={stats.completedContent}
          unit="個"
          icon={PlayIcon}
          color="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
          trend="up"
          trendValue="+3 今週"
        />
        
        <StatCard
          title="学習ストリーク"
          value={stats.streak}
          unit="日"
          icon={FireIcon}
          color="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
          trend="up"
          trendValue="継続中"
        />
        
        <StatCard
          title="1日平均"
          value={Math.floor(stats.averageDaily)}
          unit="分"
          icon={CalendarDaysIcon}
          color="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
          trend="up"
          trendValue="+8分 先週比"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">週間学習時間</h3>
        <div className="space-y-4">
          {weekDays.map((day, index) => {
            const minutes = stats.weeklyProgress[index];
            const maxMinutes = Math.max(...stats.weeklyProgress);
            const percentage = (minutes / maxMinutes) * 100;
            
            return (
              <div key={day} className="flex items-center space-x-4">
                <div className="w-8 text-sm font-medium text-gray-600 dark:text-gray-400">
                  {day}
                </div>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3 relative overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ delay: 0.3 + index * 0.1, duration: 0.8 }}
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                  />
                </div>
                <div className="w-16 text-sm text-gray-600 dark:text-gray-400 text-right">
                  {minutes}分
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">エンゲージメント</h3>
            <HeartIcon className="h-6 w-6 text-red-500" />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">総いいね数</span>
              <span className="font-semibold text-gray-900 dark:text-white">{stats.totalLikes}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">総視聴回数</span>
              <span className="font-semibold text-gray-900 dark:text-white">{stats.totalViews}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">平均評価</span>
              <div className="flex items-center space-x-1">
                <StarIcon className="h-4 w-4 text-yellow-500 fill-current" />
                <span className="font-semibold text-gray-900 dark:text-white">4.8</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">カテゴリ別</h3>
            <ChartBarIcon className="h-6 w-6 text-blue-500" />
          </div>
          <div className="space-y-3">
            {[
              { name: 'ビジネス', percentage: 45, color: 'bg-blue-500' },
              { name: 'テクノロジー', percentage: 30, color: 'bg-green-500' },
              { name: '教育', percentage: 15, color: 'bg-yellow-500' },
              { name: 'その他', percentage: 10, color: 'bg-gray-500' }
            ].map((category) => (
              <div key={category.name} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{category.name}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{category.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${category.percentage}%` }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className={`h-2 ${category.color} rounded-full`}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">目標達成</h3>
            <StarIcon className="h-6 w-6 text-yellow-500" />
          </div>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">85%</div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">今月の目標達成率</div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '85%' }}
                transition={{ delay: 0.6, duration: 1 }}
                className="h-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"
              />
            </div>
            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              目標まであと <span className="font-semibold text-gray-900 dark:text-white">3時間</span>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">最近の達成</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: '7日連続学習', icon: FireIcon, color: 'text-orange-500', achieved: true },
            { title: '月間20時間達成', icon: ClockIcon, color: 'text-blue-500', achieved: true },
            { title: '100いいね獲得', icon: HeartIcon, color: 'text-red-500', achieved: false },
            { title: 'カテゴリマスター', icon: StarIcon, color: 'text-yellow-500', achieved: false }
          ].map((achievement) => (
            <div
              key={achievement.title}
              className={`p-4 rounded-lg border-2 transition-all ${
                achievement.achieved
                  ? 'border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <achievement.icon className={`h-6 w-6 ${achievement.color}`} />
                <div>
                  <div className={`font-medium ${
                    achievement.achieved 
                      ? 'text-green-900 dark:text-green-100' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {achievement.title}
                  </div>
                  <div className={`text-xs ${
                    achievement.achieved 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-gray-500 dark:text-gray-500'
                  }`}>
                    {achievement.achieved ? '達成済み' : '未達成'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
} 