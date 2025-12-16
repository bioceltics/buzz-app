import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';

interface RegisterForm {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>();

  const password = watch('password');

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      await signUp(data.email, data.password, data.fullName);
      toast.success('Account created! Please check your email to verify.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Mobile Logo */}
      <div className="lg:hidden text-center mb-8">
        <h1 className="text-3xl font-bold text-primary-500">Buzz</h1>
        <p className="text-gray-500">Venue Dashboard</p>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
        <p className="mt-2 text-gray-600">
          Start promoting your venue on Buzz
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label htmlFor="fullName" className="label">
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            autoComplete="name"
            className={`input ${errors.fullName ? 'border-red-500' : ''}`}
            placeholder="John Doe"
            {...register('fullName', {
              required: 'Full name is required',
            })}
          />
          {errors.fullName && (
            <p className="mt-1 text-sm text-red-500">{errors.fullName.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="label">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className={`input ${errors.email ? 'border-red-500' : ''}`}
            placeholder="you@example.com"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /\S+@\S+\.\S+/,
                message: 'Invalid email format',
              },
            })}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="label">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className={`input pr-10 ${errors.password ? 'border-red-500' : ''}`}
              placeholder="••••••••"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters',
                },
              })}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="label">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            className={`input ${errors.confirmPassword ? 'border-red-500' : ''}`}
            placeholder="••••••••"
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (value) =>
                value === password || 'Passwords do not match',
            })}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-500">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary w-full py-3"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-gray-500">
        By creating an account, you agree to our{' '}
        <a href="#" className="text-primary-500 hover:text-primary-600">
          Terms of Service
        </a>{' '}
        and{' '}
        <a href="#" className="text-primary-500 hover:text-primary-600">
          Privacy Policy
        </a>
      </p>

      <p className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link
          to="/login"
          className="text-primary-500 hover:text-primary-600 font-medium"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
