/** ClassificationBadge - displays wallet classification with color coding
 * 
 *  props:
 *      type: stromg - classification type (Whale, Bot, Suspicious, etc.)
 */

const BADGE_COLORS = {
    'Whale': 'bg-purple-600',
    'Suspicious': 'bg-red-600',
    'Exchange Wallet': 'bg-blue-600',
    'Fresh Wallet': 'bg-green-600',
    'Bot': 'bg-orange-600',
    'Unclassified': 'bg-gray-600',
};

function ClassificationBadge({ type }) {
    const colorClass = BADGE_COLORS[type] || 'bg-gray-600';

    return (
        <span className={'px-3 py-1 rounded text-sm font-medium ${colorClass'}>
            {type}
        </span>
    );
}

export default ClassificationBadge;