import { useState } from 'react';
import { Book, STATUSES, BookStatus, GENRES, LANGUAGES, FORMATS, BookGenre, BookLanguage, BookFormat, MOODS, Quote, ReadingSession } from '@/types/book';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StatusBadge from './StatusBadge';
import StarRating from './StarRating';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BookOpen, Calendar, Building2, Globe, FileType, Trash2, Archive, Edit3, Quote as QuoteIcon, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

interface BookDetailSheetProps {
  book: Book | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (book: Book) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
}

const BookDetailSheet = ({ book, open, onOpenChange, onUpdate, onDelete, onArchive }: BookDetailSheetProps) => {
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Book>>({});
  const [newQuote, setNewQuote] = useState({ text: '', page: '', chapter: '' });
  const [newSession, setNewSession] = useState({ date: new Date().toISOString().split('T')[0], pagesRead: '', notes: '', mood: '' });

  if (!book) return null;

  const startEdit = () => {
    setEditForm({ ...book });
    setEditing(true);
  };

  const saveEdit = () => {
    onUpdate({ ...book, ...editForm } as Book);
    setEditing(false);
    toast.success('Livro atualizado!');
  };

  const addQuote = () => {
    if (!newQuote.text.trim()) return;
    const quote: Quote = {
      id: `q-${Date.now()}`,
      text: newQuote.text,
      page: newQuote.page ? parseInt(newQuote.page) : undefined,
      chapter: newQuote.chapter || undefined,
      addedAt: new Date().toISOString().split('T')[0],
    };
    onUpdate({ ...book, quotes: [...(book.quotes ?? []), quote] });
    setNewQuote({ text: '', page: '', chapter: '' });
    toast.success('Citação salva!');
  };

  const removeQuote = (qid: string) => {
    onUpdate({ ...book, quotes: (book.quotes ?? []).filter(q => q.id !== qid) });
  };

  const addSession = () => {
    if (!newSession.pagesRead) return;
    const session: ReadingSession = {
      id: `s-${Date.now()}`,
      date: newSession.date,
      pagesRead: parseInt(newSession.pagesRead),
      notes: newSession.notes,
      mood: newSession.mood as ReadingSession['mood'] || undefined,
    };
    const newPagesRead = (book.pagesRead ?? 0) + session.pagesRead;
    onUpdate({
      ...book,
      readingSessions: [...(book.readingSessions ?? []), session],
      pagesRead: newPagesRead,
    });
    setNewSession({ date: new Date().toISOString().split('T')[0], pagesRead: '', notes: '', mood: '' });
    toast.success('Sessão registrada!');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto rounded-l-2xl bg-card border-l border-border">
        <SheetHeader className="pb-4">
          <div className="flex items-start justify-between">
            <SheetTitle className="text-xl font-semibold">{book.title}</SheetTitle>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={startEdit} className="h-8 w-8">
                <Edit3 size={14} />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onArchive(book.id)} className="h-8 w-8 text-muted-foreground">
                <Archive size={14} />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                    <Trash2 size={14} />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-2xl bg-card border border-border">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir "{book.title}"?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação é irreversível. O livro será removido permanentemente da sua biblioteca.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => { onDelete(book.id); onOpenChange(false); }}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </SheetHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="w-full grid grid-cols-3 bg-secondary">
            <TabsTrigger value="details">Detalhes</TabsTrigger>
            <TabsTrigger value="diary">Diário</TabsTrigger>
            <TabsTrigger value="quotes">Citações</TabsTrigger>
          </TabsList>

          {/* DETAILS TAB */}
          <TabsContent value="details" className="space-y-6 mt-4">
            <div className="flex gap-5">
              <img
                src={book.coverUrl}
                alt={book.title}
                className="w-28 h-40 rounded-xl object-cover flex-shrink-0 border border-border"
                onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
              />
              <div className="space-y-3 flex-1">
                <p className="text-muted-foreground text-sm">{book.authors}</p>
                <StatusBadge status={book.status} />
                <StarRating
                  rating={book.rating}
                  size={20}
                  interactive
                  onChange={(rating) => onUpdate({ ...book, rating })}
                />
                <Select
                  value={book.status}
                  onValueChange={(val) => onUpdate({ ...book, status: val as BookStatus })}
                >
                  <SelectTrigger className="w-full mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Edit mode */}
            {editing && (
              <div className="space-y-3 p-4 rounded-xl bg-secondary/50 border border-border">
                <h4 className="text-sm font-semibold">Editar Livro</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1 col-span-2">
                    <Label className="text-xs">Título</Label>
                    <Input value={editForm.title ?? ''} onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))} />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <Label className="text-xs">Autor(es)</Label>
                    <Input value={editForm.authors ?? ''} onChange={e => setEditForm(p => ({ ...p, authors: e.target.value }))} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Gênero</Label>
                    <Select value={editForm.genre} onValueChange={v => setEditForm(p => ({ ...p, genre: v as BookGenre }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{GENRES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Páginas</Label>
                    <Input type="number" value={editForm.pages ?? ''} onChange={e => setEditForm(p => ({ ...p, pages: e.target.value ? Number(e.target.value) : null }))} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Editora</Label>
                    <Input value={editForm.publisher ?? ''} onChange={e => setEditForm(p => ({ ...p, publisher: e.target.value }))} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">ISBN</Label>
                    <Input value={editForm.isbn ?? ''} onChange={e => setEditForm(p => ({ ...p, isbn: e.target.value }))} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Idioma</Label>
                    <Select value={editForm.language} onValueChange={v => setEditForm(p => ({ ...p, language: v as BookLanguage }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{LANGUAGES.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Formato</Label>
                    <Select value={editForm.format} onValueChange={v => setEditForm(p => ({ ...p, format: v as BookFormat }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{FORMATS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Capa (URL)</Label>
                    <Input value={editForm.coverUrl ?? ''} onChange={e => setEditForm(p => ({ ...p, coverUrl: e.target.value }))} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Ano Original</Label>
                    <Input type="number" value={editForm.originalYear ?? ''} onChange={e => setEditForm(p => ({ ...p, originalYear: e.target.value ? Number(e.target.value) : null }))} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Data Início</Label>
                    <Input type="date" value={editForm.startDate ?? ''} onChange={e => setEditForm(p => ({ ...p, startDate: e.target.value || null }))} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Data Fim</Label>
                    <Input type="date" value={editForm.endDate ?? ''} onChange={e => setEditForm(p => ({ ...p, endDate: e.target.value || null }))} />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Notas</Label>
                  <Textarea value={editForm.notes ?? ''} onChange={e => setEditForm(p => ({ ...p, notes: e.target.value }))} rows={3} />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" size="sm" onClick={() => setEditing(false)}>Cancelar</Button>
                  <Button size="sm" onClick={saveEdit}>Salvar</Button>
                </div>
              </div>
            )}

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <BookOpen size={14} />
                <span>{book.pages ?? '—'} páginas</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar size={14} />
                <span>{book.originalYear ?? '—'}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building2 size={14} />
                <span>{book.publisher || '—'}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Globe size={14} />
                <span>{book.language}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <FileType size={14} />
                <span>{book.format}</span>
              </div>
              {book.isbn && (
                <div className="text-muted-foreground col-span-2">
                  <span className="font-medium">ISBN:</span> {book.isbn}
                </div>
              )}
            </div>

            {/* Genre + Tags */}
            <div className="space-y-2">
              <Badge variant="outline">{book.genre}</Badge>
              {book.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {book.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Dates */}
            {(book.startDate || book.endDate) && (
              <div className="text-sm text-muted-foreground space-y-1">
                {book.startDate && <p>Início: {new Date(book.startDate).toLocaleDateString('pt-BR')}</p>}
                {book.endDate && <p>Conclusão: {new Date(book.endDate).toLocaleDateString('pt-BR')}</p>}
              </div>
            )}

            {/* Notes */}
            {book.notes && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Notas de Leitura</h4>
                <div className="text-sm text-muted-foreground bg-secondary rounded-xl p-4 whitespace-pre-wrap border border-border">
                  {book.notes}
                </div>
              </div>
            )}
          </TabsContent>

          {/* DIARY TAB */}
          <TabsContent value="diary" className="space-y-4 mt-4">
            <div className="space-y-3 p-4 rounded-lg bg-muted/30 border border-border">
              <h4 className="text-sm font-semibold font-serif">Nova Sessão de Leitura</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Data</Label>
                  <Input type="date" value={newSession.date} onChange={e => setNewSession(p => ({ ...p, date: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Páginas lidas</Label>
                  <Input type="number" placeholder="0" value={newSession.pagesRead} onChange={e => setNewSession(p => ({ ...p, pagesRead: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Humor</Label>
                <div className="flex gap-2 flex-wrap">
                  {MOODS.map(m => (
                    <button
                      key={m.value}
                      onClick={() => setNewSession(p => ({ ...p, mood: p.mood === m.value ? '' : m.value }))}
                      className={`text-lg p-1 rounded transition-all ${newSession.mood === m.value ? 'bg-accent scale-110' : 'opacity-50 hover:opacity-100'}`}
                      title={m.label}
                    >
                      {m.emoji}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Reflexões</Label>
                <Textarea
                  value={newSession.notes}
                  onChange={e => setNewSession(p => ({ ...p, notes: e.target.value }))}
                  rows={2}
                  placeholder="O que você pensou durante a leitura?"
                />
              </div>
              <Button size="sm" onClick={addSession} className="w-full gap-1.5">
                <Plus size={14} />
                Registrar Sessão
              </Button>
            </div>

            {/* Sessions list */}
            <div className="space-y-2">
              {(book.readingSessions ?? []).slice().reverse().map(session => (
                <div key={session.id} className="p-3 rounded-lg border border-border bg-card text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">
                      {new Date(session.date).toLocaleDateString('pt-BR')}
                    </span>
                    <div className="flex items-center gap-2">
                      {session.mood && <span>{MOODS.find(m => m.value === session.mood)?.emoji}</span>}
                      <Badge variant="secondary" className="text-xs">{session.pagesRead} pág.</Badge>
                    </div>
                  </div>
                  {session.notes && <p className="text-muted-foreground mt-1">{session.notes}</p>}
                </div>
              ))}
              {(!book.readingSessions || book.readingSessions.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhuma sessão registrada ainda.</p>
              )}
            </div>
          </TabsContent>

          {/* QUOTES TAB */}
          <TabsContent value="quotes" className="space-y-4 mt-4">
            <div className="space-y-3 p-4 rounded-lg bg-muted/30 border border-border">
              <h4 className="text-sm font-semibold font-serif flex items-center gap-2">
                <QuoteIcon size={14} />
                Nova Citação
              </h4>
              <Textarea
                value={newQuote.text}
                onChange={e => setNewQuote(p => ({ ...p, text: e.target.value }))}
                rows={2}
                placeholder="Digite a citação..."
                className="italic"
              />
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Página</Label>
                  <Input type="number" placeholder="Ex: 42" value={newQuote.page} onChange={e => setNewQuote(p => ({ ...p, page: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Capítulo</Label>
                  <Input placeholder="Ex: Cap. 3" value={newQuote.chapter} onChange={e => setNewQuote(p => ({ ...p, chapter: e.target.value }))} />
                </div>
              </div>
              <Button size="sm" onClick={addQuote} className="w-full gap-1.5">
                <Plus size={14} />
                Salvar Citação
              </Button>
            </div>

            <div className="space-y-3">
              {(book.quotes ?? []).slice().reverse().map(quote => (
                <div key={quote.id} className="p-4 rounded-lg border border-border bg-card relative group">
                  <button
                    onClick={() => removeQuote(quote.id)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                  >
                    <X size={14} />
                  </button>
                  <p className="text-sm italic font-serif leading-relaxed">"{quote.text}"</p>
                  <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                    {quote.page && <span>p. {quote.page}</span>}
                    {quote.chapter && <span>{quote.chapter}</span>}
                    <span>{new Date(quote.addedAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              ))}
              {(!book.quotes || book.quotes.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhuma citação salva ainda.</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

export default BookDetailSheet;
