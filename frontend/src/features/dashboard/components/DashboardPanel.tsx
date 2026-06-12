import { StatusBadge } from '../../../components/status/StatusBadge';

const cards = [
  { title: 'Jobs awaiting approval', value: '3', status: 'ACTION' },
  { title: 'Vehicles ready for collection', value: '2', status: 'READY' },
  { title: 'Parts waiting', value: '4', status: 'BLOCKED' },
];

export function DashboardPanel() {
  return (
    {/*Swapped the inline class to Tailwind*/}
      <div className="grid grid-cols-3 gap-4">
      {cards.map((card) => (
        {/* The div below uses an inline css instaed of Tailwind.*/}
        <div key={card.title} style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong>{card.title}</strong>
            <StatusBadge value={card.status} />
          </div>
          <div style={{ fontSize: 28, marginTop: 12 }}>{card.value}</div>
        </div>
      ))}
    </div>
  );
}
