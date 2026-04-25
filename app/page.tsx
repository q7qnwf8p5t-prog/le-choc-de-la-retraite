import Calculator from '@/components/Calculator';

const STATS = [
  { value: '-42%', label: 'Chute moyenne du niveau de vie à la retraite', source: 'COR 2023' },
  { value: '1 400€', label: 'Pension moyenne nette en France', source: 'CNAV 2024' },
  { value: '7 à 10 ans', label: 'Durée sans cotisation pour 1 cadre sur 3', source: 'INSEE' },
];

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Noise texture overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.025]"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
          backgroundRepeat: 'repeat',
        }}
      />

      <div className="relative z-10">
        {/* Hero */}
        <section className="px-6 pt-20 pb-16 text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-8 uppercase tracking-widest"
            style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            Données officielles CNAV · COR 2024
          </div>

          <h1 className="text-5xl md:text-7xl font-black leading-none tracking-tight mb-6">
            Votre retraite{' '}
            <br />
            <span className="text-gradient">va vous choquer.</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            En France, plus d’un retraité sur deux subit une chute de revenus de{' '}
            <strong className="text-slate-200">plus de 30%</strong> dès le premier mois.
            Calculez votre choc maintenant.
          </p>

          {/* Stats row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
            {STATS.map((s) => (
              <div key={s.value} className="card p-5">
                <p className="text-3xl font-black text-gradient mb-1">{s.value}</p>
                <p className="text-sm text-slate-400 leading-snug">{s.label}</p>
                <p className="text-xs text-slate-600 mt-2">Source : {s.source}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Calculator */}
        <section className="px-4 md:px-8 pb-20 max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Votre simulateur personnel
            </h2>
            <p className="text-slate-500 mt-2">
              Ajustez les paramètres — les résultats se recalculent en temps réel.
            </p>
          </div>
          <Calculator />
        </section>

        {/* Footer */}
        <footer className="border-t border-white/5 px-6 py-8 text-center">
          <p className="text-xs text-slate-600">
            Calcul basé sur le régime général (CNAV). Règles 2024 : 172 trimestres requis,
            taux plein 50%, décote 1,25%/trimestre manquant. Source : COR rapport annuel 2023.
            Ce simulateur est indicatif et ne se substitue pas à un bilan retraite officiel.
          </p>
        </footer>
      </div>
    </main>
  );
}
