import { useMemo } from 'react';
import { Book } from '@/types/book';
import KPICard from './KPICard';
import {
  BookOpen, CheckCircle2, Eye, BookMarked, FileText,
  Star, Award, CalendarDays, TrendingUp, Trophy, Quote, Target,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import StatusBadge from './StatusBadge';
import StarRating from './StarRating';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface DashboardViewProps {
  books: Book[];
  onBookClick: (book: Book) => void;
  readingGoal?: number;
}

const CHART_COLORS = [
  'hsl(40, 64%, 58%)',
  'hsl(217, 55%, 55%)',
  'hsl(30, 8%, 45%)',
  'hsl(45, 60%, 45%)',
  'hsl(0, 50%, 45%)',
];

const DashboardView = ({ books, onBookClick, readingGoal = 24 }: DashboardViewProps) => {
  const stats = useMemo(() => {
    const completed = books.filter(b => b.status === 'Concluído');
    const reading = books.filter(b => b.status === 'Lendo');
    const wantToRead = books.filter(b => b.status === 'Quero Ler');
    const rated = completed.filter(b => b.rating);
    const avgRating = rated.length
      ? (rated.reduce((s, b) => s + (b.rating ?? 0), 0) / rated.length).toFixed(1)
      : '—';
    const totalPages = completed.reduce((s, b) => s + (b.pages ?? 0), 0) +
      reading.reduce((s, b) => s + (b.pagesRead ?? 0), 0);
    const fiveStars = completed.filter(b => b.rating === 5).length;
    const thisYear = completed.filter(b => {
      if (!b.endDate) return false;
      return new Date(b.endDate).getFullYear() === new Date().getFullYear();
    }).length;

    // Pages per day (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    let recentPages = 0;
    books.forEach(b => {
      b.readingSessions?.forEach(s => {
        if (new Date(s.date) >= thirtyDaysAgo) recentPages += s.pagesRead;
      });
    });
    const pagesPerDay = (recentPages / 30).toFixed(1);

    // Top authors
    const authorCounts: Record<string, { count: number; totalRating: number; rated: number }> = {};
    books.forEach(b => {
      const author = b.authors;
      if (!authorCounts[author]) authorCounts[author] = { count: 0, totalRating: 0, rated: 0 };
      authorCounts[author].count++;
      if (b.rating) { authorCounts[author].totalRating += b.rating; authorCounts[author].rated++; }
    });
    const topAuthors = Object.entries(authorCounts)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([name, data]) => ({
        name,
        count: data.count,
        avgRating: data.rated ? (data.totalRating / data.rated).toFixed(1) : '—',
      }));

    // Book of the week - highest rated recently completed
    const recentHighest = [...completed]
      .filter(b => b.rating)
      .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0) || (b.endDate ?? '').localeCompare(a.endDate ?? ''))
      [0] ?? null;

    // Total quotes
    const totalQuotes = books.reduce((s, b) => s + (b.quotes?.length ?? 0), 0);
    const lastQuote = books
      .flatMap(b => (b.quotes ?? []).map(q => ({ ...q, bookTitle: b.title })))
      .sort((a, b) => b.addedAt.localeCompare(a.addedAt))[0] ?? null;

    // Recently added (last month)
    const recentlyAdded = books
      .filter(b => b.startDate && new Date(b.startDate) >= thirtyDaysAgo)
      .slice(0, 3);

    return {
      total: books.length,
      completed: completed.length,
      reading: reading.length,
      wantToRead: wantToRead.length,
      totalPages,
      avgRating,
      fiveStars,
      thisYear,
      pagesPerDay,
      readingBooks: reading,
      recentlyCompleted: [...completed]
        .sort((a, b) => (b.endDate ?? '').localeCompare(a.endDate ?? ''))
        .slice(0, 5),
      topAuthors,
      bookOfWeek: recentHighest,
      totalQuotes,
      lastQuote,
      recentlyAdded,
    };
  }, [books]);

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    books.forEach(b => { counts[b.status] = (counts[b.status] ?? 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [books]);

  const genreData = useMemo(() => {
    const counts: Record<string, number> = {};
    books.forEach(b => { counts[b.genre] = (counts[b.genre] ?? 0) + 1; });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }));
  }, [books]);

  const yearData = useMemo(() => {
    const counts: Record<number, number> = {};
    books.filter(b => b.status === 'Concluído' && b.endDate).forEach(b => {
      const year = new Date(b.endDate!).getFullYear();
      counts[year] = (counts[year] ?? 0) + 1;
    });
    return Object.entries(counts)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([year, count]) => ({ year, count }));
  }, [books]);

  const goalProgress = Math.round((stats.thisYear / readingGoal) * 100);

  return (
    <div className="space-y-8">
      {/* Desafio Anual */}
      <div className="rounded-xl bg-card p-5 animate-fade-in border border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target size={18} className="text-primary" />
            <h3 className="text-sm font-semibold">Desafio de Leitura {new Date().getFullYear()}</h3>
          </div>
          <span className="text-sm font-bold text-primary">{stats.thisYear}/{readingGoal}</span>
        </div>
        <Progress value={Math.min(goalProgress, 100)} className="h-2" />
        <p className="text-xs text-muted-foreground mt-2">
          {goalProgress >= 100
            ? '🎉 Meta alcançada! Parabéns!'
            : `Faltam ${readingGoal - stats.thisYear} livros`}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Total de Livros" value={stats.total} icon={<BookOpen size={20} />} delay={0} />
        <KPICard title="Concluídos" value={stats.completed} icon={<CheckCircle2 size={20} />} delay={50} />
        <KPICard title="Lendo Agora" value={stats.reading} icon={<Eye size={20} />} delay={100} />
        <KPICard title="Quero Ler" value={stats.wantToRead} icon={<BookMarked size={20} />} delay={150} />
        <KPICard title="Páginas Lidas" value={stats.totalPages.toLocaleString('pt-BR')} icon={<FileText size={20} />} delay={200} />
        <KPICard title="Nota Média" value={stats.avgRating} icon={<Star size={20} />} delay={250} />
        <KPICard title="5 Estrelas" value={stats.fiveStars} icon={<Award size={20} />} delay={300} />
        <KPICard title="Ritmo" value={`${stats.pagesPerDay} pág/dia`} icon={<TrendingUp size={20} />} delay={350} subtitle="Últimos 30 dias" />
      </div>

      {/* Book of the Week + Quotes Counter */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stats.bookOfWeek && (
          <div
            className="rounded-xl bg-card p-5 animate-fade-in border border-border cursor-pointer hover:border-primary/40 transition-colors"
            onClick={() => onBookClick(stats.bookOfWeek!)}
          >
            <div className="flex items-center gap-2 mb-3">
              <Trophy size={16} className="text-primary" />
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Destaque</h3>
            </div>
            <div className="flex gap-4">
              <img
                src={stats.bookOfWeek.coverUrl}
                alt={stats.bookOfWeek.title}
                className="w-16 h-24 rounded-lg object-cover border border-border"
                onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
              />
              <div>
                <p className="font-semibold text-sm">{stats.bookOfWeek.title}</p>
                <p className="text-xs text-muted-foreground">{stats.bookOfWeek.authors}</p>
                <StarRating rating={stats.bookOfWeek.rating} size={14} />
              </div>
            </div>
          </div>
        )}
        <div className="rounded-xl bg-card p-5 animate-fade-in border border-border">
          <div className="flex items-center gap-2 mb-3">
            <Quote size={16} className="text-primary" />
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Citações Salvas</h3>
          </div>
          <p className="text-3xl font-bold">{stats.totalQuotes}</p>
          {stats.lastQuote && (
            <p className="text-xs text-muted-foreground mt-2 italic line-clamp-2">
              "{stats.lastQuote.text}" — {stats.lastQuote.bookTitle}
            </p>
          )}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Pie */}
        <div className="rounded-xl bg-card p-5 animate-fade-in border border-border" style={{ animationDelay: '400ms' }}>
          <h3 className="text-xs font-semibold text-muted-foreground mb-4 uppercase tracking-widest">Distribuição por Status</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                {statusData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  fontSize: '13px',
                }}
              />
              <Legend iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Genre Bars */}
        <div className="rounded-xl bg-card p-5 animate-fade-in border border-border" style={{ animationDelay: '450ms' }}>
          <h3 className="text-xs font-semibold text-muted-foreground mb-4 uppercase tracking-widest">Top Gêneros</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={genreData} layout="vertical" margin={{ left: 10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  fontSize: '13px',
                }}
              />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Year Bars */}
        <div className="rounded-xl bg-card p-5 animate-fade-in border border-border" style={{ animationDelay: '500ms' }}>
          <h3 className="text-xs font-semibold text-muted-foreground mb-4 uppercase tracking-widest">Livros por Ano</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={yearData} margin={{ left: -10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="year" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  fontSize: '13px',
                }}
              />
              <Bar dataKey="count" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Authors */}
      {stats.topAuthors.length > 0 && (
        <div className="rounded-xl bg-card p-5 animate-fade-in border border-border">
          <h3 className="text-xs font-semibold text-muted-foreground mb-4 uppercase tracking-widest">Autores Favoritos</h3>
          <div className="space-y-2">
            {stats.topAuthors.map((author, i) => (
              <div key={author.name} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-5 font-semibold">{i + 1}</span>
                  <span className="text-sm font-medium">{author.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="text-xs">{author.count} livro{author.count > 1 ? 's' : ''}</Badge>
                  <span className="text-xs text-muted-foreground">★ {author.avgRating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Descobertas do Mês */}
      {stats.recentlyAdded.length > 0 && (
        <div className="animate-fade-in" style={{ animationDelay: '550ms' }}>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            Descobertas Recentes
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {stats.recentlyAdded.map(book => (
              <div
                key={book.id}
                onClick={() => onBookClick(book)}
                className="rounded-xl bg-card p-4 cursor-pointer hover:border-primary/40 transition-colors border border-border"
              >
                <div className="flex gap-3">
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="w-12 h-18 rounded-lg object-cover border border-border"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                  />
                  <div>
                    <p className="font-semibold text-sm leading-tight">{book.title}</p>
                    <p className="text-xs text-muted-foreground">{book.authors}</p>
                    <StatusBadge status={book.status} className="mt-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Currently Reading */}
      {stats.readingBooks.length > 0 && (
        <div className="animate-fade-in" style={{ animationDelay: '550ms' }}>
          <h3 className="text-lg font-semibold mb-4">Lendo Agora</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.readingBooks.map(book => {
              const progress = book.pages ? Math.round(((book.pagesRead ?? 0) / book.pages) * 100) : 0;
              return (
                <div
                  key={book.id}
                  onClick={() => onBookClick(book)}
                  className="flex gap-4 p-4 rounded-xl bg-card hover:border-primary/40 transition-colors cursor-pointer border border-border"
                >
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="w-14 h-20 rounded-lg object-cover flex-shrink-0 border border-border"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{book.title}</p>
                    <p className="text-xs text-muted-foreground">{book.authors}</p>
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>{book.pagesRead ?? 0}/{book.pages} pág.</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-1.5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Reads */}
      {stats.recentlyCompleted.length > 0 && (
        <div className="animate-fade-in" style={{ animationDelay: '600ms' }}>
          <h3 className="text-lg font-semibold mb-4">Últimas Leituras</h3>
          <div className="space-y-2">
            {stats.recentlyCompleted.map(book => (
              <div
                key={book.id}
                onClick={() => onBookClick(book)}
                className="flex items-center gap-4 p-3 rounded-xl bg-card hover:border-primary/40 transition-colors cursor-pointer border border-border"
              >
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  className="w-10 h-14 rounded-lg object-cover flex-shrink-0 border border-border"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{book.title}</p>
                  <p className="text-xs text-muted-foreground">{book.authors}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{book.rating}★</p>
                  <p className="text-xs text-muted-foreground">
                    {book.endDate && new Date(book.endDate).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function pagesPerDayProjection(_current: number, _goal: number): string {
  return '';
}

export default DashboardView;
