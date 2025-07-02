export interface FarmItem {
  id: string;
  name: string;
  description: string | null;
  type: string;
  price: number;
  grid_x: number;
  grid_y: number;
  icon: string;
  rarity: string | null;
  prerequisite_item_id: string | null;
  width: number;
  height: number;
  purchase_order: number;
  created_at: string;
}

export interface FarmPurchase {
  id: string;
  student_id: string;
  farm_item_id: string;
  purchased_at: string;
  is_placed: boolean;
}

export interface FarmItemWithStatus extends FarmItem {
  isOwned: boolean;
  isNextAvailable: boolean;
  isLocked: boolean;
  purchaseId?: string;
  isMultiGridChild?: boolean;
}