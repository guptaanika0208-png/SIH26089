import { useState } from 'react';
import { payBooking } from '../services/bookingService';

function PaymentModal({ booking, onClose, onSuccess }) {
  const [method, setMethod] = useState('UPI');
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [cashConfirmed, setCashConfirmed] = useState(false);

  const handlePay = async () => {
    // Cash doesn't process online — it just confirms the customer's choice.
    // Actual paymentStatus only updates once the worker confirms they received it.
    if (method === 'Cash') {
      setCashConfirmed(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1800);
      return;
    }

    setProcessing(true);
    setTimeout(async () => {
      try {
        await payBooking(booking._id);
        setProcessing(false);
        setDone(true);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      } catch (err) {
        console.error(err);
        setProcessing(false);
      }
    }, 1200);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(13,44,36,0.4)',
      display: 'grid', placeItems: 'center', zIndex: 50, padding: '20px'
    }}>
      <div className="card" style={{ maxWidth: '380px', width: '100%', background: '#fff' }}>
        {!done && !cashConfirmed ? (
          <>
            <h3>Pay ₹{booking.price}</h3>
            <p className="muted" style={{ fontSize: '0.9em' }}>{booking.serviceType} service</p>

            <div style={{ display: 'flex', gap: '8px', margin: '15px 0', flexWrap: 'wrap' }}>
              {['UPI', 'Card', 'Net Banking', 'Cash'].map((m) => (
                <button
                  key={m}
                  type="button"
                  className={method === m ? 'primary' : 'outline'}
                  style={{ width: 'auto', flex: 1, padding: '8px', minWidth: '80px' }}
                  onClick={() => setMethod(m)}
                >
                  {m}
                </button>
              ))}
            </div>

            {method === 'UPI' && <input type="text" placeholder="example@upi" />}
            {method === 'Card' && (
              <>
                <input type="text" placeholder="Card number" />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="text" placeholder="MM/YY" />
                  <input type="text" placeholder="CVV" />
                </div>
              </>
            )}
            {method === 'Net Banking' && (
              <select>
                <option>State Bank of India</option>
                <option>HDFC Bank</option>
                <option>ICICI Bank</option>
              </select>
            )}
            {method === 'Cash' && (
              <p className="muted" style={{ fontSize: '0.9em', textAlign: 'left' }}>
                Pay the worker directly in cash when the service is completed. Payment will be marked complete once the worker confirms receipt.
              </p>
            )}

            <button className="primary" onClick={handlePay} disabled={processing}>
              {processing ? 'Processing...' : method === 'Cash' ? 'Confirm Cash Payment Choice' : `Pay ₹${booking.price} Securely`}
            </button>
            <button className="outline" style={{ marginTop: '8px' }} onClick={onClose} disabled={processing}>
              Cancel
            </button>
          </>
        ) : cashConfirmed ? (
          <div style={{ textAlign: 'center' }}>
            <h3>Cash Payment Selected</h3>
            <p className="muted">Waiting for {booking.worker?.name || 'the worker'} to confirm receipt after service completion.</p>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <h3>✓ Payment Successful</h3>
            <p className="muted">₹{booking.price} paid for {booking.serviceType}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PaymentModal;