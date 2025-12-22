/**
 * RiskIndicators - displays risk flags (mixer interaction, etc.)
 *
 * Props:
 *   isSuspicious: boolean - whether wallet has mixer interactions
 */

function RiskIndicators({ isSuspicious }) {
  return (
    <div className='p-4 bg-gray-800 rounded'>
      <h2 className='text-lg font-semibold mb-3'>Risk Indicators</h2>
      <div className='flex items-center gap-2'>
        <span className='text-gray-400'>Mixer Interaction:</span>
        {isSuspicious ? (
          <span className='text-red-500 font-medium'>⚠️ Detected</span>
        ) : (
          <span className='text-green-500 font-medium'>✓ None</span>
        )}
      </div>
    </div>
  );
}

export default RiskIndicators;
