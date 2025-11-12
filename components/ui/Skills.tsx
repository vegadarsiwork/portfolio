export default function Skills() {
  const rows = [
    ['HTML / CSS', 92],
    ['JavaScript', 84],
    ['React', 80],
    ['Node / Backend', 64],
  ];
  return (
    <section id="skills" className="py-12 bg-black">
      <div className="container mx-auto px-4">
        <h2 className="font-monoHead text-2xl mb-4">skills</h2>
        <div className="space-y-3 max-w-2xl">
          {rows.map(([name, pct]) => (
            <div key={name as string} className="flex items-center gap-4">
              <div className="w-40 font-monoHead text-sm">{name}</div>
              <div className="flex-1 bg-white/5 h-3 rounded overflow-hidden">
                <div style={{width: `${pct}%`}} className="h-full bg-gradient-to-r from-accent-1 to-accent-2"></div>
              </div>
              <div className="w-12 text-right text-sm text-gray-300">{pct}%</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
