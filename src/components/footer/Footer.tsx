import { useState, useEffect } from 'react';
import { BsFillArrowThroughHeartFill } from 'react-icons/bs';
import './Footer.css';

export default function Footer() {
  const [istTime, setIstTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-GB', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
      setIstTime(timeStr);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="footer">
      <p className="footer-quote">
        "Nothing Is Perfect – But You Can Make It Better."
      </p>

      <div className="footer-attribution">
        Designed &amp; Made with{' '}
        <span className="footer-heart">
          <BsFillArrowThroughHeartFill />
        </span>
      </div>

      <div className="footer-bottom-row">
        <span>© {new Date().getFullYear()} Mohd Kaif (kaifcoder.in) • All rights reserved</span>
        <span className="footer-clock-text">{istTime || '15:18:51'} IST</span>
      </div>
    </footer>
  );
}
