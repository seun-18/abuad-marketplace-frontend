import { ShieldCheck } from 'lucide-react';

const EscrowBanner = () => (
  <div className="escrow-banner">
    <div className="escrow-banner-icon">
      <ShieldCheck size={22} aria-hidden="true" />
    </div>
    <div>
      <h3>Secure Student-to-Student Escrow</h3>
      <p>Pay safely. Get your item. Release funds only when satisfied.</p>
    </div>
  </div>
);

export default EscrowBanner;
