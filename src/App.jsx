import { useState, useEffect } from 'react'
import ChatWidget from './components/Chatwidget'
import Launcher from './components/Launcher'
import ErrorBoundary from './components/ErrorBoundary'
import { api } from './services/api'
import { LayoutGrid, Star, MapPin, Search, Award, Info, Sparkles, MessageCircle, Building2 } from 'lucide-react'

export default function App() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchVal, setSearchVal] = useState('')
  const [chatQuery, setChatQuery] = useState('')
  const [chatAction, setChatAction] = useState('')

  const [categories, setCategories] = useState([])
  const [trendingList, setTrendingList] = useState([])
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [cats, trend] = await Promise.all([
          api.getCategories(),
          api.getTrending()
        ]);
        setCategories(Array.isArray(cats) ? cats : []);
        setTrendingList(Array.isArray(trend) ? trend : []);
      } catch (err) {
        console.error("Failed to load landing page data:", err);
      } finally {
        setLoadingData(false);
      }
    }
    loadData();
  }, []);

  const handleSearchSubmit = () => {
    if (searchVal.trim()) {
      setChatQuery(searchVal.trim())
      setIsOpen(true)
      setSearchVal('')
    }
  }

  const handleTrendingClick = (city) => {
    setChatQuery(`listings in ${city}`)
    setIsOpen(true)
  }

  const handleCategoryClick = (categoryName) => {
    setChatQuery(`find ${categoryName}`)
    setIsOpen(true)
  }

  const handleBusinessClick = (bizName) => {
    setChatQuery(bizName)
    setIsOpen(true)
  }

  const handleAddBusinessClick = () => {
    setChatAction('add_new_business')
    setIsOpen(true)
  }

  const scrollToSection = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // Fallback category icons mapping
  const getCategoryIcon = (category) => {
    const lower = category.toLowerCase();
    if (lower.includes('restaurant') || lower.includes('pizza') || lower.includes('cafe') || lower.includes('food')) {
      return '🍔';
    }
    if (lower.includes('seo') || lower.includes('tech') || lower.includes('software') || lower.includes('digital')) {
      return '💻';
    }
    if (lower.includes('bank') || lower.includes('atm') || lower.includes('finance')) {
      return '💵';
    }
    if (lower.includes('gym') || lower.includes('health') || lower.includes('yoga') || lower.includes('fitness')) {
      return '💪';
    }
    if (lower.includes('salon') || lower.includes('beauty') || lower.includes('spa')) {
      return '✨';
    }
    if (lower.includes('hospital') || lower.includes('doctor') || lower.includes('medical')) {
      return '🏥';
    }
    if (lower.includes('school') || lower.includes('education') || lower.includes('academy')) {
      return '🎓';
    }
    return '🏢';
  };

  return (
    <ErrorBoundary>
      <div className="relative min-h-screen bg-slate-50 font-sans antialiased text-gray-900 selection:bg-indigo-500 selection:text-white">
        {/* BACKGROUND DECORATION */}
        <div className="absolute top-0 left-0 w-full h-[650px] bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-400 clip-path-hero -z-10 opacity-[0.07]"></div>

        {/* NAVBAR */}
        <header className="px-6 py-4 flex items-center justify-between border-b border-slate-100 bg-white/85 backdrop-blur-md sticky top-0 z-40 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-150 transform hover:rotate-6 transition-transform">H</div>
            <span className="text-xl font-extrabold text-slate-800 tracking-tight">Honeybee <span className="text-indigo-600 italic">Digital</span></span>
          </div>
          <nav className="hidden md:flex gap-8 text-sm font-bold text-slate-500">
            <a href="#" className="text-indigo-600 border-b-2 border-indigo-600 pb-1">Home</a>
            <a href="#categories" onClick={(e) => scrollToSection(e, 'categories')} className="hover:text-indigo-600 transition-colors">Categories</a>
            <a href="#trending" onClick={(e) => scrollToSection(e, 'trending')} className="hover:text-indigo-600 transition-colors">Trending</a>
            <a href="#about" onClick={(e) => scrollToSection(e, 'about')} className="hover:text-indigo-600 transition-colors">About</a>
          </nav>
          <button 
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-full font-bold text-xs shadow-xl shadow-indigo-100 transition-all hover:-translate-y-0.5 active:translate-y-0" 
            onClick={handleAddBusinessClick}
          >
            Add Business
          </button>
        </header>

        {/* HERO SECTION */}
        <main className="max-w-6xl mx-auto px-6 pt-16 pb-12">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full text-[10px] font-bold text-indigo-700 uppercase tracking-wider shadow-sm animate-pulse">
              <Sparkles size={11} /> AI-Powered Local Assistant
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-800 tracking-tight leading-tight">
              Discover <span className="text-indigo-600 bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Everything Near You</span> <br />
              With Natural Chat
            </h1>
            <p className="text-slate-400 text-base md:text-lg max-w-xl mx-auto font-medium leading-relaxed">
              Find businesses, look up active deals, post products, or update listings inside our dynamic AI chatbot assistant.
            </p>

            {/* SEARCH INPUT */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 max-w-3xl mx-auto pt-6">
              <div className="relative flex-1 w-full bg-white rounded-2xl shadow-xl shadow-slate-100 p-2.5 border border-slate-100 flex items-center gap-3">
                <div className="pl-3 text-indigo-500">
                  <Search size={20} />
                </div>
                <input
                  type="text"
                  placeholder="Ex. Cafe in Pune, ASE Technologies, SEO Services..."
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                  className="w-full py-3.5 text-base font-semibold text-slate-700 focus:outline-none placeholder:text-slate-300 bg-transparent"
                />
                <button 
                  onClick={handleSearchSubmit}
                  className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-8 py-3.5 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-95"
                >
                  Search
                </button>
              </div>
            </div>

            {/* TRENDING CITIES SHORTCUTS */}
            <div className="pt-6 flex flex-wrap justify-center items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <span className="flex items-center gap-1.5"><MapPin size={12} className="text-indigo-500" /> Cities:</span>
              {['Pune', 'Jaipur', 'Indore', 'Delhi'].map(city => (
                <span 
                  key={city}
                  onClick={() => handleTrendingClick(city)} 
                  className="text-indigo-600 bg-indigo-50 hover:bg-indigo-100 hover:scale-105 px-3.5 py-1.5 rounded-full cursor-pointer transition-all shadow-sm"
                >
                  {city}
                </span>
              ))}
            </div>
          </div>
        </main>

        {/* DYNAMIC CATEGORIES SECTION */}
        <section id="categories" className="max-w-6xl mx-auto px-6 py-12 scroll-mt-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                <LayoutGrid size={22} className="text-indigo-600" /> Popular Categories
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-1">Explore listings filtered by primary business type</p>
            </div>
          </div>

          {loadingData ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white border border-slate-100 p-6 rounded-2xl h-24 animate-pulse"></div>
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-10 bg-white border border-slate-100 rounded-3xl p-6">
              <p className="text-xs text-slate-400">No categories found in the database. Ensure businesses are populated.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((cat, i) => (
                <div 
                  key={i}
                  onClick={() => handleCategoryClick(cat.category)}
                  className="group bg-white border border-slate-100 hover:border-indigo-100 p-5 rounded-2xl shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-1 duration-300 flex items-center gap-4"
                >
                  <div className="w-12 h-12 bg-slate-50 group-hover:bg-indigo-50 rounded-xl flex items-center justify-center text-xl transition-colors duration-300 shadow-inner">
                    {getCategoryIcon(cat.category)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs font-bold text-slate-700 truncate group-hover:text-indigo-600 transition-colors">{cat.category}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{cat.count} Listings</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* DYNAMIC TRENDING LISTINGS */}
        <section id="trending" className="max-w-6xl mx-auto px-6 py-12 bg-white/50 border-y border-slate-100 scroll-mt-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                <Award size={22} className="text-indigo-600" /> Top Rated Spots
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-1">Highly rated businesses and trending locations in our directory</p>
            </div>
          </div>

          {loadingData ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white border border-slate-100 p-6 rounded-2xl h-48 animate-pulse"></div>
              ))}
            </div>
          ) : trendingList.length === 0 ? (
            <div className="text-center py-10 bg-white border border-slate-100 rounded-3xl p-6">
              <p className="text-xs text-slate-400">No highly-rated business data. Chat with the bot to list your business!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {trendingList.map((biz) => (
                <div 
                  key={biz.global_business_id}
                  onClick={() => handleBusinessClick(biz.business_name)}
                  className="group bg-white border border-slate-100 hover:border-indigo-100 p-5 rounded-2xl shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-1 duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-extrabold uppercase tracking-widest text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">
                        {biz.business_category || 'Listing'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold flex items-center gap-0.5">
                        <MapPin size={10} className="text-slate-300" /> {biz.city || 'Local'}
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">{biz.business_name}</h3>
                    <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed min-h-8">{biz.address || 'Address not listed.'}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={10} 
                            fill={i < Math.floor(biz.ratings || 0) ? "currentColor" : "none"} 
                            className={i < Math.floor(biz.ratings || 0) ? "text-amber-400" : "text-slate-200"} 
                          />
                        ))}
                      </div>
                      <span className="text-[10px] font-extrabold text-slate-600">
                        {biz.ratings ? biz.ratings.toFixed(1) : '0.0'}
                      </span>
                      <span className="text-[9px] text-slate-400">({biz.reviews_count || 0})</span>
                    </div>
                    
                    <button className="text-[10px] font-bold text-indigo-600 group-hover:text-indigo-700 flex items-center gap-1">
                      Chat <MessageCircle size={10} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ABOUT SECTION */}
        <section id="about" className="max-w-6xl mx-auto px-6 py-16 scroll-mt-20">
          <div className="bg-gradient-to-r from-indigo-900 to-indigo-950 text-white rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-10"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 border border-white/15 rounded-full text-[10px] font-bold text-indigo-200 uppercase tracking-widest">
                  <Info size={12} /> About CityHangAround
                </div>
                <h2 className="text-3xl font-black tracking-tight leading-tight">
                  Your Smart AI Assistant <br />
                  For Local Businesses
                </h2>
                <p className="text-indigo-200 text-xs leading-relaxed font-medium">
                  CityHangAround matches users looking for local spots with the ultimate database. Powered by search queries and local LLMs, you can find products, secure deals, register listings, or update business attributes in a few keystrokes.
                </p>
                <div className="flex flex-col gap-3 text-xs text-indigo-150">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-white/10 rounded-lg flex items-center justify-center text-indigo-300">✓</div>
                    <span>Check real-time business reviews and ratings</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-white/10 rounded-lg flex items-center justify-center text-indigo-300">✓</div>
                    <span>Manage deals and listings via verified OTP logins</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-white/10 rounded-lg flex items-center justify-center text-indigo-300">✓</div>
                    <span>Search by business name, city, address, or products</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/10 p-5 rounded-2xl hover:bg-white/10 transition-colors">
                  <Building2 className="text-indigo-400 mb-2" size={24} />
                  <h4 className="text-xs font-bold mb-1">5,000+ Listings</h4>
                  <p className="text-[10px] text-indigo-200 leading-relaxed">Direct business catalog populated dynamically from the database.</p>
                </div>
                <div className="bg-white/5 border border-white/10 p-5 rounded-2xl hover:bg-white/10 transition-colors">
                  <Sparkles className="text-indigo-400 mb-2" size={24} />
                  <h4 className="text-xs font-bold mb-1">AI Assistant</h4>
                  <p className="text-[10px] text-indigo-200 leading-relaxed">Ask anything using natural language and get immediate results.</p>
                </div>
                <div className="bg-white/5 border border-white/10 p-5 rounded-2xl hover:bg-white/10 transition-colors">
                  <Star className="text-indigo-400 mb-2" size={24} />
                  <h4 className="text-xs font-bold mb-1">Real Reviews</h4>
                  <p className="text-[10px] text-indigo-200 leading-relaxed">Average ratings and reviews synced to ensure high quality recommendations.</p>
                </div>
                <div className="bg-white/5 border border-white/10 p-5 rounded-2xl hover:bg-white/10 transition-colors">
                  <LayoutGrid className="text-indigo-400 mb-2" size={24} />
                  <h4 className="text-xs font-bold mb-1">Multiple Categories</h4>
                  <p className="text-[10px] text-indigo-200 leading-relaxed">From digital tech services to restaurants and ATM locations.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="bg-white border-t border-slate-100 py-8 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          © {new Date().getFullYear()} Honeybee Digital & CityHangAround. All rights reserved.
        </footer>

        {/* CHAT WIDGET & LAUNCHER */}
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-4">
          {!isOpen && (
            <div className="bg-indigo-600 text-white px-4 py-2 rounded-xl rounded-br-none shadow-xl animate-bounce-slow font-bold text-[10px] uppercase tracking-wider relative mb-1">
              Chat Click Here
              <div className="absolute right-0 bottom-[-4px] w-2 h-2 bg-indigo-600 transform rotate-45"></div>
            </div>
          )}

          <div
            className={`transition-all duration-300 origin-bottom-right transform ${isOpen
                ? 'scale-100 opacity-100'
                : 'scale-95 opacity-0 pointer-events-none'
              } w-[400px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[80vh] bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-150 flex flex-col`}
          >
            {isOpen && (
              <ChatWidget 
                onClose={() => setIsOpen(false)} 
                initialQuery={chatQuery} 
                onClearInitialQuery={() => setChatQuery('')}
                initialAction={chatAction}
                onClearInitialAction={() => setChatAction('')}
              />
            )}
          </div>

          <Launcher isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
        </div>

        <style jsx>{`
          .clip-path-hero {
            clip-path: ellipse(100% 55% at 50% 15%);
          }
          @keyframes bounce-slow {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
          }
          .animate-bounce-slow {
            animation: bounce-slow 3s infinite ease-in-out;
          }
        `}</style>
      </div>
    </ErrorBoundary>
  )
}
