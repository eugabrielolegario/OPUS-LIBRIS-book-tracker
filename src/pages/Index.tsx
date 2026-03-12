import { useState, useEffect } from 'react';
import { Book, BookStatus, BookGenre, BookLanguage, BookFormat } from '@/types/book';
import { mockBooks } from '@/data/mockBooks';
import DashboardView from '@/components/library/DashboardView';
import CatalogView from '@/components/library/CatalogView';
import BookDetailSheet from '@/components/library/BookDetailSheet';
import AddBookDialog from '@/components/library/AddBookDialog';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard, Library, Menu, Download, Upload,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const Index = () => {
  const [books, setBooks] = useState<Book[]>(mockBooks);
  const [page, setPage] = useState<'dashboard' | 'catalog'>('dashboard');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [dark, setDark] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  const handleBookClick = (book: Book) => {
    setSelectedBook(book);
    setDetailOpen(true);
  };

  const handleUpdateBook = (updated: Book) => {
    setBooks(prev => prev.map(b => b.id === updated.id ? updated : b));
    setSelectedBook(updated);
  };

  const handleAddBook = (book: Book) => {
    setBooks(prev => [book, ...prev]);
  };

  const handleDeleteBook = (id: string) => {
    setBooks(prev => prev.filter(b => b.id !== id));
    toast.success('Livro excluído permanentemente.');
  };

  const handleArchiveBook = (id: string) => {
    setBooks(prev => prev.map(b => b.id === id ? { ...b, archived: !b.archived } : b));
    toast.success('Livro arquivado.');
  };

  const handleExportCSV = () => {
    const headers = ['Título', 'Autor(es)', 'Gênero', 'Status', 'Nota', 'Páginas', 'Idioma', 'Formato', 'Editora', 'ISBN', 'Ano Original'];
    const rows = books.map(b => [
      b.title, b.authors, b.genre, b.status, b.rating ?? '', b.pages ?? '',
      b.language, b.format, b.publisher, b.isbn, b.originalYear ?? '',
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'minha-biblioteca.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exportado!');
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string;
        const lines = text.split('\n').filter(l => l.trim());
        const headerLine = lines.find(l => l.toLowerCase().includes('título') || l.toLowerCase().includes('titulo'));
        if (!headerLine) {
          toast.error('Formato de CSV não reconhecido');
          return;
        }
        const headerIdx = lines.indexOf(headerLine);
        const dataLines = lines.slice(headerIdx + 1);
        const imported: Book[] = dataLines.map((line, i) => {
          const cols = line.split(',').map(c => c.replace(/"/g, '').trim());
          return {
            id: `imported-${Date.now()}-${i}`,
            title: cols[1] || cols[0] || 'Sem título',
            authors: cols[2] || '',
            genre: (cols[3] || 'Literatura') as BookGenre,
            tags: [],
            keywords: cols[5] || '',
            originalYear: cols[6] ? parseInt(cols[6]) : null,
            editionYear: cols[7] ? parseInt(cols[7]) : null,
            publisher: cols[8] || '',
            isbn: cols[9] || '',
            pages: cols[10] ? parseInt(cols[10]) : null,
            language: (cols[11] || 'Português') as BookLanguage,
            format: (cols[12] || 'Físico') as BookFormat,
            status: (cols[13] || 'Quero Ler') as BookStatus,
            rating: cols[14] ? parseInt(cols[14]) : null,
            startDate: null,
            endDate: null,
            notes: cols[17] || '',
            coverUrl: '',
          };
        }).filter(b => b.title && b.title !== 'Sem título');
        if (imported.length > 0) {
          setBooks(prev => [...imported, ...prev]);
          toast.success(`${imported.length} livros importados!`);
        } else {
          toast.error('Nenhum livro encontrado no CSV');
        }
      } catch {
        toast.error('Erro ao importar CSV');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const navItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'catalog' as const, label: 'Biblioteca', icon: Library },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-40 w-56 bg-card border-r border-border flex flex-col transition-transform lg:translate-x-0 lg:static paper-texture',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="p-5 border-b border-border">
          <h1 className="text-lg font-semibold tracking-tight flex items-center gap-2">
            OPUS LIBRIS
          </h1>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setPage(item.id); setSidebarOpen(false); }}
              className={cn(
                'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                page === item.id
                  ? 'bg-secondary text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              )}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-border space-y-1">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
          >
            <Download size={16} />
            Exportar CSV
          </button>
          <label className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors cursor-pointer">
            <Upload size={16} />
            Importar CSV
            <input type="file" accept=".csv" className="hidden" onChange={handleImportCSV} />
          </label>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <main className="flex-1 min-w-0">
        <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border px-4 sm:px-6 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <Menu size={20} />
          </button>
          <h2 className="text-xl font-bold font-serif">
            {page === 'dashboard' ? 'Dashboard' : 'Minha Biblioteca'}
          </h2>
        </header>

        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
          {page === 'dashboard' && (
            <DashboardView books={books} onBookClick={handleBookClick} />
          )}
          {page === 'catalog' && (
            <CatalogView
              books={books}
              onBookClick={handleBookClick}
              onAddBook={() => setAddOpen(true)}
              showArchived={showArchived}
              onToggleArchived={() => setShowArchived(!showArchived)}
            />
          )}
        </div>
      </main>

      <BookDetailSheet
        book={selectedBook}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onUpdate={handleUpdateBook}
        onDelete={handleDeleteBook}
        onArchive={handleArchiveBook}
      />
      <AddBookDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onAdd={handleAddBook}
      />
    </div>
  );
};

export default Index;
