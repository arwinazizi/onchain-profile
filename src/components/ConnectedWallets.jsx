/**
 * ConnectedWallets - displays top counterparties (sends to / receives from)
 *
 * Props:
 *   connections: { topSendsTo: [], topReceivesFrom: [] }
 */

// Helper to shorten addresses
const shortAddr = (addr) => {
  if (!addr) return 'Unknown';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
};

// Copy address to clipboard
const copyAddress = async (addr) => {
  try {
    await navigator.clipboard.writeText(addr);
  } catch (err) {
    console.error('Failed to copy:', err);
  }
};

function AddressList({ items, emptyMessage }) {
  if (items.length === 0) {
    return <p className='text-gray-500 text-sm'>{emptyMessage}</p>;
  }

  return (
    <ul className='space-y-1'>
      {items.map((item, i) => (
        <li
          key={i}
          className='flex justify-between items-center font-mono text-sm'
        >
          <button
            onClick={() => copyAddress(item.address)}
            className='hover:text-blue-400 cursor-pointer'
            title={item.address}
          >
            {shortAddr(item.address)} 📋
          </button>
          <span className='text-gray-400'>{item.count} tx</span>
        </li>
      ))}
    </ul>
  );
}

function ConnectedWallets({ connections }) {
  return (
    <div className='p-4 bg-gray-800 rounded'>
      <h2 className='text-lg font-semibold mb-3'>Connected Wallets</h2>
      <div className='grid grid-cols-2 gap-6'>
        <div>
          <p className='text-gray-400 text-sm mb-2'>Top Sends To</p>
          <AddressList
            items={connections.topSendsTo}
            emptyMessage='No outgoing transfers'
          />
        </div>
        <div>
          <p className='text-gray-400 text-sm mb-2'>Top Receives From</p>
          <AddressList
            items={connections.topReceivesFrom}
            emptyMessage='No incoming transfers'
          />
        </div>
      </div>
    </div>
  );
}

export default ConnectedWallets;
