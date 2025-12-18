export interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  unit_price: string;
  notes: string | null;
}

export interface OrderEvent {
  id: number;
  event_type: string;
  source: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export type OrderStatus = 'CREATED' | 'ACCEPTED' | 'REJECTED' | 'DELAYED' | 'DONE' | 'CANCELLED';

export interface Order {
  id: number;
  status: OrderStatus;
  customer_name: string;
  delivery_address: string;
  estimated_prep_time: number | null;
  delayed: boolean | null;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  events: OrderEvent[];
  total_price: string;
}
