import { useFarmData } from './useFarmData';
import { useFarmPurchases } from './useFarmPurchases';
import { getFarmItemsByType, getGridLayout, getNextPurchasableItem, getPurchaseProgress } from '@/utils/farmUtils';

export const useFarmItems = () => {
  const { farmItems, ownedItems, loading, refetch, fetchOwnedItems } = useFarmData();
  const { purchaseItem, isOwned, canPurchase } = useFarmPurchases(farmItems, ownedItems, fetchOwnedItems);

  return {
    farmItems,
    ownedItems,
    loading,
    purchaseItem,
    isOwned,
    canPurchase,
    getFarmItemsByType: (type: string) => getFarmItemsByType(farmItems, type),
    getGridLayout: () => getGridLayout(farmItems, ownedItems, canPurchase),
    getNextPurchasableItem: () => getNextPurchasableItem(farmItems, canPurchase),
    getPurchaseProgress: () => getPurchaseProgress(farmItems, ownedItems),
    refetch,
  };
};