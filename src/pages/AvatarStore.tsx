import React, { useState } from 'react';
import { useProfileBadges } from '@/hooks/useProfileBadges';
import { useCoins } from '@/hooks/useCoins';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import BadgeStoreItem from '@/components/store/BadgeStoreItem';
import CoinBalance from '@/components/store/CoinBalance';
import CustomAvatar from '@/components/avatar/CustomAvatar';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';

const AvatarStore = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { 
    getBadgesByType, 
    ownedBadges, 
    equipBadge, 
    unequipBadge, 
    purchaseBadge, 
    isOwned: isBadgeOwned, 
    loading: badgesLoading 
  } = useProfileBadges();
  const { coins, spendCoins } = useCoins();

  const handleBadgePurchase = async (badge: any) => {
    const spendResult = await spendCoins(badge.price);
    if (spendResult.success) {
      await purchaseBadge(badge);
    }
  };


  const handleBadgeEquip = async (badge: any) => {
    const purchase = ownedBadges.find(p => p.badge_id === badge.id);
    if (purchase) {
      await equipBadge(purchase.id, badge.badge_type);
    }
  };


  const isBadgeEquipped = (badgeId: string) => {
    return ownedBadges.some(purchase => 
      purchase.badge_id === badgeId && purchase.is_equipped
    );
  };

  const handleBadgeUnequip = async (badge: any) => {
    const purchase = ownedBadges.find(p => p.badge_id === badge.id);
    if (purchase) {
      await unequipBadge(purchase.id);
    }
  };

  const canAfford = (price: number) => {
    return (coins?.total_coins || 0) >= price;
  };

  if (badgesLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Lade Shop...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">Shop</h1>
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

      <Tabs defaultValue="badges" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="badges">
            Badges ({getBadgesByType('badge').length})
          </TabsTrigger>
          <TabsTrigger value="titles">
            Titel ({getBadgesByType('title').length})
          </TabsTrigger>
        </TabsList>


        <TabsContent value="badges" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getBadgesByType('badge').map((badge) => (
              <BadgeStoreItem
                key={badge.id}
                badge={badge}
                isOwned={isBadgeOwned(badge.id)}
                isEquipped={isBadgeEquipped(badge.id)}
                onPurchase={() => handleBadgePurchase(badge)}
                onEquip={() => handleBadgeEquip(badge)}
                onUnequip={() => handleBadgeUnequip(badge)}
                canAfford={canAfford(badge.price)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="titles" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getBadgesByType('title').map((badge) => (
              <BadgeStoreItem
                key={badge.id}
                badge={badge}
                isOwned={isBadgeOwned(badge.id)}
                isEquipped={isBadgeEquipped(badge.id)}
                onPurchase={() => handleBadgePurchase(badge)}
                onEquip={() => handleBadgeEquip(badge)}
                onUnequip={() => handleBadgeUnequip(badge)}
                canAfford={canAfford(badge.price)}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AvatarStore;