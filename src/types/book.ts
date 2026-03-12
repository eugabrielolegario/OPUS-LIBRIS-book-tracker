export type BookGenre =
  | 'Arte' | 'Autoajuda' | 'Biografia' | 'Ciência' | 'Ciências'
  | 'Esoterismo' | 'Fantasia' | 'Ficção Científica' | 'Filosofia'
  | 'História' | 'Literatura' | 'Mangá' | 'Negócios' | 'Poesia'
  | 'Política' | 'Quadrinhos' | 'Religião' | 'Sociologia' | 'Terror';

export type BookStatus = 'Concluído' | 'Lendo' | 'Quero Ler' | 'Pausado' | 'Abandonado';
export type BookLanguage = 'Português' | 'Inglês' | 'Espanhol' | 'Japonês' | 'Francês' | 'Alemão';
export type BookFormat = 'Físico' | 'E-book' | 'Audiolivro' | 'PDF';

export interface Book {
  id: string;
  title: string;
  authors: string;
  genre: BookGenre;
  tags: string[];
  keywords: string;
  originalYear: number | null;
  editionYear: number | null;
  publisher: string;
  isbn: string;
  pages: number | null;
  language: BookLanguage;
  format: BookFormat;
  status: BookStatus;
  rating: number | null;
  startDate: string | null;
  endDate: string | null;
  notes: string;
  coverUrl: string;
  pagesRead?: number;
}

export const GENRES: BookGenre[] = [
  'Arte', 'Autoajuda', 'Biografia', 'Ciência', 'Ciências', 'Esoterismo',
  'Fantasia', 'Ficção Científica', 'Filosofia', 'História', 'Literatura',
  'Mangá', 'Negócios', 'Poesia', 'Política', 'Quadrinhos', 'Religião',
  'Sociologia', 'Terror',
];

export const STATUSES: BookStatus[] = ['Concluído', 'Lendo', 'Quero Ler', 'Pausado', 'Abandonado'];
export const LANGUAGES: BookLanguage[] = ['Português', 'Inglês', 'Espanhol', 'Japonês', 'Francês', 'Alemão'];
export const FORMATS: BookFormat[] = ['Físico', 'E-book', 'Audiolivro', 'PDF'];

export const STATUS_CONFIG: Record<BookStatus, { class: string; dot: string }> = {
  'Concluído': { class: 'status-badge-completed', dot: 'bg-status-completed' },
  'Lendo': { class: 'status-badge-reading', dot: 'bg-status-reading' },
  'Quero Ler': { class: 'status-badge-want', dot: 'bg-status-want' },
  'Pausado': { class: 'status-badge-paused', dot: 'bg-status-paused' },
  'Abandonado': { class: 'status-badge-abandoned', dot: 'bg-status-abandoned' },
};
