import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Loader2, Mail, Lock, ArrowRight, Building2, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';

interface LoginForm {
  email: string;
  password: string;
}

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const inputFocus = {
  scale: 1.02,
  transition: { type: "spring", stiffness: 300, damping: 20 }
};

const buttonTap = {
  scale: 0.97,
};

const floatingAnimation = {
  y: [-10, 10],
  transition: {
    y: {
      duration: 3,
      repeat: Infinity,
      repeatType: "reverse" as const,
      ease: "easeInOut",
    },
  },
};

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      await signIn(data.email, data.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={staggerContainer}
      className="relative"
    >
      {/* Decorative floating elements */}
      <motion.div
        animate={floatingAnimation}
        className="absolute -top-20 -right-20 w-40 h-40 bg-primary-100/50 rounded-full blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{
          ...floatingAnimation,
          transition: { ...floatingAnimation.transition, delay: 1 },
        }}
        className="absolute -bottom-20 -left-20 w-32 h-32 bg-secondary-100/50 rounded-full blur-3xl pointer-events-none"
      />

      {/* Mobile Logo */}
      <motion.div
        variants={fadeInUp}
        className="lg:hidden text-center mb-10"
      >
        <motion.div
          whileHover={{ scale: 1.05, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-500 shadow-lg shadow-primary-500/25 mb-4 relative overflow-hidden group cursor-pointer"
        >
          <motion.div
            className="absolute inset-0 bg-white/20"
            initial={{ x: '-100%', opacity: 0 }}
            whileHover={{ x: '100%', opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
          <span className="text-white font-bold text-2xl relative z-10">B</span>
        </motion.div>
        <motion.h1
          variants={fadeInUp}
          className="text-3xl font-bold text-gray-900"
        >
          Buzz
        </motion.h1>
        <motion.p
          variants={fadeInUp}
          className="text-gray-500 mt-1"
        >
          Venue Dashboard
        </motion.p>
      </motion.div>

      {/* Header */}
      <motion.div
        variants={staggerContainer}
        className="text-center mb-10"
      >
        <motion.div
          variants={scaleIn}
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary-50 mb-4 relative"
        >
          <Building2 className="w-7 h-7 text-primary-500" />
          <motion.div
            className="absolute -top-1 -right-1"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
          >
            <Sparkles className="w-4 h-4 text-warning-400" />
          </motion.div>
        </motion.div>
        <motion.h2
          variants={fadeInUp}
          className="text-2xl font-bold text-gray-900"
        >
          Welcome back
        </motion.h2>
        <motion.p
          variants={fadeInUp}
          className="mt-2 text-gray-500"
        >
          Sign in to manage your venue and deals
        </motion.p>
      </motion.div>

      <motion.form
        variants={staggerContainer}
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5"
      >
        {/* Email Field */}
        <motion.div variants={fadeInUp}>
          <label htmlFor="email" className="label">
            Email address
          </label>
          <motion.div
            className="relative"
            animate={focusedField === 'email' ? inputFocus : {}}
          >
            <motion.div
              className="absolute left-4 top-1/2 -translate-y-1/2"
              animate={{
                color: focusedField === 'email' ? '#FF6B35' : '#9CA3AF',
              }}
            >
              <Mail className="w-5 h-5" />
            </motion.div>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className={`input pl-12 transition-all duration-300 ${
                errors.email ? 'input-error' : ''
              } ${focusedField === 'email' ? 'ring-2 ring-primary-500/20 border-primary-500' : ''}`}
              placeholder="you@example.com"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: 'Invalid email format',
                },
              })}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
            />
          </motion.div>
          <AnimatePresence>
            {errors.email && (
              <motion.p
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="mt-2 text-sm text-error-600 flex items-center gap-1 overflow-hidden"
              >
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-1 h-1 rounded-full bg-error-500"
                />
                {errors.email.message}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Password Field */}
        <motion.div variants={fadeInUp}>
          <label htmlFor="password" className="label">
            Password
          </label>
          <motion.div
            className="relative"
            animate={focusedField === 'password' ? inputFocus : {}}
          >
            <motion.div
              className="absolute left-4 top-1/2 -translate-y-1/2"
              animate={{
                color: focusedField === 'password' ? '#FF6B35' : '#9CA3AF',
              }}
            >
              <Lock className="w-5 h-5" />
            </motion.div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              className={`input pl-12 pr-12 transition-all duration-300 ${
                errors.password ? 'input-error' : ''
              } ${focusedField === 'password' ? 'ring-2 ring-primary-500/20 border-primary-500' : ''}`}
              placeholder="••••••••"
              {...register('password', {
                required: 'Password is required',
              })}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
            />
            <motion.button
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              <AnimatePresence mode="wait">
                {showPassword ? (
                  <motion.div
                    key="eyeOff"
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.15 }}
                  >
                    <EyeOff className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="eye"
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Eye className="w-5 h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.div>
          <AnimatePresence>
            {errors.password && (
              <motion.p
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="mt-2 text-sm text-error-600 flex items-center gap-1 overflow-hidden"
              >
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-1 h-1 rounded-full bg-error-500"
                />
                {errors.password.message}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Remember & Forgot */}
        <motion.div
          variants={fadeInUp}
          className="flex items-center justify-between"
        >
          <label className="flex items-center cursor-pointer group">
            <motion.input
              type="checkbox"
              whileTap={{ scale: 0.9 }}
              className="w-4 h-4 rounded border-2 border-gray-300 text-primary-500 focus:ring-primary-500 focus:ring-offset-0"
            />
            <span className="ml-2.5 text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
              Remember me
            </span>
          </label>
          <motion.div whileHover={{ x: 2 }}>
            <Link
              to="/forgot-password"
              className="text-sm text-primary-600 hover:text-primary-700 font-semibold transition-colors"
            >
              Forgot password?
            </Link>
          </motion.div>
        </motion.div>

        {/* Submit Button */}
        <motion.div variants={fadeInUp}>
          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={buttonTap}
            className="btn btn-primary w-full py-3.5 text-base group relative overflow-hidden"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
              initial={{ x: '-100%' }}
              whileHover={{ x: '100%' }}
              transition={{ duration: 0.6 }}
            />
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Loader2 className="w-5 h-5 animate-spin" />
                </motion.div>
              ) : (
                <motion.div
                  key="content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  Sign In
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </motion.div>
      </motion.form>

      {/* Divider */}
      <motion.div
        variants={fadeIn}
        className="relative my-8"
      >
        <div className="absolute inset-0 flex items-center">
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="w-full border-t border-gray-200"
          />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="relative flex justify-center text-sm"
        >
          <span className="px-4 bg-white text-gray-500">New to Buzz?</span>
        </motion.div>
      </motion.div>

      {/* Register Link */}
      <motion.div
        variants={fadeInUp}
        whileHover={{ scale: 1.02 }}
        whileTap={buttonTap}
      >
        <Link
          to="/register"
          className="btn btn-outline w-full py-3 group"
        >
          Create a venue account
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </motion.div>

      {/* Footer */}
      <motion.p
        variants={fadeIn}
        transition={{ delay: 0.7 }}
        className="mt-8 text-center text-xs text-gray-400"
      >
        By signing in, you agree to our{' '}
        <motion.a
          href="#"
          whileHover={{ color: '#FF6B35' }}
          className="text-gray-600 transition-colors"
        >
          Terms of Service
        </motion.a>{' '}
        and{' '}
        <motion.a
          href="#"
          whileHover={{ color: '#FF6B35' }}
          className="text-gray-600 transition-colors"
        >
          Privacy Policy
        </motion.a>
      </motion.p>
    </motion.div>
  );
}
