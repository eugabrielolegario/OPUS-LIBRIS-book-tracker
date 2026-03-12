import { useState } from 'react';
import { Book, BookGenre, BookStatus, BookLanguage, BookFormat, GENRES, STATUSES, LANGUAGES, FORMATS } from '@/types/book';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import StarRating from './StarRating';
import { Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AddBookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (book: Book) => void;
}

const emptyBook = (): Partial<Book> => ({
  title: '', authors: '', genre: 'Literatura', tags: [], keywords: '',
  originalYear: null, editionYear: null, publisher: '', isbn: '',
  pages: null, language: 'Português', format: 'Físico', status: 'Quero Ler',
  rating: null, startDate: null, endDate: null, notes: '', coverUrl: '',
});

const AddBookDialog = ({ open, onOpenChange, onAdd }: AddBookDialogProps) => {
  const [form, setForm] = useState<Partial<Book>>(emptyBook());
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);

  const set = (key: keyof Book, value: unknown) => setForm(prev => ({ ...prev, [key]: value }));

  const searchGoogleBooks = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const q = searchQuery.replace(/ /g, '+');
      const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=1`);
      const data = await res.json();
      if (data.items && data.items.length > 0) {
        const vol = data.items[0].volumeInfo;
        setForm(prev => ({
          ...prev,
          title: vol.title || prev.title,
          authors: vol.authors?.join(', ') || prev.authors,
          publisher: vol.publisher || prev.publisher,
          originalYear: vol.publishedDate ? parseInt(vol.publishedDate) : prev.originalYear,
          pages: vol.pageCount || prev.pages,
          coverUrl: vol.imageLinks?.thumbnail?.replace('http:', 'https:') || prev.coverUrl,
          isbn: vol.industryIdentifiers?.[0]?.identifier || prev.isbn,
        }));
        toast.success('Dados encontrados!');
      } else {
        toast.error('Nenhum resultado encontrado');
      }
    } catch {
      toast.error('Erro ao buscar');
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = () => {
    if (!form.title || !form.authors) {
      toast.error('Título e autor são obrigatórios');
      return;
    }
    const newBook: Book = {
      id: Date.now().toString(),
      title: form.title!,
      authors: form.authors!,
      genre: form.genre as BookGenre,
      tags: form.tags ?? [],
      keywords: form.keywords ?? '',
      originalYear: form.originalYear ?? null,
      editionYear: form.editionYear ?? null,
      publisher: form.publisher ?? '',
      isbn: form.isbn ?? '',
      pages: form.pages ?? null,
      language: form.language as BookLanguage,
      format: form.format as BookFormat,
      status: form.status as BookStatus,
      rating: form.rating ?? null,
      startDate: form.startDate ?? null,
      endDate: form.endDate ?? null,
      notes: form.notes ?? '',
      coverUrl: form.coverUrl ?? '',
    };
    onAdd(newBook);
    setForm(emptyBook());
    onOpenChange(false);
    toast.success('Livro adicionado!');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-card border border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Adicionar Livro</DialogTitle>
        </DialogHeader>

        {/* Google Books Search */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              placeholder="Buscar por título ou ISBN (Google Books)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && searchGoogleBooks()}
              className="pl-9"
            />
          </div>
          <Button variant="secondary" onClick={searchGoogleBooks} disabled={searching}>
            {searching ? <Loader2 size={16} className="animate-spin" /> : 'Buscar'}
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Título *</Label>
            <Input value={form.title ?? ''} onChange={e => set('title', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Autor(es) *</Label>
            <Input value={form.authors ?? ''} onChange={e => set('authors', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Gênero</Label>
            <Select value={form.genre} onValueChange={v => set('genre', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {GENRES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={v => set('status', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Editora</Label>
            <Input value={form.publisher ?? ''} onChange={e => set('publisher', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>ISBN</Label>
            <Input value={form.isbn ?? ''} onChange={e => set('isbn', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Páginas</Label>
            <Input type="number" value={form.pages ?? ''} onChange={e => set('pages', e.target.value ? Number(e.target.value) : null)} />
          </div>
          <div className="space-y-2">
            <Label>Ano Original</Label>
            <Input type="number" value={form.originalYear ?? ''} onChange={e => set('originalYear', e.target.value ? Number(e.target.value) : null)} />
          </div>
          <div className="space-y-2">
            <Label>Idioma</Label>
            <Select value={form.language} onValueChange={v => set('language', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {LANGUAGES.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Formato</Label>
            <Select value={form.format} onValueChange={v => set('format', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {FORMATS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Capa (URL)</Label>
            <Input value={form.coverUrl ?? ''} onChange={e => set('coverUrl', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Nota</Label>
            <StarRating rating={form.rating ?? null} interactive onChange={r => set('rating', r)} size={24} />
          </div>
          <div className="space-y-2 col-span-full">
            <Label>Notas de Leitura</Label>
            <Textarea
              value={form.notes ?? ''}
              onChange={e => set('notes', e.target.value)}
              rows={3}
              placeholder="Suas anotações sobre o livro..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit}>Adicionar Livro</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddBookDialog;
