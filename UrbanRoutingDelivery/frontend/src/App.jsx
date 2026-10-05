import { useState } from 'react';

const API_BASE_URL = 'http://localhost:3000/api/route';

const MALHA_URBANA = [
  'Centro de Distribuicao',
  'Asa Norte',
  'Asa Sul',
  'Lago Norte',
  'Lago Sul',
  'Sudoeste',
  'Taguatinga',
  'Ceilandia',
  'Samambaia',
  'Jardim Botanico',
  'Sobradinho',
  'Deposito Isolado',
];

const COORDENADAS = {
  'Sobradinho': { x: 57, y: 9 },
  'Lago Norte': { x: 63, y: 25 },
  'Asa Norte': { x: 51, y: 35 },
  'Centro de Distribuicao': { x: 44, y: 47 },
  'Sudoeste': { x: 34, y: 51 },
  'Asa Sul': { x: 53, y: 59 },
  'Lago Sul': { x: 67, y: 67 },
  'Jardim Botanico': { x: 78, y: 80 },
  'Taguatinga': { x: 25, y: 65 },
  'Ceilandia': { x: 13, y: 74 },
  'Samambaia': { x: 20, y: 89 },
  'Deposito Isolado': { x: 87, y: 13 },
};

export default function App() {
  const [source, setSource] = useState('');
  const [target, setTarget] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('route');
  const [scheduleData, setScheduleData] = useState(null);

  const isSubmitDisabled = loading || source.trim() === '' || target.trim() === '';

  async function fetchSchedule() {
    try {
      const response = await fetch('http://localhost:3000/api/schedule');
      const data = await response.json();
      setScheduleData(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setResult(null);
    setError('');
    setLoading(true);

    try {
      const query = new URLSearchParams({ source: source.trim(), target: target.trim() });
      const response = await fetch(`${API_BASE_URL}?${query.toString()}`);
      const data = await response.json();

      if (!response.ok || data.status === 'error') {
        setError(data.message || data.error || 'Não foi possível calcular a rota solicitada.');
        return;
      }

      setResult(data);
    } catch (requestError) {
      setError('Não foi possível contatar o serviço de roteamento.');
    } finally {
      setLoading(false);
    }
  }

  const rota =
    result === null
      ? []
      : result.path
          .map((nome) => ({ nome, ponto: COORDENADAS[nome] }))
          .filter((parada) => parada.ponto !== undefined);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 lg:flex">
      <aside className="border-b border-slate-800 bg-slate-900 px-6 py-8 lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:shrink-0 lg:overflow-y-auto lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-300">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
              <path
                d="M12 21s7-5.9 7-11a7 7 0 1 0-14 0c0 5.1 7 11 7 11Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="10" r="2.4" fill="currentColor" />
            </svg>
          </span>
          <div>
            <p className="text-sm font-semibold tracking-tight text-white">Roteamento</p>
            <p className="text-xs text-slate-400">Painel logístico</p>
          </div>
        </div>

        <p className="mt-8 text-xs font-semibold uppercase tracking-widest text-slate-500">
          Malha Urbana
        </p>

        <ul className="mt-4 space-y-3 border-l border-slate-800 pl-5">
          {MALHA_URBANA.map((location) => (
            <li key={location} className="relative flex items-center gap-3 text-sm text-slate-300">
              <span className="absolute -left-[23px] h-2 w-2 rounded-full bg-indigo-400 ring-4 ring-slate-900" />
              {location}
            </li>
          ))}
        </ul>

        <p className="mt-8 text-xs leading-relaxed text-slate-500">
          {MALHA_URBANA.length} pontos cadastrados na malha.
        </p>
      </aside>

      <main className="flex-1 px-6 py-10">
        <div className="mx-auto max-w-3xl">
          <header>
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              Sistema de Roteamento Logístico
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Consulte o trajeto de menor distância ou a agenda de entregas.
            </p>
          </header>

          <div className="mt-6 flex gap-4">
            <button
              onClick={() => setMode('route')}
              className={`rounded-md px-4 py-2 text-sm font-medium transition ${mode === 'route' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            >
              Mapa de Rotas
            </button>
            <button
              onClick={() => { setMode('schedule'); fetchSchedule(); }}
              className={`rounded-md px-4 py-2 text-sm font-medium transition ${mode === 'schedule' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            >
              Agenda do Entregador
            </button>
          </div>

          {mode === 'route' && (
            <>
              <form
                onSubmit={handleSubmit}
                className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-lg shadow-slate-950/50"
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="source" className="block text-sm font-medium text-slate-300">
                      Origem
                    </label>
                    <input
                      id="source"
                      type="text"
                      value={source}
                      onChange={(event) => setSource(event.target.value)}
                      placeholder="Centro de Distribuicao"
                      className="mt-2 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                    />
                  </div>

                  <div>
                    <label htmlFor="target" className="block text-sm font-medium text-slate-300">
                      Destino
                    </label>
                    <input
                      id="target"
                      type="text"
                      value={target}
                      onChange={(event) => setTarget(event.target.value)}
                      placeholder="Samambaia"
                      className="mt-2 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitDisabled}
                  className="mt-6 rounded-md bg-indigo-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-500"
                >
                  {loading ? 'Calculando...' : 'Calcular Rota'}
                </button>
              </form>

              {error !== '' && (
                <div className="mt-6 rounded-xl border border-red-900/60 bg-red-950/40 p-4">
                  <p className="text-sm font-medium text-red-200">Não foi possível traçar a rota</p>
                  <p className="mt-1 text-sm text-red-300">{error}</p>
                </div>
              )}

              {result !== null && (
                <section className="mt-6 overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-lg shadow-slate-950/50">
                  <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-800 bg-slate-900/60 px-6 py-5">
                    <div>
                      <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                        Rota Encontrada
                      </h2>
                      <p className="mt-1 text-sm text-slate-300">
                        {result.path.length} parada{result.path.length === 1 ? '' : 's'} no trajeto
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                        Distância total
                      </p>
                      <p className="mt-1 text-4xl font-semibold leading-none text-white">
                        {Number(result.distance).toFixed(1)}
                        <span className="ml-1.5 text-base font-medium text-indigo-300">km</span>
                      </p>
                    </div>
                  </div>

                  <div className="px-4 py-4">
                    <div className="aspect-square w-full rounded-lg border border-slate-800 bg-slate-950">
                      <svg viewBox="0 0 100 100" className="h-full w-full" role="img">
                        <g>
                          {MALHA_URBANA.map((nome) => (
                            <g key={nome}>
                              <circle
                                cx={COORDENADAS[nome].x}
                                cy={COORDENADAS[nome].y}
                                r="1.5"
                                fill="#334155"
                              />
                              {!result.path.includes(nome) && (
                                <text
                                  x={COORDENADAS[nome].x}
                                  y={COORDENADAS[nome].y + 4.2}
                                  textAnchor="middle"
                                  fontSize="2.3"
                                  fill="#64748b"
                                >
                                  {nome}
                                </text>
                              )}
                            </g>
                          ))}
                        </g>

                        <g stroke="#6366f1" strokeWidth="1.1" strokeLinecap="round">
                          {rota.slice(1).map((parada, index) => (
                            <line
                              key={`${rota[index].nome}-${parada.nome}`}
                              x1={rota[index].ponto.x}
                              y1={rota[index].ponto.y}
                              x2={parada.ponto.x}
                              y2={parada.ponto.y}
                            />
                          ))}
                        </g>

                        <g>
                          {rota.map((parada, index) => (
                            <g key={`${parada.nome}-${index}`}>
                              <circle
                                cx={parada.ponto.x}
                                cy={parada.ponto.y}
                                r="2.6"
                                fill="#818cf8"
                                stroke="#0f172a"
                                strokeWidth="0.8"
                              />
                              <text
                                x={parada.ponto.x}
                                y={parada.ponto.y + 5.4}
                                textAnchor="middle"
                                fontSize="2.6"
                                fontWeight="600"
                                fill="#e2e8f0"
                              >
                                {parada.nome}
                              </text>
                            </g>
                          ))}
                        </g>
                      </svg>
                    </div>
                  </div>
                </section>
              )}
            </>
          )}

          {mode === 'schedule' && (
            <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-lg shadow-slate-950/50">
              <h2 className="text-lg font-medium text-white">Agenda Ótima de Entregas</h2>
              {scheduleData ? (
                <div className="mt-6">
                  <p className="text-sm text-slate-300">
                    Total Agendado: <span className="font-semibold text-indigo-400">{scheduleData.totalScheduled}</span>
                  </p>

                  <div className="mt-6 grid gap-8 sm:grid-cols-2">
                    <div>
                      <h3 className="text-sm font-medium text-emerald-400">Tarefas Aceitas</h3>
                      <ul className="mt-4 space-y-3">
                        {scheduleData.selectedTasks?.map((task, index) => (
                          <li key={index} className="text-sm text-slate-300">
                            <span className="font-semibold text-slate-100">{task.id}</span> - {task.destination}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-rose-400">Tarefas Rejeitadas</h3>
                      <ul className="mt-4 space-y-3">
                        {scheduleData.rejectedTasks?.map((task, index) => (
                          <li key={index} className="text-sm text-slate-300">
                            <span className="font-semibold text-slate-100">{task.id}</span> - {task.destination}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-500">Carregando dados da agenda...</p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}