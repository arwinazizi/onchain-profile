/**
 * ChainSelector - toggle buttons for selecting blockchain
 *
 * Props:
 *   chains: object - chain config { ethereum: { name, color }, solana: {...} }
 *   selectedChain: string - current chain key
 *   onSelect: function - callback when chain is selected
 */

function ChainSelector({ chains, selectedChain, onSelect }) {
  return (
    <div className='mt-6 flex justify-center gap-2'>
      {Object.entries(chains).map(([key, chainInfo]) => (
        <button
          key={key}
          onClick={() => onSelect(key)}
          className={`px-4 py-2 rounded font-medium transition ${
            selectedChain === key
              ? `${chainInfo.color} text-white`
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          {chainInfo.name}
        </button>
      ))}
    </div>
  );
}

export default ChainSelector;
