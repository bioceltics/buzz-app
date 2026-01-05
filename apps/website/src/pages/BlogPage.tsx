import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Menu,
  X,
  Calendar,
  Clock,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Search,
  TrendingUp,
  Sparkles,
  BookOpen,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.buzzee.ca';

// Types
interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image: string | null;
  author: string;
  category: string;
  tags: string[];
  published_at: string;
  view_count: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Custom Buzzee Logo Icon
function BuzzeeIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="12" y="17" fontSize="18" fontWeight="bold" fill="white" textAnchor="middle">B</text>
    </svg>
  );
}

// Navigation Component
function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/95 backdrop-blur-xl shadow-sm' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary-500 via-primary-600 to-pink-500 flex items-center justify-center shadow-lg shadow-primary-500/30">
              <BuzzeeIcon className="w-7 h-7" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Buzzee</span>
          </Link>

          <div className="hidden md:flex items-center gap-10">
            <Link to="/" className="text-gray-600 hover:text-gray-900 font-medium transition-colors relative group">
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-500 transition-all group-hover:w-full" />
            </Link>
            <Link to="/blog" className="text-primary-600 font-semibold relative">
              Blog
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary-500" />
            </Link>
            <a href="https://business.buzzee.ca" className="text-gray-600 hover:text-gray-900 font-medium transition-colors relative group">
              For Business
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-500 transition-all group-hover:w-full" />
            </a>
            <a href="#download" className="px-5 py-2.5 bg-gray-900 text-white font-medium rounded-full hover:bg-gray-800 transition-all hover:shadow-lg">
              Get the App
            </a>
          </div>

          <button
            className="md:hidden p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-6 border-t border-gray-100 bg-white">
            <div className="flex flex-col gap-2">
              <Link to="/" className="text-gray-600 font-medium py-3 px-4 hover:bg-gray-50 rounded-xl transition-colors">Home</Link>
              <Link to="/blog" className="text-primary-600 font-semibold py-3 px-4 bg-primary-50 rounded-xl">Blog</Link>
              <a href="https://business.buzzee.ca" className="text-gray-600 font-medium py-3 px-4 hover:bg-gray-50 rounded-xl transition-colors">For Business</a>
              <a href="#download" className="mt-2 py-3 px-4 bg-gray-900 text-white font-medium rounded-xl text-center">Get the App</a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

// Format date helper
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Estimate read time
function estimateReadTime(excerpt: string): number {
  const wordsPerMinute = 200;
  const words = excerpt.split(' ').length * 5;
  return Math.max(3, Math.ceil(words / wordsPerMinute));
}

// Get category color
function getCategoryColor(category: string): { bg: string; text: string; border: string } {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    'deals-offers': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    'restaurant-guides': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    'nightlife': { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
    'food-trends': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
    'business-tips': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    'happy-hour': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
    'city-guides': { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
  };
  return colors[category] || { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
}

// Featured Post Component (Hero)
function FeaturedPost({ post }: { post: BlogPost }) {
  const categoryColor = getCategoryColor(post.category);

  return (
    <Link to={`/blog/${post.slug}`} className="group relative block">
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* Image */}
        <div className="relative aspect-[4/3] lg:aspect-[3/2] rounded-3xl overflow-hidden bg-gradient-to-br from-primary-100 via-pink-50 to-amber-50">
          {post.featured_image ? (
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 rounded-3xl bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-xl">
                <Sparkles className="w-12 h-12 text-primary-500" />
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Featured Badge */}
          <div className="absolute top-6 left-6">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/95 backdrop-blur-sm rounded-full text-sm font-semibold text-gray-900 shadow-lg">
              <TrendingUp className="w-4 h-4 text-primary-500" />
              Featured
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          <div className={`inline-flex px-4 py-1.5 rounded-full text-sm font-semibold border ${categoryColor.bg} ${categoryColor.text} ${categoryColor.border}`}>
            {post.category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight group-hover:text-primary-600 transition-colors duration-300">
            {post.title}
          </h2>

          <p className="text-lg text-gray-600 leading-relaxed line-clamp-3">
            {post.excerpt}
          </p>

          <div className="flex items-center gap-6 text-sm text-gray-500">
            <span className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-pink-400 flex items-center justify-center text-white text-xs font-bold">
                {post.author.charAt(0)}
              </div>
              {post.author}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {formatDate(post.published_at)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {estimateReadTime(post.excerpt)} min read
            </span>
          </div>

          <div className="inline-flex items-center gap-2 text-primary-600 font-semibold group-hover:gap-4 transition-all duration-300">
            Read Article
            <ArrowRight className="w-5 h-5" />
          </div>
        </div>
      </div>
    </Link>
  );
}

// Blog Card Component
function BlogCard({ post, variant = 'default' }: { post: BlogPost; variant?: 'default' | 'compact' }) {
  const categoryColor = getCategoryColor(post.category);

  if (variant === 'compact') {
    return (
      <Link to={`/blog/${post.slug}`} className="group flex gap-5 p-4 -mx-4 rounded-2xl hover:bg-gray-50 transition-all duration-300">
        <div className="w-28 h-28 flex-shrink-0 rounded-2xl overflow-hidden bg-gradient-to-br from-primary-100 to-pink-100">
          {post.featured_image ? (
            <img src={post.featured_image} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-primary-400" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold mb-2 ${categoryColor.bg} ${categoryColor.text}`}>
            {post.category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </span>
          <h3 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 mb-1">
            {post.title}
          </h3>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>{formatDate(post.published_at)}</span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span>{estimateReadTime(post.excerpt)} min</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/blog/${post.slug}`} className="group flex flex-col h-full bg-white rounded-3xl overflow-hidden border border-gray-100 hover:border-primary-200 hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-500">
      {/* Image */}
      <div className="aspect-[16/10] bg-gradient-to-br from-primary-100 via-pink-50 to-amber-50 relative overflow-hidden">
        {post.featured_image ? (
          <img
            src={post.featured_image}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <BookOpen className="w-8 h-8 text-primary-500" />
            </div>
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-sm ${categoryColor.bg} ${categoryColor.text} ${categoryColor.border}`}>
            {post.category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </span>
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-6">
          <span className="px-5 py-2.5 bg-white rounded-full text-sm font-semibold text-gray-900 flex items-center gap-2 shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
            Read Article <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 flex flex-col">
        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors line-clamp-2">
          {post.title}
        </h3>
        <p className="text-gray-600 mb-5 line-clamp-2 flex-1">
          {post.excerpt}
        </p>

        {/* Meta */}
        <div className="flex items-center justify-between text-sm pt-5 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-pink-400 flex items-center justify-center text-white text-xs font-bold">
              {post.author.charAt(0)}
            </div>
            <span className="text-gray-600">{post.author}</span>
          </div>
          <div className="flex items-center gap-3 text-gray-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {estimateReadTime(post.excerpt)} min
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Category Filter Component
function CategoryFilter({
  categories,
  activeCategory,
  onSelect,
}: {
  categories: Category[];
  activeCategory: string | null;
  onSelect: (slug: string | null) => void;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={() => onSelect(null)}
        className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
          !activeCategory
            ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20'
            : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
        }`}
      >
        All Posts
      </button>
      {categories.map((category) => {
        const colors = getCategoryColor(category.slug);
        return (
          <button
            key={category.id}
            onClick={() => onSelect(category.slug)}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
              activeCategory === category.slug
                ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20'
                : `bg-white border ${colors.border} ${colors.text} hover:bg-gray-50`
            }`}
          >
            {category.name}
          </button>
        );
      })}
    </div>
  );
}

// Pagination Component
function Pagination({ pagination, onPageChange }: { pagination: PaginationInfo; onPageChange: (page: number) => void }) {
  if (pagination.totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-16">
      <button
        onClick={() => onPageChange(pagination.page - 1)}
        disabled={pagination.page === 1}
        className="w-12 h-12 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-1 px-2">
        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
          .filter((page) => {
            const distance = Math.abs(page - pagination.page);
            return distance === 0 || distance === 1 || page === 1 || page === pagination.totalPages;
          })
          .map((page, index, array) => {
            const prevPage = array[index - 1];
            const showEllipsis = prevPage && page - prevPage > 1;

            return (
              <div key={page} className="flex items-center gap-1">
                {showEllipsis && <span className="px-3 text-gray-400">...</span>}
                <button
                  onClick={() => onPageChange(page)}
                  className={`w-12 h-12 rounded-xl font-semibold transition-all ${
                    page === pagination.page
                      ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  {page}
                </button>
              </div>
            );
          })}
      </div>

      <button
        onClick={() => onPageChange(pagination.page + 1)}
        disabled={pagination.page === pagination.totalPages}
        className="w-12 h-12 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}

// Main Blog Page Component
export default function BlogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({ page: 1, limit: 9, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const activeCategory = searchParams.get('category');
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  // Fetch posts
  useEffect(() => {
    async function fetchPosts() {
      setLoading(true);
      try {
        let url = `${API_URL}/api/blog/posts?page=${currentPage}&limit=10`;
        if (activeCategory) url += `&category=${activeCategory}`;

        const response = await fetch(url);
        const data = await response.json();

        setPosts(data.posts || []);
        setPagination(data.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 });
      } catch (error) {
        console.error('Failed to fetch posts:', error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, [activeCategory, currentPage]);

  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch(`${API_URL}/api/blog/categories`);
        const data = await response.json();
        setCategories(data.categories || []);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    }
    fetchCategories();
  }, []);

  const handleCategorySelect = (categorySlug: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (categorySlug) {
      newParams.set('category', categorySlug);
    } else {
      newParams.delete('category');
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const featuredPost = posts[0];
  const remainingPosts = posts.slice(1);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-white via-white to-gray-50 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, gray 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-full text-primary-600 text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4" />
              Discover, Learn, Save
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              The Buzzee <span className="bg-gradient-to-r from-primary-500 to-pink-500 bg-clip-text text-transparent">Blog</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Expert insights on finding the best deals, restaurant guides, nightlife tips, and the latest food trends in your city.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-5 pl-14 rounded-2xl bg-white border border-gray-200 focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all text-lg shadow-sm"
              />
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 px-5 py-2.5 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-all">
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 px-4 bg-white border-y border-gray-100 sticky top-20 z-30">
        <div className="max-w-7xl mx-auto">
          <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
            <CategoryFilter categories={categories} activeCategory={activeCategory} onSelect={handleCategorySelect} />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="space-y-16">
              {/* Featured skeleton */}
              <div className="grid lg:grid-cols-2 gap-12 items-center animate-pulse">
                <div className="aspect-[4/3] lg:aspect-[3/2] rounded-3xl bg-gray-200" />
                <div className="space-y-6">
                  <div className="h-6 bg-gray-200 rounded-full w-24" />
                  <div className="h-12 bg-gray-200 rounded-xl w-full" />
                  <div className="h-12 bg-gray-200 rounded-xl w-3/4" />
                  <div className="h-6 bg-gray-200 rounded-lg w-full" />
                  <div className="h-6 bg-gray-200 rounded-lg w-2/3" />
                </div>
              </div>

              {/* Grid skeleton */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-3xl overflow-hidden border border-gray-100 animate-pulse">
                    <div className="aspect-[16/10] bg-gray-200" />
                    <div className="p-6 space-y-4">
                      <div className="h-6 bg-gray-200 rounded-lg" />
                      <div className="h-4 bg-gray-200 rounded-lg w-3/4" />
                      <div className="h-4 bg-gray-200 rounded-lg w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : posts.length > 0 ? (
            <>
              {/* Featured Post */}
              {currentPage === 1 && !activeCategory && featuredPost && (
                <div className="mb-20">
                  <FeaturedPost post={featuredPost} />
                </div>
              )}

              {/* Section Header */}
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-2xl font-bold text-gray-900">
                  {activeCategory
                    ? `${activeCategory.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Articles`
                    : 'Latest Articles'
                  }
                </h2>
                <span className="text-gray-500">{pagination.total} articles</span>
              </div>

              {/* Posts Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {(currentPage === 1 && !activeCategory ? remainingPosts : posts).map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>

              <Pagination pagination={pagination} onPageChange={handlePageChange} />
            </>
          ) : (
            <div className="text-center py-24">
              <div className="w-24 h-24 rounded-3xl bg-gray-100 flex items-center justify-center mx-auto mb-8">
                <BookOpen className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No articles found</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {activeCategory
                  ? 'No articles in this category yet. Check back soon for fresh content!'
                  : 'We\'re working on bringing you great content. Check back soon!'}
              </p>
              {activeCategory && (
                <button
                  onClick={() => handleCategorySelect(null)}
                  className="px-8 py-4 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/20"
                >
                  View All Articles
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-24 px-4 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        </div>

        <div className="max-w-3xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-white/80 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Join 10,000+ readers
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Never Miss a Deal
          </h2>
          <p className="text-xl text-gray-400 mb-10 max-w-xl mx-auto">
            Get exclusive deals, restaurant recommendations, and nightlife tips delivered to your inbox weekly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:bg-white/15 focus:border-white/30 focus:ring-2 focus:ring-white/20 outline-none transition-all"
            />
            <button className="px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-all shadow-lg">
              Subscribe
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-4">No spam, unsubscribe anytime.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900 border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-pink-500 flex items-center justify-center">
                <BuzzeeIcon className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold text-white">Buzzee</span>
            </Link>
            <div className="flex items-center gap-8 text-gray-400">
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <Link to="/blog" className="hover:text-white transition-colors">Blog</Link>
              <a href="https://business.buzzee.ca" className="hover:text-white transition-colors">For Business</a>
            </div>
            <p className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} Buzzee. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
