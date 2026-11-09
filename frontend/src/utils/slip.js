import api from '../api/client.js';

/** Downloads the PDF slip of a booking. The endpoint needs the login token, so a plain link cannot be used. */
export async function downloadSlip(bookingId, challanNumber = 'slip') {
  let response;
  try {
    response = await api.get(`/bookings/${bookingId}/slip`, { responseType: 'blob' });
  } catch (error) {
    // Error bodies also arrive as a Blob here; turn them back into JSON so errorMessage() can read them.
    if (error.response?.data instanceof Blob) {
      try {
        error.response.data = JSON.parse(await error.response.data.text());
      } catch {
        /* keep the generic message */
      }
    }
    throw error;
  }

  const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `Parking-Slip-${challanNumber}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
