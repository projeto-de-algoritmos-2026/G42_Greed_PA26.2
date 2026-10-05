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

function formatarHorario(minutos) {
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  return `${String(horas).padStart(2, '0')}:${String(resto).padStart(2, '0')}`;
}

function converterParaMinutos(horario) {
  const [horas, minutos] = horario.split(':').map(Number);
  return horas * 60 + minutos;
}

export default function App() {
  const [source, setSource] = useState('');
  const [target, setTarget] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('route');
  const [scheduleData, setScheduleData] = useState(null);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [customTasks, setCustomTasks] = useState([]);
  const [taskId, setTaskId] = useState('');
  const [taskDestination, setTaskDestination] = useState('');
  const [taskStart, setTaskStart] = useState('');
  const [taskEnd, setTaskEnd] = useState('');
  const [taskError, setTaskError] = useState('');

  const isSubmitDisabled = loading || source.trim() === '' || target.trim() === '';

  async function fetchSchedule() {
    setScheduleLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks: customTasks }),
      });
      const data = await response.json();

      if (!response.ok || data.status === 'error') {
        setScheduleData({ error: data.error || data.message || 'Não foi possível calcular a agenda.' });
        return;
      }

      setScheduleData(data);
    } catch (err) {
      setScheduleData({ error: 'Não foi possível contatar o serviço de agendamento.' });
    } finally {
      setScheduleLoading(false);
    }
  }

  function handleAddTask(event) {
    event.preventDefault();

    const id = taskId.trim();
    const destination = taskDestination.trim();

    if (id === '' || destination === '' || taskStart === '' || taskEnd === '') {
      setTaskError('Preencha todos os campos da entrega.');
      return;
    }

    const startTime = converterParaMinutos(taskStart);
    const endTime = converterParaMinutos(taskEnd);

    if (endTime <= startTime) {
      setTaskError('O horário de fim deve ser posterior ao de início.');
      return;
    }

    if (customTasks.some((task) => task.id === id)) {
      setTaskError(`Já existe uma entrega com o ID ${id}.`);
      return;
    }

    setCustomTasks([...customTasks, { id, destination, startTime, endTime }]);
    setTaskId('');
    setTaskDestination('');
    setTaskStart('');
    setTaskEnd('');
    setTaskError('');
  }

  function handleRemoveTask(id) {
    setCustomTasks(customTasks.filter((task) => task.id !== id));
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

  const tarefasAgendadas = scheduleData?.scheduled ?? [];
  const tarefasRejeitadas = scheduleData?.rejected ?? [];
  const todasTarefas = [...tarefasAgendadas, ...tarefasRejeitadas];
  const tarefasNaLinhaDoTempo = [
    ...tarefasAgendadas.map((task) => ({ ...task, status: 'scheduled' })),
    ...tarefasRejeitadas.map((task) => ({ ...task, status: 'rejected' })),
  ].sort((a, b) => a.startTime - b.startTime || a.endTime - b.endTime);
  const minutosOcupados = tarefasAgendadas.reduce((total, task) => total + task.endTime - task.startTime, 0);
  const inicioJanela =
    todasTarefas.length === 0 ? 0 : Math.floor(Math.min(...todasTarefas.map((task) => task.startTime)) / 60) * 60;
  const fimJanela =
    todasTarefas.length === 0 ? 60 : Math.ceil(Math.max(...todasTarefas.map((task) => task.endTime)) / 60) * 60;
  const duracaoJanela = Math.max(fimJanela - inicioJanela, 60);
  const marcasHorario = Array.from(
    { length: Math.floor(duracaoJanela / 60) + 1 },
    (_, indice) => inicioJanela + indice * 60,
  );

  function posicaoNaJanela(minuto) {
    return ((minuto - inicioJanela) / duracaoJanela) * 100;
  }

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
            <div className="mt-8 space-y-6">
              <form
                onSubmit={handleAddTask}
                className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-lg shadow-slate-950/50"
              >
                <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                  Nova Entrega
                </h2>

                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label htmlFor="task-id" className="block text-sm font-medium text-slate-300">
                      ID
                    </label>
                    <input
                      id="task-id"
                      type="text"
                      value={taskId}
                      onChange={(event) => setTaskId(event.target.value)}
                      placeholder="T1"
                      className="mt-2 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                    />
                  </div>

                  <div>
                    <label htmlFor="task-destination" className="block text-sm font-medium text-slate-300">
                      Destino
                    </label>
                    <input
                      id="task-destination"
                      type="text"
                      list="destinos-malha"
                      value={taskDestination}
                      onChange={(event) => setTaskDestination(event.target.value)}
                      placeholder="Asa Sul"
                      className="mt-2 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                    />
                    <datalist id="destinos-malha">
                      {MALHA_URBANA.map((location) => (
                        <option key={location} value={location} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label htmlFor="task-start" className="block text-sm font-medium text-slate-300">
                      Hora Início
                    </label>
                    <input
                      id="task-start"
                      type="time"
                      value={taskStart}
                      onChange={(event) => setTaskStart(event.target.value)}
                      className="mt-2 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 outline-none transition [color-scheme:dark] focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                    />
                  </div>

                  <div>
                    <label htmlFor="task-end" className="block text-sm font-medium text-slate-300">
                      Hora Fim
                    </label>
                    <input
                      id="task-end"
                      type="time"
                      value={taskEnd}
                      onChange={(event) => setTaskEnd(event.target.value)}
                      className="mt-2 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 outline-none transition [color-scheme:dark] focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                    />
                  </div>
                </div>

                {taskError !== '' && <p className="mt-4 text-sm text-rose-300">{taskError}</p>}

                <button
                  type="submit"
                  className="mt-5 rounded-md bg-slate-800 px-5 py-2.5 text-sm font-medium text-slate-100 transition hover:bg-slate-700"
                >
                  Adicionar à Lista
                </button>

                <div className="mt-6 border-t border-slate-800 pt-5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                      Pendentes para cálculo
                    </p>
                    <span className="text-xs text-slate-500">{customTasks.length}</span>
                  </div>

                  {customTasks.length === 0 ? (
                    <p className="mt-3 text-sm text-slate-500">
                      Nenhuma entrega adicionada. O cálculo usará a agenda padrão.
                    </p>
                  ) : (
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {customTasks.map((task) => (
                        <li
                          key={task.id}
                          className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800 py-1 pl-3 pr-1 text-xs text-slate-300"
                        >
                          <span className="font-semibold text-indigo-300">{task.id}</span>
                          <span>{task.destination}</span>
                          <span className="tabular-nums text-slate-500">
                            {formatarHorario(task.startTime)}–{formatarHorario(task.endTime)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTask(task.id)}
                            aria-label={`Remover ${task.id}`}
                            className="flex h-5 w-5 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-700 hover:text-slate-200"
                          >
                            ×
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <button
                  type="button"
                  onClick={fetchSchedule}
                  disabled={scheduleLoading}
                  className="mt-6 rounded-md bg-indigo-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-500"
                >
                  {scheduleLoading ? 'Calculando...' : 'Calcular Agenda Ótima'}
                </button>
              </form>

              {scheduleData === null && (
                <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
                  <p className="text-sm text-slate-500">Carregando dados da agenda...</p>
                </div>
              )}

              {scheduleData !== null && scheduleData.error && (
                <div className="rounded-xl border border-red-900/60 bg-red-950/40 p-4">
                  <p className="text-sm font-medium text-red-200">Não foi possível carregar a agenda</p>
                  <p className="mt-1 text-sm text-red-300">{scheduleData.error}</p>
                </div>
              )}

              {scheduleData !== null && !scheduleData.error && (
                <>
                  <section className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-lg shadow-slate-950/50">
                    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-800 px-6 py-5">
                      <div>
                        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                          Agenda Ótima de Entregas
                        </h2>
                        <p className="mt-1 text-sm text-slate-300">
                          Seleção gulosa por menor horário de término
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                          Entregas otimizadas
                        </p>
                        <p className="mt-1 text-4xl font-semibold leading-none text-white">
                          {scheduleData.total_scheduled ?? tarefasAgendadas.length}
                          <span className="ml-1.5 text-base font-medium text-indigo-300">
                            de {todasTarefas.length}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 divide-x divide-slate-800 border-b border-slate-800">
                      <div className="px-6 py-4">
                        <p className="text-xs text-slate-500">Agendadas</p>
                        <p className="mt-1 text-lg font-semibold text-emerald-400">{tarefasAgendadas.length}</p>
                      </div>
                      <div className="px-6 py-4">
                        <p className="text-xs text-slate-500">Com conflito</p>
                        <p className="mt-1 text-lg font-semibold text-rose-400">{tarefasRejeitadas.length}</p>
                      </div>
                      <div className="px-6 py-4">
                        <p className="text-xs text-slate-500">Tempo em rota</p>
                        <p className="mt-1 text-lg font-semibold text-slate-100">{minutosOcupados} min</p>
                      </div>
                    </div>

                    {todasTarefas.length > 0 && (
                      <div className="px-6 py-5">
                        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                          Linha do tempo
                        </p>

                        <div className="mt-4 flex">
                          <div className="w-16 shrink-0" />
                          <div className="relative h-5 flex-1">
                            {marcasHorario.map((minuto) => (
                              <span
                                key={minuto}
                                className="absolute -translate-x-1/2 text-[10px] tabular-nums text-slate-500"
                                style={{ left: `${posicaoNaJanela(minuto)}%` }}
                              >
                                {formatarHorario(minuto)}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="mt-1 space-y-2">
                          {tarefasNaLinhaDoTempo.map((task) => (
                            <div key={`${task.status}-${task.id}`} className="flex items-center">
                              <span
                                className={`w-16 shrink-0 truncate pr-2 text-xs font-medium ${task.status === 'scheduled' ? 'text-slate-200' : 'text-slate-500'}`}
                              >
                                {task.id}
                              </span>
                              <div className="relative h-7 flex-1 rounded bg-slate-950">
                                {marcasHorario.map((minuto) => (
                                  <span
                                    key={minuto}
                                    className="absolute inset-y-0 w-px bg-slate-800"
                                    style={{ left: `${posicaoNaJanela(minuto)}%` }}
                                  />
                                ))}
                                <div
                                  title={`${task.destination} · ${formatarHorario(task.startTime)} – ${formatarHorario(task.endTime)}`}
                                  className={`absolute inset-y-1 flex items-center overflow-hidden rounded px-2 text-[11px] font-medium ${
                                    task.status === 'scheduled'
                                      ? 'bg-indigo-500 text-white'
                                      : 'border border-dashed border-rose-500/70 bg-rose-500/10 text-rose-300'
                                  }`}
                                  style={{
                                    left: `${posicaoNaJanela(task.startTime)}%`,
                                    width: `${posicaoNaJanela(task.endTime) - posicaoNaJanela(task.startTime)}%`,
                                  }}
                                >
                                  <span className="truncate">{task.destination}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="mt-4 flex flex-wrap gap-5 text-xs text-slate-400">
                          <span className="flex items-center gap-2">
                            <span className="h-2.5 w-4 rounded-sm bg-indigo-500" />
                            Agendada
                          </span>
                          <span className="flex items-center gap-2">
                            <span className="h-2.5 w-4 rounded-sm border border-dashed border-rose-500/70 bg-rose-500/10" />
                            Rejeitada por sobreposição
                          </span>
                        </div>
                      </div>
                    )}
                  </section>

                  <div className="grid gap-6 md:grid-cols-2">
                    <section>
                      <div className="flex items-center justify-between">
                        <h3 className="flex items-center gap-2 text-sm font-semibold text-emerald-400">
                          <span className="h-2 w-2 rounded-full bg-emerald-400" />
                          Entregas Agendadas
                        </h3>
                        <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
                          {tarefasAgendadas.length}
                        </span>
                      </div>

                      <ul className="mt-4 space-y-3">
                        {tarefasAgendadas.map((task) => (
                          <li
                            key={task.id}
                            className="rounded-lg border border-slate-800 border-l-4 border-l-emerald-500 bg-slate-900 p-4"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-300">{task.id}</p>
                                <p className="mt-1 truncate text-sm font-medium text-slate-100">{task.destination}</p>
                              </div>
                              <span className="shrink-0 rounded-md bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-300">
                                {task.endTime - task.startTime} min
                              </span>
                            </div>
                            <p className="mt-3 text-sm tabular-nums text-slate-300">
                              {formatarHorario(task.startTime)}
                              <span className="mx-2 text-slate-600">→</span>
                              {formatarHorario(task.endTime)}
                            </p>
                          </li>
                        ))}
                        {tarefasAgendadas.length === 0 && (
                          <li className="rounded-lg border border-dashed border-slate-800 p-4 text-sm text-slate-500">
                            Nenhuma entrega agendada.
                          </li>
                        )}
                      </ul>
                    </section>

                    <section>
                      <div className="flex items-center justify-between">
                        <h3 className="flex items-center gap-2 text-sm font-semibold text-rose-400">
                          <span className="h-2 w-2 rounded-full bg-rose-400" />
                          Entregas com Conflito
                        </h3>
                        <span className="rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-medium text-rose-300">
                          {tarefasRejeitadas.length}
                        </span>
                      </div>

                      <ul className="mt-4 space-y-3">
                        {tarefasRejeitadas.map((task) => (
                          <li
                            key={task.id}
                            className="rounded-lg border border-slate-800 border-l-4 border-l-rose-500/70 bg-slate-900/60 p-4"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{task.id}</p>
                                <p className="mt-1 truncate text-sm font-medium text-slate-400 line-through decoration-rose-500/60">
                                  {task.destination}
                                </p>
                              </div>
                              <span className="shrink-0 rounded-md bg-slate-800 px-2 py-1 text-xs font-medium text-slate-400">
                                {task.endTime - task.startTime} min
                              </span>
                            </div>
                            <p className="mt-3 text-sm tabular-nums text-slate-500">
                              {formatarHorario(task.startTime)}
                              <span className="mx-2 text-slate-700">→</span>
                              {formatarHorario(task.endTime)}
                            </p>
                            <p className="mt-2 text-xs text-rose-300/80">Sobrepõe uma entrega já agendada</p>
                          </li>
                        ))}
                        {tarefasRejeitadas.length === 0 && (
                          <li className="rounded-lg border border-dashed border-slate-800 p-4 text-sm text-slate-500">
                            Nenhum conflito de horário.
                          </li>
                        )}
                      </ul>
                    </section>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}