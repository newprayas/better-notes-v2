'use client';

import { quantityDiscountTiers, useCart } from '@/lib/cart-context';

const PromotionalOffers = () => {
  const { itemCount } = useCart();

  // Derive the offer message from the shared tiers so it cannot differ from checkout totals.
  const getDiscountMessage = () => {
    if (itemCount === 0) return null;
    const currentTier = quantityDiscountTiers.reduce(
      (tier, candidate) => (itemCount >= candidate.minItems ? candidate : tier),
      undefined as (typeof quantityDiscountTiers)[number] | undefined
    );
    const nextTier = quantityDiscountTiers.find((tier) => tier.minItems > itemCount);
    const notesNeeded = nextTier ? nextTier.minItems - itemCount : 0;

    return {
      firstPill: nextTier
        ? {
            text: `Add ${notesNeeded} more ${notesNeeded === 1 ? 'note' : 'notes'} for:`,
            discount: `❤️ ${nextTier.discount} tk discount! ❤️`,
          }
        : { text: "You've unlocked maximum discount!", discount: '' },
      secondPill: {
        text: `🎉 You're saving ${currentTier?.discount || 0} tk! 🎉`,
      },
    };
  };

  const discountMessage = getDiscountMessage();

  return (
    <div className="mb-6">
      {/* Promotional Offers */}
      <div className="bg-white border-2 border-black rounded-lg p-6 mb-4 shadow-sm">
        <h2 className="text-xl font-bold text-black mb-3 text-center">🎉 Special Offers 🎉</h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 max-w-4xl mx-auto">
          {quantityDiscountTiers.map((tier) => {
            const isActive = itemCount >= tier.minItems;
            
            return (
              <div
                key={tier.minItems}
                className={`rounded-md p-2 transition-all duration-300 border ${
                  isActive
                    ? 'bg-yellow-50 text-gray-900 border-yellow-300'
                    : 'bg-gray-50 text-gray-600 border-gray-200'
                }`}
              >
                <div className="text-center">
                  <div className={`font-semibold text-sm ${isActive ? 'text-gray-900' : 'text-gray-700'}`}>
                    Buy {tier.minItems} notes
                  </div>
                  <div className={`text-sm font-bold ${isActive ? 'text-gray-900' : 'text-gray-700'}`}>
                    Get {tier.discount} tk off
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dynamic Discount Message */}
      {discountMessage && (
        <div className="space-y-3 flex flex-col items-center">
          {/* First Green Pill */}
          <div className="inline-block bg-green-100 border-2 border-green-500 rounded-full px-6 py-3">
            <div className="font-bold text-green-800 text-center">
              {discountMessage.firstPill.text}
            </div>
            {discountMessage.firstPill.discount && (
              <div className="font-bold text-green-800 text-center mt-2">
                {discountMessage.firstPill.discount}
              </div>
            )}
          </div>
          
          {/* Second Green Pill */}
          <div className="inline-block bg-green-100 border-2 border-green-500 rounded-full px-4 py-2">
            <div className="font-bold text-green-800 text-center">
              {discountMessage.secondPill.text}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromotionalOffers;
