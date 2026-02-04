function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex w-full max-w-5xl flex-col px-6 py-12">
        <span className="inline-flex w-fit items-center rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
          Tailwind Ready
        </span>
        <h1 className="mt-6 text-3xl font-semibold text-slate-900">
          Gantt Chart Proof of Concept
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Phase 1 scaffolding is complete. Next up: implement the date helpers
          and build the static week grid.
        </p>
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-medium text-slate-700">Status</div>
          <div className="mt-2 text-sm text-slate-500">
            Waiting on Phase 2 to begin.
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
