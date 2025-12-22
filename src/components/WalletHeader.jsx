/**
 * WalletHeader - displays wallet address and classification badge
 *
 * Props:
 *   address: string
 *   chainName: string
 *   classificationType: string
 */

import ClassificationBadge from './ClassificationBadge';

// Helper to shorten addresses
const shortAddr = (addr) => {
  if (!addr) return 'Unknown';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
};

function WalletHeader({ address, chainName, classificationType }) {
  return (
    <div className='p-4 bg-gray-800 rounded'>
      <div className='flex items-center justify-between'>
        <div>
          <p className='text-gray-400 text-sm'>Address on {chainName}</p>
          <p className='font-mono'>{shortAddr(address)}</p>
        </div>
        <ClassificationBadge type={classificationType} />
      </div>
    </div>
  );
}

export default WalletHeader;
