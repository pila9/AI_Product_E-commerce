import { formatPrice } from '../utils/helpers';

interface CheckoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  total: number;
}

export function CheckoutDialog({
  isOpen,
  onClose,
  onConfirm,
  total,
}: CheckoutDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true" aria-labelledby="checkout-title">
      <div className="w-full max-w-md bg-white dark:bg-gray-950 rounded-2xl shadow-xl p-6 sm:p-8 relative">
        <button
          type="button"
          className="absolute top-4 right-4 p-1 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          onClick={onClose}
          aria-label="Close checkout"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <span className="text-3xl" aria-hidden="true">✳</span>
        <span className="block mt-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          A DEMO CHECKOUT
        </span>
        <h2 id="checkout-title" className="mt-3 text-xl font-semibold text-gray-900 dark:text-gray-100">
          Your good things are almost yours.
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          This portfolio demo doesn&rsquo;t take real payments. Your bag is ready for the next step.
        </p>

        <div className="mt-6 flex justify-between text-base">
          <span className="text-gray-600 dark:text-gray-400">Order total</span>
          <strong className="text-gray-900 dark:text-gray-100 text-lg">
            {formatPrice(total)}
          </strong>
        </div>

        <button
          type="button"
          className="mt-6 w-full px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium rounded-full hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
          onClick={onConfirm}
        >
          Place demo order
        </button>

        <p className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
          No payment details needed &middot; Nothing will be charged
        </p>
      </div>
    </div>
  );
}