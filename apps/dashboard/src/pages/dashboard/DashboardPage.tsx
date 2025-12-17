import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Users,
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
  Zap,
  ChevronRight,
  Activity,
} from 'lucide-react';

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const fadeInLeft = {
  initial: { opacity: 0, x: -30 },
  animate: { opacity: 1, x: 0 },
};

const fadeInRight = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const cardHover = {
  rest: {
    scale: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.23, 1, 0.32, 1] }
  },
  hover: {
    scale: 1.02,
    y: -4,
    transition: { duration: 0.3, ease: [0.23, 1, 0.32, 1] }
  },
};

const iconFloat = {
  rest: { y: 0, rotate: 0 },
  hover: {
    y: -2,
    rotate: [0, -5, 5, 0],
    transition: { duration: 0.4 }
  },
};

const buttonTap = {
  scale: 0.97,
  transition: { duration: 0.1 }
};

export function DashboardPage() {
  // Mock data - will be replaced with real API calls
  const stats = [
    {
      name: 'Total Views',
      value: '2,847',
      change: '+12%',
      changeType: 'up',
      icon: Eye,
      color: 'primary',
      gradient: 'from-primary-500 to-primary-600',
    },
    {
      name: 'Active Deals',
      value: '8',
      change: '+2',
      changeType: 'up',
      icon: Tag,
      color: 'secondary',
      gradient: 'from-secondary-500 to-secondary-600',
    },
    {
      name: 'Redemptions',
      value: '156',
      change: '+23%',
      changeType: 'up',
      icon: BarChart3,
      color: 'success',
      gradient: 'from-success-500 to-success-600',
    },
    {
      name: 'Engagement Rate',
      value: '5.4%',
      change: '-0.2%',
      changeType: 'down',
      icon: TrendingUp,
      color: 'warning',
      gradient: 'from-warning-500 to-warning-600',
    },
  ];

  const recentActivity = [
    {
      type: 'redemption',
      message: 'New redemption on "Happy Hour Special"',
      time: '2m ago',
      color: 'success',
      icon: Activity,
    },
    {
      type: 'message',
      message: 'New message from customer',
      time: '15m ago',
      color: 'info',
      icon: MessageSquare,
    },
    {
      type: 'view',
      message: 'Deal "2-for-1 Drinks" viewed 24 times',
      time: '1h ago',
      color: 'secondary',
      icon: Eye,
    },
    {
      type: 'event',
      message: 'Event "Live Music Friday" starts in 2 days',
      time: '3h ago',
      color: 'warning',
      icon: Calendar,
    },
  ];

  const getStatColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; icon: string; ring: string; glow: string }> = {
      primary: {
        bg: 'bg-primary-50',
        icon: 'text-primary-500',
        ring: 'ring-primary-500/20',
        glow: 'shadow-primary-500/25',
      },
      secondary: {
        bg: 'bg-secondary-50',
        icon: 'text-secondary-500',
        ring: 'ring-secondary-500/20',
        glow: 'shadow-secondary-500/25',
      },
      success: {
        bg: 'bg-success-50',
        icon: 'text-success-500',
        ring: 'ring-success-500/20',
        glow: 'shadow-success-500/25',
      },
      warning: {
        bg: 'bg-warning-50',
        icon: 'text-warning-500',
        ring: 'ring-warning-500/20',
        glow: 'shadow-warning-500/25',
      },
    };
    return colors[color] || colors.primary;
  };

  const getActivityColor = (color: string) => {
    const colors: Record<string, { bg: string; ring: string }> = {
      success: { bg: 'bg-success-500', ring: 'ring-success-500/20' },
      info: { bg: 'bg-info-500', ring: 'ring-info-500/20' },
      secondary: { bg: 'bg-secondary-500', ring: 'ring-secondary-500/20' },
      warning: { bg: 'bg-warning-500', ring: 'ring-warning-500/20' },
    };
    return colors[color] || { bg: 'bg-gray-500', ring: 'ring-gray-500/20' };
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      className="space-y-8"
    >
      {/* Page Header */}
      <motion.div
        variants={fadeInUp}
        className="page-header"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <motion.div variants={fadeInLeft}>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-description">Welcome back! Here's an overview of your venue.</p>
          </motion.div>
          <motion.div
            variants={fadeInRight}
            className="flex items-center gap-3"
          >
            <motion.div whileTap={buttonTap}>
              <Link to="/deals/new" className="btn btn-primary group">
                <Plus className="w-4 h-4 transition-transform group-hover:rotate-90 duration-300" />
                Create Deal
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={staggerContainer}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
      >
        {stats.map((stat, index) => {
          const colorClasses = getStatColorClasses(stat.color);
          return (
            <motion.div
              key={stat.name}
              variants={fadeInUp}
              initial="rest"
              whileHover="hover"
              className="group"
            >
              <motion.div
                variants={cardHover}
                className={`card p-6 relative overflow-hidden cursor-pointer transition-shadow duration-300 hover:shadow-xl ${colorClasses.glow}`}
              >
                {/* Background gradient on hover */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                />

                <div className="relative">
                  <div className="flex items-start justify-between gap-3">
                    <motion.div
                      variants={iconFloat}
                      className={`stat-icon flex-shrink-0 ${colorClasses.bg} ring-8 ${colorClasses.ring}`}
                    >
                      <stat.icon className={`w-6 h-6 ${colorClasses.icon}`} />
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 + 0.3 }}
                      className={`stat-change flex-shrink-0 ${
                        stat.changeType === 'up' ? 'stat-change-up' : 'stat-change-down'
                      }`}
                    >
                      {stat.changeType === 'up' ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      {stat.change}
                    </motion.div>
                  </div>
                  <div className="mt-4 min-w-0">
                    <motion.p
                      className="stat-value truncate"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 + 0.2 }}
                    >
                      {stat.value}
                    </motion.p>
                    <p className="stat-label truncate">{stat.name}</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <motion.div
          variants={fadeInUp}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3,
              }}
            >
              <Zap className="w-5 h-5 text-warning-500" />
            </motion.div>
          </div>
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-3"
          >
            <motion.div variants={fadeInUp} whileTap={buttonTap}>
              <Link
                to="/deals/new"
                className="flex items-center gap-4 p-4 bg-gradient-primary rounded-xl text-white hover:translate-y-[-2px] hover:shadow-button-hover transition-all group"
              >
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm flex-shrink-0">
                  <Tag className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">Create New Deal</p>
                  <p className="text-sm text-white/80 truncate">Attract more customers</p>
                </div>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform flex-shrink-0" />
              </Link>
            </motion.div>

            <motion.div variants={fadeInUp} whileTap={buttonTap}>
              <Link
                to="/events/new"
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
              >
                <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-secondary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">Schedule Event</p>
                  <p className="text-sm text-gray-500 truncate">Plan your next event</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 group-hover:text-gray-600 transition-all flex-shrink-0" />
              </Link>
            </motion.div>

            <motion.div variants={fadeInUp} whileTap={buttonTap}>
              <Link
                to="/chat"
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
              >
                <div className="w-10 h-10 bg-info-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-5 h-5 text-info-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">View Messages</p>
                  <p className="text-sm text-gray-500 truncate">3 unread messages</p>
                </div>
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 15,
                    delay: 0.5
                  }}
                  className="px-2.5 py-1 bg-error-500 text-white text-xs font-bold rounded-full flex-shrink-0"
                >
                  3
                </motion.span>
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          variants={fadeInUp}
          className="card p-6 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <motion.div
                className="w-2 h-2 bg-success-500 rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.7, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              />
            </div>
            <Link
              to="/analytics"
              className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1 group"
            >
              View all
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-2"
          >
            {recentActivity.map((activity, index) => {
              const activityColor = getActivityColor(activity.color);
              const ActivityIcon = activity.icon;
              return (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  whileHover={{
                    backgroundColor: 'rgba(0,0,0,0.02)',
                    x: 4,
                    transition: { duration: 0.2 }
                  }}
                  className="flex items-center gap-4 p-3 rounded-xl transition-colors cursor-pointer"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      delay: index * 0.1 + 0.3,
                      type: "spring",
                      stiffness: 400,
                      damping: 15,
                    }}
                    className={`w-10 h-10 ${activityColor.bg.replace('bg-', 'bg-').replace('-500', '-100')} rounded-lg flex items-center justify-center`}
                  >
                    <ActivityIcon className={`w-5 h-5 ${activityColor.bg.replace('bg-', 'text-')}`} />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 truncate">{activity.message}</p>
                  </div>
                  <span className="flex items-center gap-1.5 text-xs text-gray-400 whitespace-nowrap">
                    <Clock className="w-3.5 h-3.5" />
                    {activity.time}
                  </span>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </div>

      {/* Performance Banner */}
      <motion.div
        variants={scaleIn}
        whileHover={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="card p-6 bg-gradient-dark text-white overflow-hidden relative"
      >
        {/* Animated background elements */}
        <motion.div
          className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full"
          animate={{
            x: [0, 10, 0],
            y: [0, -10, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ transform: 'translate(50%, -50%)' }}
        />
        <motion.div
          className="absolute right-20 bottom-0 w-32 h-32 bg-white/5 rounded-full"
          animate={{
            x: [0, -10, 0],
            y: [0, 10, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          style={{ transform: 'translateY(50%)' }}
        />

        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <motion.div
              className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm"
              animate={{
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Sparkles className="w-7 h-7 text-warning-400" />
            </motion.div>
            <div>
              <h3 className="text-lg font-semibold">Boost Your Performance</h3>
              <p className="text-white/70 text-sm">
                Create a featured deal to increase visibility by up to 3x
              </p>
            </div>
          </div>
          <motion.div whileTap={buttonTap}>
            <Link
              to="/deals/new?featured=true"
              className="btn bg-white text-gray-900 hover:bg-gray-100 shadow-lg whitespace-nowrap group"
            >
              Create Featured Deal
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
