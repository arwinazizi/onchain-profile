/**
 * ClassificationBadge - displays wallet classification with color coding
 *
 * Props:
 *   type: string - classification type (Whale, Bot, Suspicious, etc.)
 *
 * Tailwind safelist (ensures these classes are included in build):
 * bg-purple-600 bg-red-600 bg-blue-600 bg-green-600 bg-orange-600 bg-gray-600
 */

function ClassificationBadge({ type }) {
  const getColorClass = () => {
    switch (type) {
      case 'Whale':
        return 'bg-purple-600';
      case 'Suspicious':
        return 'bg-red-600';
      case 'Exchange Wallet':
        return 'bg-blue-600';
      case 'Fresh Wallet':
        return 'bg-green-600';
      case 'Bot':
        return 'bg-orange-600';
      default:
        return 'bg-gray-600';
    }
  };

  return (
    <span
      className={`px-3 py-1 rounded text-sm font-medium ${getColorClass()}`}
    >
      {type}
    </span>
  );
}

export default ClassificationBadge;
