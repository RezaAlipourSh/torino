export type BasketItem = {
  tourid: number;
  tourName: string;
  count: number;
  ticketPrice: string;
  totaLPrice: number;
};

export type BasketType = {
  PaymentAmount: string;
  basketList: BasketItem[];
};
