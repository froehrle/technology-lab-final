import React, { useState } from 'react';
import { useAvatarItems } from '@/hooks/useAvatarItems';
import { useCoins } from '@/hooks/useCoins';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import StoreItem from '@/components/store/StoreItem';
import CoinBalance from '@/components/store/CoinBalance';
import CustomAvatar from '@/components/avatar/CustomAvatar';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';

const AvatarStore = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { allItems, ownedItems, equipItem, unequipItem, purchaseItem, isOwned, loading } = useAvatarItems();
  const { coins, spendCoins } = useCoins();

  const handlePurchase = async (item: any) => {
    const spendResult = await spendCoins(item.price);
    if (spendResult.success) {
      await purchaseItem(item);
    }
  };

  const handleEquip = async (item: any) => {
    const purchase = ownedItems.find(p => p.item_id === item.id);
    if (purchase) {
      await equipItem(purchase.id, item.type);
    }
  };

  const handleUnequip = async (item: any) => {
    const purchase = ownedItems.find(p => p.item_id === item.id);
    if (purchase) {
      await unequipItem(purchase.id);
    }
  };

  const isEquipped = (itemId: string) => {
    return ownedItems.some(purchase => 
      purchase.item_id === itemId && purchase.is_equipped
    );
  };

  const canAfford = (price: number) => {
    return (coins?.total_coins || 0) >= price;
  };

  const filterItemsByType = (type: string) => {
    return allItems.filter(item => item.type === type);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Lade Avatar Shop...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">Avatar Shop</h1>
          <CoinBalance />
        </div>
        
        {/* Avatar Preview */}
        <div className="flex items-center justify-center mb-6">
          <div className="text-center">
            <CustomAvatar 
              src={profile?.avatar_url}
              fallback={user?.email?.charAt(0).toUpperCase() || 'A'}
              className="h-24 w-24 mx-auto mb-2"
            />
            <p className="text-sm text-muted-foreground">Dein aktueller Avatar</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="border" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="border">
            Rahmen ({filterItemsByType('border').length})
          </TabsTrigger>
          <TabsTrigger value="background">
            Hintergrund ({filterItemsByType('background').length})
          </TabsTrigger>
          <TabsTrigger value="effect">
            Effekte ({filterItemsByType('effect').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="border" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filterItemsByType('border').map((item) => (
              <StoreItem
                key={item.id}
                item={item}
                isOwned={isOwned(item.id)}
                isEquipped={isEquipped(item.id)}
                onPurchase={() => handlePurchase(item)}
                onEquip={() => handleEquip(item)}
                onUnequip={() => handleUnequip(item)}
                canAfford={canAfford(item.price)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="background" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filterItemsByType('background').map((item) => (
              <StoreItem
                key={item.id}
                item={item}
                isOwned={isOwned(item.id)}
                isEquipped={isEquipped(item.id)}
                onPurchase={() => handlePurchase(item)}
                onEquip={() => handleEquip(item)}
                onUnequip={() => handleUnequip(item)}
                canAfford={canAfford(item.price)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="effect" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filterItemsByType('effect').map((item) => (
              <StoreItem
                key={item.id}
                item={item}
                isOwned={isOwned(item.id)}
                isEquipped={isEquipped(item.id)}
                onPurchase={() => handlePurchase(item)}
                onEquip={() => handleEquip(item)}
                onUnequip={() => handleUnequip(item)}
                canAfford={canAfford(item.price)}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AvatarStore;