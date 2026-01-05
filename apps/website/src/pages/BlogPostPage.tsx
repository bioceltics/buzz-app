import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  Calendar,
  Clock,
  ChevronLeft,
  Twitter,
  Facebook,
  Linkedin,
  Copy,
  Check,
  Tag,
  Eye,
  ArrowRight,
  Share2,
  Bookmark,
  Heart,
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
  content: string;
  featured_image: string | null;
  author: string;
  category: string;
  tags: string[];
  meta_title: string;
  meta_description: string;
  published_at: string;
  view_count: number;
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
      scrolled ? 'bg-white/95 backdrop-blur-xl shadow-sm' : 'bg-white/80 backdrop-blur-xl'
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
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

// Estimate read time
function estimateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
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
    'company-news': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
    'founder-spotlight': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  };
  return colors[category] || { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
}

// Share Buttons Component
function ShareButtons({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <a
        href={shareLinks.twitter}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setShowTooltip('twitter')}
        onMouseLeave={() => setShowTooltip(null)}
        className="relative w-11 h-11 rounded-xl bg-gray-100 hover:bg-sky-100 flex items-center justify-center text-gray-500 hover:text-sky-500 transition-all duration-300"
      >
        <Twitter className="w-5 h-5" />
        {showTooltip === 'twitter' && (
          <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg whitespace-nowrap">
            Share on Twitter
          </span>
        )}
      </a>
      <a
        href={shareLinks.facebook}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setShowTooltip('facebook')}
        onMouseLeave={() => setShowTooltip(null)}
        className="relative w-11 h-11 rounded-xl bg-gray-100 hover:bg-blue-100 flex items-center justify-center text-gray-500 hover:text-blue-600 transition-all duration-300"
      >
        <Facebook className="w-5 h-5" />
        {showTooltip === 'facebook' && (
          <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg whitespace-nowrap">
            Share on Facebook
          </span>
        )}
      </a>
      <a
        href={shareLinks.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setShowTooltip('linkedin')}
        onMouseLeave={() => setShowTooltip(null)}
        className="relative w-11 h-11 rounded-xl bg-gray-100 hover:bg-blue-100 flex items-center justify-center text-gray-500 hover:text-blue-700 transition-all duration-300"
      >
        <Linkedin className="w-5 h-5" />
        {showTooltip === 'linkedin' && (
          <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg whitespace-nowrap">
            Share on LinkedIn
          </span>
        )}
      </a>
      <button
        onClick={copyToClipboard}
        onMouseEnter={() => setShowTooltip('copy')}
        onMouseLeave={() => setShowTooltip(null)}
        className="relative w-11 h-11 rounded-xl bg-gray-100 hover:bg-emerald-100 flex items-center justify-center text-gray-500 hover:text-emerald-600 transition-all duration-300"
      >
        {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
        {showTooltip === 'copy' && (
          <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg whitespace-nowrap">
            {copied ? 'Copied!' : 'Copy link'}
          </span>
        )}
      </button>
    </div>
  );
}

// Floating Action Bar
function FloatingActionBar({ title, url }: { title: string; url: string }) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 animate-slide-up">
      <div className="flex items-center gap-2 px-4 py-3 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-gray-900/20 border border-gray-100">
        <button className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-rose-100 flex items-center justify-center text-gray-500 hover:text-rose-500 transition-all">
          <Heart className="w-5 h-5" />
        </button>
        <button className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-amber-100 flex items-center justify-center text-gray-500 hover:text-amber-500 transition-all">
          <Bookmark className="w-5 h-5" />
        </button>
        <div className="w-px h-6 bg-gray-200 mx-1" />
        <a
          href={shareLinks.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-sky-100 flex items-center justify-center text-gray-500 hover:text-sky-500 transition-all"
        >
          <Twitter className="w-5 h-5" />
        </a>
        <button
          onClick={copyToClipboard}
          className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-emerald-100 flex items-center justify-center text-gray-500 hover:text-emerald-500 transition-all"
        >
          {copied ? <Check className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}

// Related Posts Component
function RelatedPosts({ currentSlug }: { currentSlug: string }) {
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    async function fetchRelated() {
      try {
        const response = await fetch(`${API_URL}/api/blog/related/${currentSlug}?limit=3`);
        const data = await response.json();
        setPosts(data.posts || []);
      } catch (error) {
        console.error('Failed to fetch related posts:', error);
      }
    }
    fetchRelated();
  }, [currentSlug]);

  if (posts.length === 0) return null;

  return (
    <section className="py-12 px-4 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Continue Reading</h2>
            <p className="text-gray-600 text-sm">More articles you might enjoy</p>
          </div>
          <Link
            to="/blog"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium text-sm rounded-full hover:border-gray-300 hover:bg-gray-50 transition-all"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => {
            const categoryColor = getCategoryColor(post.category);
            return (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-primary-200 hover:shadow-xl transition-all duration-300"
              >
                <div className="aspect-[16/9] bg-gradient-to-br from-primary-100 via-pink-50 to-amber-50 relative overflow-hidden">
                  {post.featured_image ? (
                    <img
                      src={post.featured_image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BookOpen className="w-10 h-10 text-primary-400" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border backdrop-blur-sm ${categoryColor.bg} ${categoryColor.text} ${categoryColor.border}`}>
                      {post.category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-base text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 mb-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">{post.excerpt}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{formatDate(post.published_at)}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                    <span>{estimateReadTime(post.content || post.excerpt)} min read</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// Main Blog Post Page Component
export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPost() {
      if (!slug) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_URL}/api/blog/posts/${slug}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError('Post not found');
          } else {
            setError('Failed to load post');
          }
          return;
        }

        const data = await response.json();
        setPost(data.post);

        if (data.post) {
          document.title = `${data.post.meta_title || data.post.title} | Buzzee Blog`;
          const metaDescription = document.querySelector('meta[name="description"]');
          if (metaDescription) {
            metaDescription.setAttribute('content', data.post.meta_description || data.post.excerpt);
          }
        }
      } catch (err) {
        console.error('Failed to fetch post:', err);
        setError('Failed to load post');
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  // Add IDs to headings for TOC navigation
  useEffect(() => {
    if (post?.content) {
      setTimeout(() => {
        const article = document.querySelector('.prose');
        if (article) {
          const h2s = article.querySelectorAll('h2');
          h2s.forEach((h, index) => {
            h.id = `heading-${index}`;
          });
        }
      }, 100);
    }
  }, [post?.content]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="pt-32 pb-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-8">
              <div className="h-6 bg-gray-200 rounded-full w-24" />
              <div className="h-14 bg-gray-200 rounded-xl w-full" />
              <div className="h-14 bg-gray-200 rounded-xl w-3/4" />
              <div className="flex gap-6">
                <div className="h-5 bg-gray-200 rounded-lg w-32" />
                <div className="h-5 bg-gray-200 rounded-lg w-32" />
                <div className="h-5 bg-gray-200 rounded-lg w-32" />
              </div>
              <div className="aspect-video bg-gray-200 rounded-3xl" />
              <div className="space-y-4">
                <div className="h-5 bg-gray-200 rounded-lg" />
                <div className="h-5 bg-gray-200 rounded-lg" />
                <div className="h-5 bg-gray-200 rounded-lg w-4/5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="pt-32 pb-16 px-4">
          <div className="max-w-2xl mx-auto text-center py-24">
            <div className="w-28 h-28 rounded-3xl bg-gray-100 flex items-center justify-center mx-auto mb-8">
              <BookOpen className="w-14 h-14 text-gray-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{error || 'Article not found'}</h1>
            <p className="text-lg text-gray-600 mb-10">
              The article you're looking for doesn't exist or has been moved.
            </p>
            <button
              onClick={() => navigate('/blog')}
              className="px-8 py-4 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/20"
            >
              Back to Blog
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const categoryColor = getCategoryColor(post.category);

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <FloatingActionBar title={post.title} url={currentUrl} />

      <article className="pt-28 pb-16">
        <div className="max-w-3xl mx-auto px-4">
          {/* Article Header */}
          <header className="mb-8">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
              <Link to="/" className="hover:text-gray-900 transition-colors">Home</Link>
              <ChevronLeft className="w-3.5 h-3.5 rotate-180" />
              <Link to="/blog" className="hover:text-gray-900 transition-colors">Blog</Link>
              <ChevronLeft className="w-3.5 h-3.5 rotate-180" />
              <Link to={`/blog?category=${post.category}`} className="hover:text-gray-900 transition-colors capitalize">
                {post.category.replace(/-/g, ' ')}
              </Link>
            </nav>

            {/* Category Badge */}
            <Link
              to={`/blog?category=${post.category}`}
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border mb-4 hover:scale-105 transition-transform ${categoryColor.bg} ${categoryColor.text} ${categoryColor.border}`}
            >
              {post.category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Link>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-5 leading-tight">
              {post.title}
            </h1>

            {/* Excerpt */}
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              {post.excerpt}
            </p>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 pb-6 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 via-primary-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                  {post.author.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{post.author}</p>
                  <p className="text-xs text-gray-500">Content Team</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {formatDate(post.published_at)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {estimateReadTime(post.content)} min read
                </span>
                <span className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4" />
                  {post.view_count.toLocaleString()} views
                </span>
              </div>
            </div>
          </header>

          {/* Featured Image */}
          {post.featured_image && (
            <div className="mb-10">
              <div className="aspect-[2/1] rounded-2xl overflow-hidden bg-gray-100 shadow-lg">
                <img
                  src={post.featured_image}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Share Buttons */}
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Share this article</span>
            <ShareButtons title={post.title} url={currentUrl} />
          </div>

          {/* Article Body */}
          <div
            className="blog-content prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-12 pt-6 border-t border-gray-100">
              <div className="flex flex-wrap items-center gap-2">
                <Tag className="w-4 h-4 text-gray-400" />
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm font-medium rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Share */}
          <div className="mt-10 p-6 bg-gray-50 rounded-2xl">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-1 text-sm">Enjoyed this article?</h4>
                <p className="text-gray-600 text-sm">Share it with your friends and help them discover great deals too.</p>
              </div>
              <ShareButtons title={post.title} url={currentUrl} />
            </div>
          </div>

          {/* Author Card */}
          <div className="mt-8 p-6 bg-gradient-to-br from-primary-50 via-pink-50 to-amber-50 rounded-2xl border border-primary-100">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-400 via-primary-500 to-pink-500 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                {post.author.charAt(0)}
              </div>
              <div className="text-center sm:text-left">
                <h4 className="text-lg font-bold text-gray-900 mb-1">Written by {post.author}</h4>
                <p className="text-gray-600 text-sm mb-3">
                  Part of the Buzzee content team, helping you discover the best deals and nightlife in your city.
                </p>
                <Link
                  to="/blog"
                  className="inline-flex items-center gap-1.5 text-primary-600 font-medium text-sm hover:gap-2 transition-all"
                >
                  View more articles <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Related Posts */}
      {slug && <RelatedPosts currentSlug={slug} />}

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-primary-500 via-primary-600 to-pink-500">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Download Now
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Never Miss a Deal Again
          </h2>
          <p className="text-base text-white/80 mb-8 max-w-md mx-auto">
            Get the Buzzee app and discover live deals at restaurants, bars, and clubs near you.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="#"
              className="px-6 py-3 bg-white text-primary-600 font-medium rounded-full hover:bg-gray-100 transition-all text-sm"
            >
              Download for iOS
            </a>
            <a
              href="#"
              className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white font-medium rounded-full hover:bg-white/30 transition-all border border-white/30 text-sm"
            >
              Get for Android
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-gray-900">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-pink-500 flex items-center justify-center">
                <BuzzeeIcon className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-white">Buzzee</span>
            </Link>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <Link to="/blog" className="hover:text-white transition-colors">Blog</Link>
              <a href="https://business.buzzee.ca" className="hover:text-white transition-colors">For Business</a>
            </div>
            <p className="text-gray-500 text-xs">
              &copy; {new Date().getFullYear()} Buzzee. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Blog Content Styles */}
      <style>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translate(-50%, 20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out forwards;
        }

        /* Blog Content Styling */
        .blog-content {
          font-size: 1.125rem;
          line-height: 1.8;
          color: #4b5563;
        }

        .blog-content h2 {
          font-size: 1.875rem;
          font-weight: 700;
          color: #111827;
          margin-top: 3rem;
          margin-bottom: 1.5rem;
          line-height: 1.3;
          letter-spacing: -0.025em;
        }

        .blog-content h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
          margin-top: 2rem;
          margin-bottom: 1rem;
          line-height: 1.4;
        }

        .blog-content h4 {
          font-size: 1.125rem;
          font-weight: 600;
          color: #374151;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }

        .blog-content p {
          margin-bottom: 1.5rem;
          line-height: 1.8;
        }

        .blog-content a {
          color: #7c3aed;
          font-weight: 600;
          text-decoration: none;
          border-bottom: 2px solid #c4b5fd;
          transition: all 0.2s ease;
        }

        .blog-content a:hover {
          color: #5b21b6;
          border-bottom-color: #7c3aed;
        }

        .blog-content strong {
          color: #111827;
          font-weight: 600;
        }

        .blog-content em {
          color: #374151;
          font-style: italic;
        }

        .blog-content ul,
        .blog-content ol {
          margin: 1.5rem 0;
          padding-left: 1.5rem;
        }

        .blog-content li {
          margin-bottom: 0.75rem;
          line-height: 1.7;
        }

        .blog-content li::marker {
          color: #7c3aed;
          font-weight: 700;
        }

        .blog-content blockquote {
          margin: 2.5rem 0;
          padding: 1.5rem 2rem;
          border-left: 4px solid #7c3aed;
          background: linear-gradient(to right, #f5f3ff, transparent);
          border-radius: 0 1rem 1rem 0;
          font-size: 1.125rem;
          font-weight: 500;
          color: #374151;
          font-style: normal;
        }

        .blog-content blockquote p {
          margin: 0;
        }

        /* Lead Paragraph */
        .blog-content .lead {
          font-size: 1.25rem;
          font-weight: 500;
          color: #374151;
          line-height: 1.7;
          margin-bottom: 2rem;
        }

        /* Section Divider */
        .blog-content .section-divider {
          margin: 3rem 0;
          border: none;
          border-top: 1px solid #e5e7eb;
        }

        /* Image Credit */
        .blog-content .image-credit {
          font-size: 0.875rem;
          color: #9ca3af;
          text-align: center;
          margin-top: 0.75rem;
          margin-bottom: 2rem;
        }

        /* Callout Box */
        .blog-content .callout-box {
          margin: 2.5rem 0;
          padding: 1.5rem;
          background: linear-gradient(135deg, #fefce8, #fef3c7);
          border: 1px solid #fcd34d;
          border-radius: 1rem;
        }

        .blog-content .callout-box h4 {
          font-size: 1.125rem;
          font-weight: 700;
          color: #92400e;
          margin: 0 0 0.75rem 0;
        }

        .blog-content .callout-box p {
          color: #78350f;
          margin: 0;
          font-weight: 500;
        }

        /* CTA Box */
        .blog-content .cta-box {
          margin: 2.5rem 0;
          padding: 2rem;
          background: linear-gradient(135deg, #7c3aed, #db2777);
          border-radius: 1rem;
          text-align: center;
        }

        .blog-content .cta-box h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
          margin: 0 0 0.75rem 0;
        }

        .blog-content .cta-box p {
          color: rgba(255, 255, 255, 0.9);
          font-size: 1.125rem;
          margin: 0;
        }

        .blog-content .cta-box a {
          color: white;
          font-weight: 700;
          border-bottom-color: rgba(255, 255, 255, 0.5);
        }

        .blog-content .cta-box a:hover {
          color: white;
          border-bottom-color: white;
        }

        /* Related Links */
        .blog-content .related-links {
          list-style: none;
          padding: 0;
          margin: 1.5rem 0;
        }

        .blog-content .related-links li {
          padding: 0.75rem 0;
          border-bottom: 1px solid #f3f4f6;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .blog-content .related-links li:last-child {
          border-bottom: none;
        }

        .blog-content .related-links li::before {
          content: "→";
          color: #7c3aed;
          font-weight: 700;
          font-size: 1.25rem;
        }

        .blog-content .related-links a {
          flex: 1;
        }

        /* Styled List */
        .blog-content .styled-list {
          list-style: none;
          padding: 0;
          margin: 1.5rem 0;
        }

        .blog-content .styled-list li {
          background: #f9fafb;
          padding: 1.25rem 1.5rem;
          border-radius: 0.75rem;
          border-left: 4px solid #7c3aed;
          margin-bottom: 1rem;
        }

        .blog-content .styled-list li:last-child {
          margin-bottom: 0;
        }

        .blog-content .styled-list li strong {
          display: block;
          color: #111827;
          margin-bottom: 0.5rem;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .blog-content h2 {
            font-size: 1.5rem;
            margin-top: 2rem;
          }

          .blog-content h3 {
            font-size: 1.125rem;
          }

          .blog-content .lead {
            font-size: 1.125rem;
          }

          .blog-content .callout-box,
          .blog-content .cta-box {
            padding: 1.25rem;
          }

          .blog-content .styled-list li {
            padding: 1rem 1.25rem;
          }
        }
      `}</style>
    </div>
  );
}
