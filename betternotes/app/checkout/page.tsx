'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft, 
  Trash2, 
  Plus, 
  Minus, 
  Tag, 
  Send, 
  Check,
  X,
  Copy
} from 'lucide-react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import PromotionalOffers from '@/components/checkout/promotional-offers';
import { useCart } from '@/lib/cart-context';
import { validateDiscountCode } from '@/lib/sanity/api';

export default function CheckoutPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, applyDiscountCode, removeDiscountCode } = useCart();
  const [discountCodeInput, setDiscountCodeInput] = useState('');
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  const [discountError, setDiscountError] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  
  // New state for validation steps
  const [gmailAddress, setGmailAddress] = useState('');
  const [emailConfirmed, setEmailConfirmed] = useState(false);
  const [screenshotConfirmed, setScreenshotConfirmed] = useState(false);

  const handleApplyDiscountCode = async () => {
    if (!discountCodeInput.trim()) return;
    
    setIsApplyingDiscount(true);
    setDiscountError('');
    
    try {
      // In a real app, we would validate the discount code with Sanity
      // For now, we'll simulate a discount code validation
      if (discountCodeInput.toLowerCase() === 'student10') {
        applyDiscountCode(discountCodeInput, 10);
        setDiscountCodeInput('');
      } else if (discountCodeInput.toLowerCase() === 'welcome20') {
        applyDiscountCode(discountCodeInput, 20);
        setDiscountCodeInput('');
      } else {
        setDiscountError('Invalid discount code');
      }
    } catch (error) {
      setDiscountError('Failed to apply discount code');
    } finally {
      setIsApplyingDiscount(false);
    }
  };

  const handleRemoveDiscountCode = () => {
    removeDiscountCode();
  };

  const handlePlaceOrder = () => {
    // In a real app, this would process the order
    setOrderPlaced(true);
    clearCart();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToClipboard(true);
    setTimeout(() => setCopiedToClipboard(false), 2000);
  };

  const telegramUsername = '@prayas_ojha';
  const orderMessage = `Hi! I'd like to purchase the following notes:\n\n${cart.items.map(item => `${item.note.title} (x${item.quantity}) - ₹${(item.note.price || 0) * item.quantity}`).join('\n')}\n\nTotal: ₹${cart.finalTotal}`;

  if (orderPlaced) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-grow bg-gray-50 py-12">
          <div className="container">
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              
              <h1 className="text-2xl font-bold text-black mb-4">Order Placed Successfully!</h1>
              
              <p className="text-gray-700 mb-6">
                Thank you for your order! Please contact us on Telegram to complete your purchase and receive your notes.
              </p>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Next Steps:</h2>
                <div className="text-left space-y-3">
                  <div className="flex items-center">
                    <span className="text-lg mr-2">🎉</span>
                    <span>Contact us on Telegram with your order details</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-lg mr-2">✅</span>
                    <span className="font-bold text-blue-600">Please SEND the screenshot you took via telegram</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-lg mr-2">🎉</span>
                    <span>Receive your notes in your Google Docs - link will be sent to telegram.</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-lg mr-2">🎉</span>
                    <span>Make payment ONLY AFTER you have received your notes ❤️</span>
                  </div>
                </div>
              </div>
              
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="https://t.me/prayas_ojha"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-yellow-400 text-black font-bold rounded-lg hover:bg-yellow-500 transition-colors"
                >
                  <Send className="w-5 h-5 mr-2" />
                  Contact on Telegram
                </a>
                <Link href="/" className="inline-flex items-center px-6 py-3 bg-yellow-100 text-black font-bold rounded-full hover:bg-yellow-200 transition-colors">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow bg-gray-50 py-8">
        <div className="container">
          <div className="mb-6">
            <Link href="/notes" className="inline-flex items-center px-4 py-2 bg-yellow-100 text-black font-bold rounded-full hover:bg-yellow-200 transition-colors">
              <ArrowLeft className="w-6 h-6 mr-2 text-black font-bold" />
              Continue Shopping
            </Link>
          </div>

          {cart.items.length === 0 ? (
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="w-8 h-8 text-gray-400" />
              </div>
              
              <h1 className="text-2xl font-bold text-black mb-4">Your Cart is Empty</h1>
              
              <p className="text-gray-700 mb-6">
                Looks like you haven't added any notes to your cart yet.
              </p>
              
              <Link href="/notes" className="btn-primary">
                Browse Notes
              </Link>
            </div>
          ) : (
            <div>
              <PromotionalOffers />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-black">
                  <h1 className="text-xl font-bold text-black mb-6">Shopping Cart</h1>
                  
                  <div className="space-y-4">
                    {cart.items.map((item) => (
                      <div key={item.note._id} className="flex gap-4 pb-4 border-b border-gray-200 last:border-0">
                        <div className="flex-grow">
                          <h3 className="font-semibold text-black mb-1">{item.note.title}</h3>
                          <p className="text-sm text-gray-600 mb-1">
                            {item.note.subject && '_ref' in item.note.subject
                              ? 'Loading...' // Reference will be populated on server side
                              : item.note.subject?.name || 'No subject'
                            }
                          </p>
                          <p className="font-medium text-black">{item.note.price || 0} tk</p>
                        </div>
                        
                        <button
                          onClick={() => removeFromCart(item.note._id)}
                          className="p-2 rounded-full hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-5 h-5 text-red-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <div className="bg-white rounded-lg shadow-lg p-6 mb-4 border-2 border-black">
                  <h2 className="text-xl font-bold text-black mb-6">Order Summary</h2>
                  
                  <div className="space-y-2 mb-6">
                    {cart.items.map((item) => (
                      <div key={item.note._id} className="flex justify-between items-start">
                        <span className="text-gray-700 flex-1 mr-2 break-words">{item.note.title}</span>
                        <span className="font-medium flex-shrink-0">{item.note.price || 0} tk</span>
                      </div>
                    ))}
                    
                    <div className="border-t border-gray-200 pt-2 mt-2">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Price Before Discount</span>
                        <span className="font-medium">{cart.total} tk</span>
                      </div>
                      
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Quantity Discount</span>
                        <span className={`font-medium ${(cart.quantityDiscount || 0) > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                          -{cart.quantityDiscount || 0} tk
                        </span>
                      </div>
                      {cart.discountCode && (
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-600">Discount ({cart.discountCode})</span>
                          <span className="font-medium text-green-600">-{cart.discountAmount} tk</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center">
                        <span className="font-bold">Total</span>
                        <span className="font-bold">{cart.finalTotal} tk</span>
                      </div>
                      
                      {/* Gmail Pill Display */}
                      {emailConfirmed && gmailAddress && (
                        <div className="mt-3 flex justify-end">
                          <div className="inline-flex items-center px-3 py-1 bg-yellow-100 text-black text-sm font-medium rounded-lg">
                            <span>{gmailAddress}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>


                  {/* Gmail Input Field */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Please add your gmail address that you use on your phone ❤️
                    </label>
                    <input
                      type="email"
                      value={gmailAddress}
                      onChange={(e) => setGmailAddress(e.target.value)}
                      placeholder="your.gmail@gmail.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    />
                  </div>

                  {/* Email Confirmation Checkbox */}
                  {gmailAddress && (
                    <div className="mb-4">
                      <label className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={emailConfirmed}
                          onChange={(e) => setEmailConfirmed(e.target.checked)}
                          className="mt-1 w-5 h-5 text-yellow-400 border-gray-300 rounded focus:ring-yellow-400"
                        />
                        <div>
                          <span className="text-sm font-medium text-gray-700">
                            Please recheck your Gmail 🎉<br />
                            Your notes will be sent to this gmail - make sure it is correct.
                          </span>
                          <p className="text-xs text-red-600 font-medium mt-1">
                            I HAVE RE-CHECKED MY Gmail and IT IS CORRECT
                          </p>
                        </div>
                      </label>
                    </div>
                  )}

                  {/* Screenshot Confirmation Checkbox */}
                  {emailConfirmed && (
                    <div className="mb-4">
                      <label className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={screenshotConfirmed}
                          onChange={(e) => setScreenshotConfirmed(e.target.checked)}
                          className="mt-1 w-5 h-5 text-yellow-400 border-gray-300 rounded focus:ring-yellow-400"
                        />
                        <div>
                          <span className="text-sm font-medium text-gray-700">
                            Please take a screenshot of the FULL order summary (which notes + total amount) 🎉<br />
                            We need this screnshot to send you notes
                          </span>
                          <p className="text-xs text-red-600 font-medium mt-1">
                            YES I HAVE TAKEN THE SCREENSHOT
                          </p>
                        </div>
                      </label>
                    </div>
                  )}

                  <button
                    onClick={handlePlaceOrder}
                    disabled={!gmailAddress || !emailConfirmed || !screenshotConfirmed}
                    className={`w-full px-6 py-3 rounded-lg font-bold transition-colors text-center ${
                      gmailAddress && emailConfirmed && screenshotConfirmed
                        ? 'bg-yellow-400 text-black hover:bg-yellow-500'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Place Order
                  </button>
                  
                  <p className="text-xs text-gray-500 text-center mt-4">
                    By placing this order, you agree to contact us on Telegram to complete your purchase.
                  </p>
                </div>

                {/* Contact Information */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">How to Complete Your Order</h3>
                  <ol className="text-sm text-blue-800 space-y-1">
                    <li>1. Click "Place Order" to confirm your selection</li>
                    <li>2. Contact us on Telegram at {telegramUsername}</li>
                    <li>3. Share your order details and complete payment</li>
                    <li>4. Receive your notes instantly</li>
                  </ol>
                </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}