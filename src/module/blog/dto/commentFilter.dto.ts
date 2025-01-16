export class commentFilterDto {
  blogId?: number;
  userId?: number;
  comment?: string;
  commentStatus?: string;
  parentId?: number;
  updated_from?: Date;
  updated_to?: Date;
  created_from?: Date;
  created_to?: Date;
}
