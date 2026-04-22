import { useEffect } from 'react';
import { healthAPI } from '../utils/api';

const ONE_MINUTE = 60 * 1000;

const pingBackend = () => healthAPI.ping().catch(() => {});

const usePublicKeepAlive = () => {
  useEffect(() => {
    pingBackend();

    const interval = window.setInterval(() => {
      pingBackend();
    }, ONE_MINUTE);

    const handleOnline = () => pingBackend();

    window.addEventListener('online', handleOnline);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('online', handleOnline);
    };
  }, []);
};

export default usePublicKeepAlive;
