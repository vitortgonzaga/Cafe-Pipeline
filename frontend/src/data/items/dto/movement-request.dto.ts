export interface MovementInRequestDTO {
  quantity: number;
  reason?: string;
  responsible: string;
}

export interface MovementOutRequestDTO {
  quantity: number;
  reason: string;
  responsible: string;
}
