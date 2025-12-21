import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Tag,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Plus,
  Calendar,
  MessageSquare,
  Eye,
  Clock,
  Sparkles,
  ChevronRight,
  Activity,
  Users,
  Zap,
  BadgeCheck,
  Target,
} from 'lucide-react';

// Refined animation variants - more subtle and elegant
const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.08,
    },
  },
};

export function DashboardPage() {
  const stats = [
    {
      name: 'Total Views',
      value: '2,847',
      change: '+12%',
      changeType: 'up',
      icon: Users,
      gradient: 'from-indigo-500 to-indigo-600',
      shadowColor: 'shadow-indigo-500/25',
    },
    {
      name: 'Active Deals',
      value: '8',
      change: '+2',
      changeType: 'up',
      icon: Zap,
      gradient: 'from-purple-500 to-purple-600',
      shadowColor: 'shadow-purple-500/25',
    },
    {
      name: 'Redemptions',
      value: '156',
      change: '+23%',
      changeType: 'up',
      icon: BadgeCheck,
      gradient: 'from-teal-500 to-teal-600',
      shadowColor: 'shadow-teal-500/25',
    },
    {
      name: 'Engagement',
      value: '5.4%',
      change: '-0.2%',
      changeType: 'down',
      icon: Target,
      gradient: 'from-orange-500 to-orange-600',
      shadowColor: 'shadow-orange-500/25',
    },
  ];

  const recentActivity = [
    {
      type: 'redemption',
      message: 'New redemption on "Happy Hour Special"',
      time: '2m ago',
      icon: Activity,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    {
      type: 'message',
      message: 'New message from customer',
      time: '15m ago',
      icon: MessageSquare,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      type: 'view',
      message: 'Deal "2-for-1 Drinks" viewed 24 times',
      time: '1h ago',
      icon: Eye,
      iconBg: 'bg-violet-50',
      iconColor: 'text-violet-600',
    },
    {
      type: 'event',
      message: 'Event "Live Music Friday" starts in 2 days',
      time: '3h ago',
      icon: Calendar,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
  ];

  return (
    <motion.div
      initial="initial"
      animate="animate"
      className="space-y-8"
    >
      {/* Page Header - Clean & Minimal */}
      <motion.div {...fadeIn}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Dashboard</h1>
            <p className="text-gray-500 mt-1">Welcome back. Here's your venue overview.</p>
          </div>
          <Link
            to="/deals/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Deal
          </Link>
        </div>
      </motion.div>

      {/* Stats Grid - World-Class Card Design */}
      <motion.div
        variants={staggerContainer}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
      >
        {stats.map((stat) => (
          <motion.div
            key={stat.name}
            variants={fadeIn}
            whileHover={{ scale: 1.02, y: -2 }}
            className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center shadow-lg ${stat.shadowColor}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                stat.changeType === 'up'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-red-50 text-red-700'
              }`}>
                {stat.changeType === 'up' ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {stat.change}
              </span>
            </div>
            <div className="mt-5">
              <p className="text-3xl font-bold text-gray-900 tracking-tight">{stat.value}</p>
              <p className="text-sm font-medium text-gray-500 mt-1">{stat.name}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions - Refined */}
        <motion.div
          variants={fadeIn}
          className="bg-white rounded-xl border border-gray-100 p-6"
        >
          <h3 className="text-base font-semibold text-gray-900 mb-5">Quick Actions</h3>
          <div className="space-y-3">
            <Link
              to="/deals/new"
              className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl text-white hover:from-gray-800 hover:to-gray-700 transition-all group"
            >
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                <Tag className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium">Create New Deal</p>
                <p className="text-sm text-white/60">Attract more customers</p>
              </div>
              <ArrowRight className="w-4 h-4 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              to="/events/new"
              className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
            >
              <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-violet-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900">Schedule Event</p>
                <p className="text-sm text-gray-500">Plan your next event</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              to="/chat"
              className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900">View Messages</p>
                <p className="text-sm text-gray-500">3 unread messages</p>
              </div>
              <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-medium rounded-full">
                3
              </span>
            </Link>
          </div>
        </motion.div>

        {/* Recent Activity - Clean List */}
        <motion.div
          variants={fadeIn}
          className="bg-white rounded-xl border border-gray-100 p-6 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-gray-900">Recent Activity</h3>
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            </div>
            <Link
              to="/analytics"
              className="text-sm font-medium text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors"
            >
              View all
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-1">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className={`w-9 h-9 ${activity.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <activity.icon className={`w-4 h-4 ${activity.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700">{activity.message}</p>
                </div>
                <span className="flex items-center gap-1.5 text-xs text-gray-400 whitespace-nowrap">
                  <Clock className="w-3 h-3" />
                  {activity.time}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Performance Banner - Subtle & Elegant */}
      <motion.div
        variants={fadeIn}
        className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-xl p-6 text-white"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold">Boost Your Performance</h3>
              <p className="text-white/60 text-sm mt-0.5">
                Create a featured deal to increase visibility by up to 3x
              </p>
            </div>
          </div>
          <Link
            to="/deals/new?featured=true"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors group"
          >
            Create Featured Deal
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}
