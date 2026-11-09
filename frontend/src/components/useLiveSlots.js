import { useCallback, useEffect, useState } from 'react';
import api from '../api/client.js';
import { socket } from '../api/socket.js';
import { errorMessage } from '../utils/format.js';

/**
 * Loads all slots and keeps them fresh: whenever the backend broadcasts a
 * "slot:update" (sensor changed) or "booking:update", we reload the list.
 */
export function useLiveSlots() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [connected, setConnected] = useState(socket.connected);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/slots');
      setSlots(data.slots);
      setError('');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    socket.on('slot:update', load);
    socket.on('booking:update', load);
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    return () => {
      socket.off('slot:update', load);
      socket.off('booking:update', load);
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, [load]);

  return { slots, loading, error, connected, reload: load };
}
