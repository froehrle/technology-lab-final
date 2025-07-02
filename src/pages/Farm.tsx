import React from 'react';
import { useFarmItems } from '@/hooks/useFarmItems';

import CoinBalance from '@/components/store/CoinBalance';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Home, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Farm = () => {
  const { ownedItems, farmItems, loading, getPurchaseProgress, getNextPurchasableItem } = useFarmItems();
  
  const progress = getPurchaseProgress();
  const nextItem = getNextPurchasableItem();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                🚜 Deine Farm
              </h1>
              <p className="text-foreground/70 mt-1">Gestalte und erweitere deinen eigenen Bauernhof</p>
            </div>
            <div className="flex items-center space-x-4">
              <CoinBalance />
              <Link to="/avatar-store">
                <Button variant="outline" size="sm">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Shop
                </Button>
              </Link>
            </div>
          </div>

          {/* Farm Instructions */}
          <Alert className="mb-6 bg-blue-50 border-blue-200">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Kaufe Gegenstände im Shop, um deine Farm zu erweitern! Manche Gegenstände benötigen andere als Voraussetzung.
            </AlertDescription>
          </Alert>
        </div>

        {/* Farm Progress Stats */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20 text-center">
            <div className="text-2xl font-bold text-green-600">{progress.owned}</div>
            <div className="text-sm text-foreground/70">Gekaufte Gegenstände</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20 text-center">
            <div className="text-2xl font-bold text-blue-600">{progress.percentage}%</div>
            <div className="text-sm text-foreground/70">Farm vollständig</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20 text-center">
            <div className="text-2xl font-bold text-yellow-600">{progress.total - progress.owned}</div>
            <div className="text-sm text-foreground/70">Noch verfügbar</div>
          </div>
          {nextItem && (
            <div className="bg-gradient-to-r from-yellow-100 to-orange-100 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-yellow-300 text-center">
              <div className="text-lg font-bold text-orange-600 flex items-center justify-center space-x-1">
                <span>{nextItem.icon}</span>
                <span>#{nextItem.purchase_order}</span>
              </div>
              <div className="text-sm text-foreground/70">Als Nächstes</div>
            </div>
          )}
        </div>

        {/* Farm Display - Grid Removed */}
        <div className="mb-8 bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-white/20 text-center">
          <div className="text-6xl mb-4">🏗️</div>
          <h3 className="text-xl font-semibold mb-2">Farm wird neu gestaltet</h3>
          <p className="text-foreground/70">
            Die Farm-Anzeige wurde entfernt und wird in Zukunft neu implementiert.
          </p>
        </div>

        {/* Empty State */}
        {!loading && progress.owned === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏚️</div>
            <h3 className="text-xl font-semibold mb-2">Deine Farm ist noch leer!</h3>
            <p className="text-foreground/70 mb-6">
              Beginne mit dem Kauf deines ersten Gegenstands im Shop, um deine Farm aufzubauen.
            </p>
            <Link to="/avatar-store">
              <Button size="lg">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Zum Shop
              </Button>
            </Link>
          </div>
        )}

        {/* Farm Tips */}
        <div className="mt-8 bg-gradient-to-r from-green-100 to-blue-100 rounded-2xl p-6 border border-green-200">
          <h3 className="text-lg font-semibold mb-3 text-green-800">🌱 Farm-Tipps</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start space-x-2">
              <span className="text-lg">🏠</span>
              <div>
                <strong>Gebäude:</strong> Stellen die Basis deiner Farm dar und sind oft Voraussetzung für andere Gegenstände.
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-lg">🐄</span>
              <div>
                <strong>Tiere:</strong> Bringen Leben auf deine Farm und können Ressourcen produzieren.
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-lg">🚜</span>
              <div>
                <strong>Ausrüstung:</strong> Hilft bei der Farmarbeit und erhöht die Effizienz.
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-lg">🌾</span>
              <div>
                <strong>Pflanzen:</strong> Produzieren Nahrung und verschönern deine Farm.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Farm;