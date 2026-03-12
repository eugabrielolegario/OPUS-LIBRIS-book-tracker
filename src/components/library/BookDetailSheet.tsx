import { Book, STATUSES, BookStatus } from '@/types/book';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import StatusBadge from './StatusBadge';
import StarRating from './StarRating';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Calendar, Building2, Globe, FileType } from 'lucide-react';

interface BookDetailSheetProps {
  book: Book | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (book: Book) => void;
}

const BookDetailSheet = ({ book, open, onOpenChange, onUpdate }: BookDetailSheetProps) => {
  if (!book) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="font-serif text-xl">{book.title}</SheetTitle>
        </SheetHeader>

        <div className="space-y-6">
          {/* Cover + Basic Info */}
          <div className="flex gap-5">
            <img
              src={book.coverUrl}
              alt={book.title}
              className="w-28 h-40 rounded-lg object-cover shadow-md flex-shrink-0"
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
              <div className="text-sm text-muted-foreground bg-muted rounded-lg p-4 whitespace-pre-wrap">
                {book.notes}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default BookDetailSheet;
