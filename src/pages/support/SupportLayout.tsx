import { useState } from 'react';
import { Link } from 'react-router';
import { FaPaypal, FaGithub, FaCoffee, FaChevronDown, FaCheck, FaCopy } from 'react-icons/fa';
import { HiArrowLeft, HiArrowRight, HiQrCode, HiOutlineLink } from 'react-icons/hi2';
import { SiTether, SiSolana, SiBitcoin, SiEthereum, SiBinance } from 'react-icons/si';
import { RiMoneyDollarCircleFill } from 'react-icons/ri';
import SectionTitle from '../../components/sectionTitle/SectionTitle';
import Footer from '../../components/footer/Footer';
import PixelTransition from '../../components/pixelTransition/PixelTransition';
import { playClickSound, playQrToggleSound } from '../../utils/sound';
import './SupportLayout.css';

interface CryptoOption {
  coin: string;
  icon: React.ReactNode;
  networks: {
    network: string;
    address: string;
  }[];
}

const cryptoData: CryptoOption[] = [
  {
    coin: 'USDT',
    icon: <SiTether />,
    networks: [
      { network: 'Tron (TRC-20)', address: 'TU4VkkffYB6Np7DZNJ4eAVjSFdQmy7NG4N' },
      { network: 'TON', address: 'UQAcb4qXCzLF5vt01Cpj8i5zqs_KyCYCSlE5gNOz0JP2YPRi' },
      { network: 'BNB Chain (BEP-20)', address: '0x07A7c132AeC54a605c0b09BE3AaA17A2fC941FC6' },
      { network: 'Ethereum (ERC-20)', address: '0x07A7c132AeC54a605c0b09BE3AaA17A2fC941FC6' },
      { network: 'Solana', address: 'G8WLfQcFmGexCYjMuNRZqjnyQnuEiYcbSBExeNRQDRps' },
    ],
  },
  {
    coin: 'USDC',
    icon: <RiMoneyDollarCircleFill />,
    networks: [
      { network: 'Base', address: '0x07A7c132AeC54a605c0b09BE3AaA17A2fC941FC6' },
      { network: 'Arbitrum (Arbitrum One)', address: '0x07A7c132AeC54a605c0b09BE3AaA17A2fC941FC6' },
      { network: 'BNB Chain (BEP-20)', address: '0x07A7c132AeC54a605c0b09BE3AaA17A2fC941FC6' },
      { network: 'Ethereum (ERC-20)', address: '0x07A7c132AeC54a605c0b09BE3AaA17A2fC941FC6' },
      { network: 'Solana', address: 'G8WLfQcFmGexCYjMuNRZqjnyQnuEiYcbSBExeNRQDRps' },
    ],
  },
  {
    coin: 'BNB',
    icon: <SiBinance />,
    networks: [
      { network: 'BNB Chain (BEP-20)', address: '0x07A7c132AeC54a605c0b09BE3AaA17A2fC941FC6' },
    ],
  },
  {
    coin: 'ETH',
    icon: <SiEthereum />,
    networks: [
      { network: 'Ethereum (ERC-20)', address: '0x07A7c132AeC54a605c0b09BE3AaA17A2fC941FC6' },
      { network: 'BNB Chain (BEP-20)', address: '0x07A7c132AeC54a605c0b09BE3AaA17A2fC941FC6' },
    ],
  },
  {
    coin: 'SOL',
    icon: <SiSolana />,
    networks: [
      { network: 'Solana', address: 'G8WLfQcFmGexCYjMuNRZqjnyQnuEiYcbSBExeNRQDRps' },
    ],
  },
  {
    coin: 'BTC',
    icon: <SiBitcoin />,
    networks: [
      { network: 'Bitcoin (Native SegWit)', address: 'bc1pw0wkwu9hsacvx27vw6fu4kwzfvf5vtkvalh2u0ym527vwtfsl66symk9pz' },
    ],
  },
];

export default function SupportLayout() {
  const [selectedCoinIdx, setSelectedCoinIdx] = useState<number>(0);
  const [selectedNetworkIdx, setSelectedNetworkIdx] = useState<number>(0);
  const [showCoinDropdown, setShowCoinDropdown] = useState<boolean>(false);
  const [showNetworkDropdown, setShowNetworkDropdown] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showQR, setShowQR] = useState<boolean>(false);
  const [qrActive, setQrActive] = useState<boolean>(true);
  const [showUpiQR, setShowUpiQR] = useState<boolean>(false);
  const [upiQrActive, setUpiQrActive] = useState<boolean>(true);

  const selectedCoin = cryptoData[selectedCoinIdx];
  const selectedNetwork = selectedCoin.networks[selectedNetworkIdx] || selectedCoin.networks[0];

  const handleCopy = (key: string, text: string) => {
    playClickSound();
    void navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSelectCoin = (idx: number) => {
    playClickSound();
    setSelectedCoinIdx(idx);
    setSelectedNetworkIdx(0);
    setShowCoinDropdown(false);
  };

  const handleSelectNetwork = (idx: number) => {
    playClickSound();
    setSelectedNetworkIdx(idx);
    setShowNetworkDropdown(false);
  };

  const handleToggleShowQR = () => {
    const nextState = !showQR;
    playQrToggleSound(nextState);
    setShowQR(nextState);
    if (nextState) {
      setQrActive(true);
    }
  };

  const handleToggleQrCard = () => {
    const nextActive = !qrActive;
    playQrToggleSound(nextActive);
    setQrActive(nextActive);
  };

  const handleToggleShowUpiQR = () => {
    const nextState = !showUpiQR;
    playQrToggleSound(nextState);
    setShowUpiQR(nextState);
    if (nextState) {
      setUpiQrActive(true);
    }
  };

  const handleToggleUpiQrCard = () => {
    const nextActive = !upiQrActive;
    playQrToggleSound(nextActive);
    setUpiQrActive(nextActive);
  };

  return (
    <div className="support-page-wrapper">
      <div className="support-page">
        <SectionTitle>/support</SectionTitle>

        <p className="support-subtitle">
          If you find my open-source work helpful, consider supporting its development.
        </p>

        {/* 1. Quick Support */}
        <div className="support-block">
          <h2 className="support-block-title">Quick Support</h2>
          <p className="support-block-desc">Simple, one-click methods to support directly.</p>

          <div className="support-quick-grid">
            <a
              href="https://paypal.me/MOHDKAIF099"
              target="_blank"
              rel="noopener noreferrer"
              className="support-quick-card"
              onClick={() => playClickSound()}
            >
              <HiOutlineLink className="support-quick-ext" />
              <FaPaypal className="support-quick-icon" />
              <span className="support-quick-name">PayPal</span>
              <span className="support-quick-desc">One-time gift via PayPal</span>
            </a>

            <a
              href="https://buymeacoffee.com/kaif_coder"
              target="_blank"
              rel="noopener noreferrer"
              className="support-quick-card"
              onClick={() => playClickSound()}
            >
              <HiOutlineLink className="support-quick-ext" />
              <FaCoffee className="support-quick-icon" />
              <span className="support-quick-name">Buy Me a Coffee</span>
              <span className="support-quick-desc">Fuel my late-night builds</span>
            </a>

            <a
              href="https://github.com/kaif-webwork"
              target="_blank"
              rel="noopener noreferrer"
              className="support-quick-card"
              onClick={() => playClickSound()}
            >
              <HiOutlineLink className="support-quick-ext" />
              <FaGithub className="support-quick-icon" />
              <span className="support-quick-name">GitHub Sponsors</span>
              <span className="support-quick-desc">Recurring support on GitHub</span>
            </a>
          </div>
        </div>

        {/* 2. UPI Transfer */}
        <div className="support-block">
          <h2 className="support-block-title">UPI Transfer</h2>
          <p className="support-block-desc">For direct transfers within India.</p>

          <div className="support-upi-card">
            <div className="support-upi-left">
              <span className="support-upi-rupee-badge">₹</span>
              <span className="support-upi-id">kaifc0der@ptyes</span>
            </div>
            <div className="support-upi-actions">
              <button
                type="button"
                className={`support-toggle-qr-btn ${showUpiQR ? 'active' : ''}`}
                onClick={handleToggleShowUpiQR}
              >
                <HiQrCode />
                <span>{showUpiQR ? 'Hide QR' : 'Show QR'}</span>
              </button>
              <button
                type="button"
                className="support-copy-btn"
                onClick={() => handleCopy('upi', 'kaifc0der@ptyes')}
                title="Copy UPI ID"
                aria-label="Copy UPI ID"
              >
                {copiedKey === 'upi' ? (
                  <>
                    <FaCheck className="copied-icon" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <FaCopy />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {showUpiQR && (
            <div className="support-qr-display-container">
              <div
                className="support-qr-pixel-wrapper"
                onClick={handleToggleUpiQrCard}
                title={upiQrActive ? 'Click to show UPI Info' : 'Click to show QR Code'}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleToggleUpiQrCard();
                  }
                }}
              >
                <PixelTransition
                  key="upi-qr-card"
                  firstContent={
                    <div className="support-qr-placeholder-content">
                      <div className="support-qr-placeholder-icon">
                        <span className="support-upi-rupee-badge-large">₹</span>
                      </div>
                      <span className="support-qr-placeholder-text">UPI Payment</span>
                      <span className="support-qr-placeholder-net">kaifc0der@ptyes</span>
                      <span className="support-qr-placeholder-sub">Click to reveal QR Code</span>
                    </div>
                  }
                  secondContent={
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent('upi://pay?pa=kaifc0der@ptyes&pn=Mohd%20Kaif&cu=INR')}`}
                      alt="UPI QR Code"
                      className="support-dynamic-qr-image"
                      loading="eager"
                    />
                  }
                  gridSize={12}
                  pixelColor="#ffffff"
                  animationStepDuration={0.35}
                  isActive={upiQrActive}
                  trigger="none"
                  aspectRatio="100%"
                  className="support-crypto-pixel-qr"
                />
              </div>
              <p className="support-qr-hint">Scan with GPay, PhonePe, Paytm, or any UPI app</p>
            </div>
          )}
        </div>

        {/* 3. Crypto */}
        <div className="support-block">
          <h2 className="support-block-title">Crypto</h2>
          <p className="support-block-desc">
            Support using cryptocurrencies across major blockchains.
          </p>

          {/* Selectors Row */}
          <div className="support-crypto-selectors">
            {/* Coin Selector */}
            <div className="support-selector-group">
              <span className="support-selector-label">Coin</span>
              <div className="support-dropdown-wrapper">
                <button
                  type="button"
                  className="support-dropdown-trigger"
                  onClick={() => setShowCoinDropdown(!showCoinDropdown)}
                >
                  <div className="support-dropdown-current">
                    {selectedCoin.icon}
                    <span>{selectedCoin.coin}</span>
                  </div>
                  <FaChevronDown
                    className={`support-chevron ${showCoinDropdown ? 'open' : ''}`}
                  />
                </button>

                {showCoinDropdown && (
                  <div className="support-dropdown-menu">
                    {cryptoData.map((c, idx) => (
                      <div
                        key={c.coin}
                        className={`support-dropdown-item ${
                          selectedCoinIdx === idx ? 'selected' : ''
                        }`}
                        onClick={() => handleSelectCoin(idx)}
                      >
                        {c.icon}
                        <span>{c.coin}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Network Selector */}
            <div className="support-selector-group">
              <span className="support-selector-label">Network</span>
              <div className="support-dropdown-wrapper">
                <button
                  type="button"
                  className="support-dropdown-trigger"
                  onClick={() => setShowNetworkDropdown(!showNetworkDropdown)}
                >
                  <div className="support-dropdown-current">
                    <span>{selectedNetwork.network}</span>
                  </div>
                  <FaChevronDown
                    className={`support-chevron ${showNetworkDropdown ? 'open' : ''}`}
                  />
                </button>

                {showNetworkDropdown && (
                  <div className="support-dropdown-menu">
                    {selectedCoin.networks.map((n, idx) => (
                      <div
                        key={n.network}
                        className={`support-dropdown-item ${
                          selectedNetworkIdx === idx ? 'selected' : ''
                        }`}
                        onClick={() => handleSelectNetwork(idx)}
                      >
                        <span>{n.network}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Address Display Box */}
          <div className="support-crypto-address-box">
            <div className="support-address-header-row">
              <span className="support-network-badge">{selectedNetwork.network}</span>
              <button
                type="button"
                className="support-copy-btn"
                onClick={() => handleCopy(selectedNetwork.address, selectedNetwork.address)}
                title="Copy Address"
              >
                {copiedKey === selectedNetwork.address ? (
                  <>
                    <FaCheck className="copied-icon" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <FaCopy />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <div className="support-address-code">{selectedNetwork.address}</div>

            <div className="support-address-footer-row">
              <button
                type="button"
                className={`support-toggle-qr-btn ${showQR ? 'active' : ''}`}
                onClick={handleToggleShowQR}
              >
                <HiQrCode />
                <span>{showQR ? 'Hide QR' : 'Show QR'}</span>
              </button>
            </div>

            {showQR && (
              <div className="support-qr-display-container">
                <div
                  className="support-qr-pixel-wrapper"
                  onClick={handleToggleQrCard}
                  title={qrActive ? 'Click to show Coin Info' : 'Click to show QR Code'}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleToggleQrCard();
                    }
                  }}
                >
                  <PixelTransition
                    key={`${selectedCoin.coin}-${selectedNetwork.network}`}
                    firstContent={
                      <div className="support-qr-placeholder-content">
                        <div className="support-qr-placeholder-icon">
                          {selectedCoin.icon}
                        </div>
                        <span className="support-qr-placeholder-text">
                          {selectedCoin.coin}
                        </span>
                        <span className="support-qr-placeholder-net">
                          {selectedNetwork.network}
                        </span>
                        <span className="support-qr-placeholder-sub">Click to reveal QR Code</span>
                      </div>
                    }
                    secondContent={
                      <img
                        key={selectedNetwork.address}
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(selectedNetwork.address)}`}
                        alt={`${selectedCoin.coin} (${selectedNetwork.network}) QR Code`}
                        className="support-dynamic-qr-image"
                        loading="eager"
                      />
                    }
                    gridSize={12}
                    pixelColor="#ffffff"
                    animationStepDuration={0.35}
                    isActive={qrActive}
                    trigger="none"
                    aspectRatio="100%"
                    className="support-crypto-pixel-qr"
                  />
                </div>
                <p className="support-qr-hint">Scan with any {selectedNetwork.network} compatible wallet</p>
              </div>
            )}
          </div>

          <p className="support-crypto-footnote">
            Double-check the network before sending — sending on the wrong network may result in loss of funds.
          </p>
        </div>

        {/* Bottom Navigation */}
        <div className="support-navigation-row">
          <Link to="/" className="support-nav-pill-btn" onClick={() => playClickSound()}>
            <HiArrowLeft /> <span>Back to Home</span>
          </Link>
          <Link to="/projects" className="support-nav-pill-btn" onClick={() => playClickSound()}>
            <span>View Projects</span> <HiArrowRight />
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
