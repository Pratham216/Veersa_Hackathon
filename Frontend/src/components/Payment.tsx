import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import './Payment.css';

interface PaymentProps {
  amount: number;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

const Payment = ({ amount, onSuccess, onError }: PaymentProps) => {
  const [copied, setCopied] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [loading, setLoading] = useState(false);
  
  const UPI_ID = "9654574335@pthdfc";

  const handleCopyUPI = async () => {
    try {
      await navigator.clipboard.writeText(UPI_ID);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy UPI ID:', err);
    }
  };

  const handlePaymentConfirmation = () => {
    if (!transactionId.trim()) {
      if (onError) {
        onError(new Error('Please enter the transaction ID'));
      }
      return;
    }

    setLoading(true);

    // Call onSuccess callback with payment details
    if (onSuccess) {
      try {
        onSuccess();
      } catch (error) {
        if (onError) {
          onError(error);
        }
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="payment-container">
      <div className="flex flex-col items-center space-y-4 p-6 border rounded-lg bg-white">
        <h2 className="text-xl font-semibold">Pay ₹{amount}</h2>
        
        {/* QR Code */}
        <div className="qr-code-container bg-white p-4 rounded-lg shadow-sm">
          <QRCodeSVG 
            value={`upi://pay?pa=${UPI_ID}&am=${amount}&pn=Doctor Appointment&cu=INR`}
            size={200}
            level="H"
            includeMargin={true}
            className="qr-code"
          />
        </div>

        {/* UPI ID with copy button */}
        <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded w-full justify-center">
          <span className="text-gray-700 font-medium">{UPI_ID}</span>
          <Button
            onClick={handleCopyUPI}
            variant={copied ? "secondary" : "outline"}
            size="sm"
            className="ml-2"
          >
            {copied ? 'Copied!' : 'Copy'}
          </Button>
        </div>

        {/* Transaction ID input */}
        <div className="w-full space-y-2">
          <Label htmlFor="transactionId">Transaction ID</Label>
          <Input
            id="transactionId"
            placeholder="Enter your UPI transaction ID"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            required
          />
        </div>

        {/* Payment confirmation */}
        <div className="mt-4 text-center w-full">
          <p className="text-sm text-gray-600 mb-2">
            After completing the payment, enter the transaction ID and click confirm
          </p>
          <Button
            onClick={handlePaymentConfirmation}
            className="w-full"
            disabled={loading || !transactionId.trim()}
          >
            {loading ? "Processing..." : "Confirm Payment"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Payment;