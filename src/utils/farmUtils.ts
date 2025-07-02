import { FarmItem, FarmPurchase, FarmItemWithStatus } from '@/types/farmTypes';

export const getFarmItemsByType = (farmItems: FarmItem[], type: string) => {
  return farmItems.filter(item => item.type === type);
};

export const getGridLayout = (
  farmItems: FarmItem[], 
  ownedItems: FarmPurchase[], 
  canPurchaseFunc: (item: FarmItem) => boolean
) => {
  // Create 8x6 grid (8 columns, 6 rows)
  const grid = Array(6).fill(null).map(() => Array(8).fill(null));
  
  farmItems.forEach(item => {
    const purchase = ownedItems.find(p => p.farm_item_id === item.id);
    const isItemOwned = !!purchase;
    const isNextAvailable = canPurchaseFunc(item);
    
    // Check if item fits within grid bounds
    if (item.grid_y < 6 && item.grid_x < 8 && 
        item.grid_y + (item.height || 1) <= 6 && 
        item.grid_x + (item.width || 1) <= 8) {
      
      const itemWithStatus: FarmItemWithStatus = {
        ...item,
        isOwned: isItemOwned,
        isNextAvailable: isNextAvailable,
        isLocked: !isItemOwned && !isNextAvailable,
        purchaseId: purchase?.id
      };
      
      // Place the main item at its top-left position
      grid[item.grid_y][item.grid_x] = itemWithStatus;
      
      // Mark child cells for multi-grid items
      const width = item.width || 1;
      const height = item.height || 1;
      
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          if (x === 0 && y === 0) continue; // Skip main cell
          if (item.grid_y + y < 6 && item.grid_x + x < 8) {
            grid[item.grid_y + y][item.grid_x + x] = {
              ...itemWithStatus,
              isMultiGridChild: true
            };
          }
        }
      }
    }
  });

  return grid;
};

export const getNextPurchasableItem = (
  farmItems: FarmItem[], 
  canPurchaseFunc: (item: FarmItem) => boolean
) => {
  return farmItems.find(item => canPurchaseFunc(item));
};

export const getPurchaseProgress = (farmItems: FarmItem[], ownedItems: FarmPurchase[]) => {
  const totalItems = farmItems.length;
  const ownedCount = ownedItems.length;
  return {
    owned: ownedCount,
    total: totalItems,
    percentage: totalItems > 0 ? Math.round((ownedCount / totalItems) * 100) : 0
  };
};