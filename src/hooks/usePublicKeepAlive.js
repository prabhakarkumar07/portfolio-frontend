import { useEffect } from 'react';
import { healthAPI } from '../utils/api';

const FIVE_MINUTES = 5 * 60 * 1000;

const pingBackend = () => healthAPI.ping().catch(() => {});

const usePublicKeepAlive = () => {
  useEffect(() => {
    pingBackend();

    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        pingBackend();
      }
    }, FIVE_MINUTES);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        pingBackend();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
};

export default usePublicKeepAlive;
