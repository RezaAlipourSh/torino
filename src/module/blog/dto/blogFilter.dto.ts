export class BlogFilterDto {
  title?: string;
  description?: string;
  content?: string;
  blogStatus?: string;
  readTime?: string;
  authorId?: string;
  from_date?: string;
  to_date?: string;
  categoryId?:number;
}
