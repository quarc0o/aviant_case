export interface Item {
  id: number;
  name: string;
  quantity: number;
  notes: string;
  completed_at: string | null;
}

export interface Preparation {
  id: number;
  order_id: string;
  created_at: string;
  accepted_at: string | null;
  ready_at: string | null;
  rejected_at: string | null;
  cancelled_at: string | null;
  delayed_to: string | null;
  completed_at: string | null;
  items: Item[];
}
