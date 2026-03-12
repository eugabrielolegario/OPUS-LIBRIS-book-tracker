import { useState, useMemo } from 'react';
import { Book, GENRES, STATUSES, LANGUAGES, FORMATS } from '@/types/book';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { LayoutGrid, List, Plus, Search, Archive } from 'lucide-react';
import StatusBadge from './StatusBadge';
import StarRating from './StarRating';

interface CatalogViewProps {
  books: Book[];
  onBookClick: (book: Book) => void;
  onAddBook: () => void;
  showArchived?: boolean;
  onToggleArchived?: () => void;
}

const CatalogView = ({ books, onBookClick, onAddBook, showArchived = false, onToggleArchived }: CatalogViewProps) => {
  const [search, setSearch] = useState('');
  const [genreFilter, setGenreFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const filtered = useMemo(() => {
    return books.filter(b => {
      const q = search.toLowerCase();
      const matchesSearch = !q || b.title.toLowerCase().includes(q) || b.authors.toLowerCase().includes(q);
      const matchesGenre = genreFilter === 'all' || b.genre === genreFilter;
      const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
      const matchesArchived = showArchived ? b.archived : !b.archived;
      return matchesSearch && matchesGenre && matchesStatus && matchesArchived;
    });
  }, [books, search, genreFilter, statusFilter, showArchived]);

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-1 w-full sm:w-auto flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              placeholder="Buscar título ou autor..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={genreFilter} onValueChange={setGenreFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Gênero" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Gêneros</SelectItem>
              {GENRES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Status</SelectItem>
              {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          {onToggleArchived && (
            <Button variant={showArchived ? 'default' : 'outline'} size="sm" onClick={onToggleArchived} className="gap-1.5">
              <Archive size={14} />
              {showArchived ? 'Arquivados' : 'Arquivo'}
            </Button>
          )}
          <div className="flex border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 transition-colors ${viewMode === 'table' ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <List size={16} />
            </button>
          </div>
          <Button onClick={onAddBook} size="sm" className="gap-1.5">
            <Plus size={16} />
            Adicionar
          </Button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">{filtered.length} livros encontrados</p>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((book, i) => (
            <div
              key={book.id}
              onClick={() => onBookClick(book)}
              className="group cursor-pointer rounded-xl bg-card overflow-hidden border border-border hover:border-primary/40 transition-colors animate-fade-in"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <div className="aspect-[2/3] bg-muted overflow-hidden">
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                />
              </div>
              <div className="p-3 space-y-1.5">
                <p className="font-semibold text-sm leading-tight truncate">{book.title}</p>
                <p className="text-xs text-muted-foreground truncate">{book.authors}</p>
                <div className="flex items-center justify-between gap-1 pt-1">
                  <StatusBadge status={book.status} />
                  {book.rating && <StarRating rating={book.rating} size={12} />}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left p-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Título</th>
                  <th className="text-left p-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Autor</th>
                  <th className="text-left p-3 font-medium text-muted-foreground text-xs uppercase tracking-wider hidden md:table-cell">Gênero</th>
                  <th className="text-left p-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Status</th>
                  <th className="text-left p-3 font-medium text-muted-foreground text-xs uppercase tracking-wider hidden sm:table-cell">Nota</th>
                  <th className="text-left p-3 font-medium text-muted-foreground text-xs uppercase tracking-wider hidden lg:table-cell">Páginas</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(book => (
                  <tr
                    key={book.id}
                    onClick={() => onBookClick(book)}
                    className="border-b border-border last:border-0 hover:bg-secondary/30 cursor-pointer transition-colors"
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={book.coverUrl}
                          alt={book.title}
                          className="w-8 h-12 rounded-lg object-cover flex-shrink-0 border border-border"
                          onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                        />
                        <span className="font-medium truncate max-w-[200px]">{book.title}</span>
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground">{book.authors}</td>
                    <td className="p-3 text-muted-foreground hidden md:table-cell">{book.genre}</td>
                    <td className="p-3"><StatusBadge status={book.status} /></td>
                    <td className="p-3 hidden sm:table-cell"><StarRating rating={book.rating} size={14} /></td>
                    <td className="p-3 text-muted-foreground hidden lg:table-cell">{book.pages ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CatalogView;
