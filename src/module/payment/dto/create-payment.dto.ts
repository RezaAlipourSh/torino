import { ApiPropertyOptional } from "@nestjs/swagger";

export class PaymentDto {
  @ApiPropertyOptional()
  description?: string;
}

export class PaymentData {
  userId: number;
  reserveId: number;
  status: boolean;
  amount: number;
  invoiceNumber: string;
}
