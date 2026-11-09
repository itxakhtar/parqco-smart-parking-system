import { useState } from 'react';
import { Download } from 'lucide-react';
import { downloadSlip } from '../utils/slip.js';
import { errorMessage } from '../utils/format.js';

/** "Download slip" button for one booking. Reports its own errors next to the button. */
export default function SlipButton({ bookingId, challanNumber, className = 'btn btn-ghost btn-sm', label = 'Slip' }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handleClick = async () => {
    setError('');
    setBusy(true);
    try {
      await downloadSlip(bookingId, challanNumber);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button type="button" className={className} onClick={handleClick} disabled={busy}>
        <Download size={15} /> {busy ? 'Preparing…' : label}
      </button>
      {error && <span className="slip-error" role="alert">{error}</span>}
    </>
  );
}
