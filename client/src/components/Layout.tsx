import { useState, type FormEvent } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { UniversalLink } from '@lark-apaas/client-toolkit/components/UniversalLink';

const Layout = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = query.trim();
    if (q) {
      navigate(`/search?q=${encodeURIComponent(q)}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center gap-8">
          {/* Logo / 应用名称 */}
          <NavLink
            to="/"
            className="flex items-center gap-2 font-display text-xl font-bold text-foreground hover:text-primary transition-colors shrink-0"
          >
            <span className="text-2xl">📚</span>
            <span>期末试卷库</span>
          </NavLink>

          {/* 搜索框 */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-auto">
            <div className="relative search-glow rounded-lg">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜索课程名、试卷名..."
                className="pl-10 pr-4 h-10 bg-background border-input rounded-lg"
              />
            </div>
          </form>

          {/* 导航链接 */}
          <nav className="flex items-center gap-1 shrink-0">
            <NavLink
              to="/library"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-primary bg-primary/10'
                    : 'text-foreground hover:text-primary hover:bg-accent'
                }`
              }
            >
              试卷库
            </NavLink>
          </nav>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="flex-1 w-full">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50">
        <div className="max-w-[1200px] mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">📚</span>
              <span className="font-display font-bold text-foreground">期末试卷库</span>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>© 2025 期末试卷库 · 仅供学习交流使用</p>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <UniversalLink to="#" className="hover:text-primary transition-colors">
                关于本站
              </UniversalLink>
              <UniversalLink to="#" className="hover:text-primary transition-colors">
                意见反馈
              </UniversalLink>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
