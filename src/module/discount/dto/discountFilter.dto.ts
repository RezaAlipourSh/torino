export class DiscountFilterDto {
  code?: string;
  type?: string;
  isActive?: boolean;
  forNewComers?: boolean;
  amount?: number;
  percent?: number;
  discountLimit?: number;
  usage?: number;
  tourId?: number;
  buylimit?: number;
  expires_from_date?: string;
  expires_to_date?: string;
  created_from_date?: string;
  created_to_date?: string;
}
