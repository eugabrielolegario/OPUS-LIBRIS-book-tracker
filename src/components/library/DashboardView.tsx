import { useMemo } from 'react';
import { Book } from '@/types/book';
import KPICard from './KPICard';
import {
  BookOpen, CheckCircle2, Eye, BookMarked, FileText,
  Star, Award, CalendarDays,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import StatusBadge from './StatusBadge';
import StarRating from './StarRating';
import { Progress } from '@/components/ui/progress';

interface DashboardViewProps {
  books: Book[];
  onBookClick: (book: Book) => void;
}

const CHART_COLORS = [
  'hsl(142, 71%, 45%)',
  'hsl(217, 91%, 60%)',
  'hsl(215, 14%, 65%)',
  'hsl(45, 93%, 47%)',
  'hsl(0, 84%, 60%)',
];

const DashboardView = ({ books, onBookClick }: DashboardViewProps) => {
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

    return {
      total: books.length,
      completed: completed.length,
      reading: reading.length,
      wantToRead: wantToRead.length,
      totalPages,
      avgRating,
      fiveStars,
      thisYear,
      readingBooks: reading,
      recentlyCompleted: [...completed]
        .sort((a, b) => (b.endDate ?? '').localeCompare(a.endDate ?? ''))
        .slice(0, 5),
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

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Total de Livros" value={stats.total} icon={<BookOpen size={20} />} delay={0} />
        <KPICard title="Concluídos" value={stats.completed} icon={<CheckCircle2 size={20} />} delay={50} />
        <KPICard title="Lendo Agora" value={stats.reading} icon={<Eye size={20} />} delay={100} />
        <KPICard title="Quero Ler" value={stats.wantToRead} icon={<BookMarked size={20} />} delay={150} />
        <KPICard title="Páginas Lidas" value={stats.totalPages.toLocaleString('pt-BR')} icon={<FileText size={20} />} delay={200} />
        <KPICard title="Nota Média" value={stats.avgRating} icon={<Star size={20} />} delay={250} />
        <KPICard title="5 Estrelas" value={stats.fiveStars} icon={<Award size={20} />} delay={300} />
        <KPICard title="Este Ano" value={stats.thisYear} icon={<CalendarDays size={20} />} delay={350} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Pie */}
        <div className="rounded-xl border border-border bg-card p-5 animate-fade-in" style={{ animationDelay: '400ms' }}>
          <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">Distribuição por Status</h3>
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
                  borderRadius: '8px',
                  fontSize: '13px',
                }}
              />
              <Legend iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Genre Bars */}
        <div className="rounded-xl border border-border bg-card p-5 animate-fade-in" style={{ animationDelay: '450ms' }}>
          <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">Top Gêneros</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={genreData} layout="vertical" margin={{ left: 10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '13px',
                }}
              />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Year Bars */}
        <div className="rounded-xl border border-border bg-card p-5 animate-fade-in" style={{ animationDelay: '500ms' }}>
          <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">Livros por Ano</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={yearData} margin={{ left: -10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="year" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '13px',
                }}
              />
              <Bar dataKey="count" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Currently Reading */}
      {stats.readingBooks.length > 0 && (
        <div className="animate-fade-in" style={{ animationDelay: '550ms' }}>
          <h3 className="text-lg font-semibold font-serif mb-4">📖 Lendo Agora</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.readingBooks.map(book => {
              const progress = book.pages ? Math.round(((book.pagesRead ?? 0) / book.pages) * 100) : 0;
              return (
                <div
                  key={book.id}
                  onClick={() => onBookClick(book)}
                  className="flex gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/40 transition-colors cursor-pointer"
                >
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="w-14 h-20 rounded-md object-cover flex-shrink-0"
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
          <h3 className="text-lg font-semibold font-serif mb-4">✅ Últimas Leituras</h3>
          <div className="space-y-2">
            {stats.recentlyCompleted.map(book => (
              <div
                key={book.id}
                onClick={() => onBookClick(book)}
                className="flex items-center gap-4 p-3 rounded-lg border border-border bg-card hover:border-primary/40 transition-colors cursor-pointer"
              >
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  className="w-10 h-14 rounded object-cover flex-shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{book.title}</p>
                  <p className="text-xs text-muted-foreground">{book.authors}</p>
                </div>
                <StarRating rating={book.rating} size={14} />
                <StatusBadge status={book.status} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardView;
