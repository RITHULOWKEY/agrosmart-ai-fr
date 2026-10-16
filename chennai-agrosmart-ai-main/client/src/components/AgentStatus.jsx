import React from 'react';
import { CheckCircle2, Loader2, Circle, AlertCircle, Sprout, CloudSun, Layers, TrendingUp } from 'lucide-react';

const AgentStatus = ({ step = 0, isComplete = false, error = null }) => {
  const agents = [
    {
      id: 'crop',
      name: 'Crop Intelligence Agent',
      shortName: 'Crop Agent',
      icon: Sprout,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      activeText: 'Analyzing leaf foliage & botanical symptoms...',
      doneText: 'Crop health & disease scan complete',
      progress: step >= 1 ? 100 : 75,
    },
    {
      id: 'weather',
      name: 'Weather Intelligence Agent',
      shortName: 'Weather Agent',
      icon: CloudSun,
      color: 'text-sky-600',
      bgColor: 'bg-sky-50',
      activeText: 'Fetching localized Chennai weather & humidity...',
      doneText: 'Micro-climate & irrigation risks analyzed',
      progress: step >= 2 ? 100 : step === 1 ? 85 : 30,
    },
    {
      id: 'soil',
      name: 'Soil Intelligence Agent',
      shortName: 'Soil Agent',
      icon: Layers,
      color: 'text-amber-700',
      bgColor: 'bg-amber-50',
      activeText: 'Evaluating soil type, moisture & nutrient balance...',
      doneText: 'Soil suitability & drainage assessed',
      progress: step >= 3 ? 100 : step === 2 ? 60 : 15,
    },
    {
      id: 'market',
      name: 'Market Intelligence Agent',
      shortName: 'Market Agent',
      icon: TrendingUp,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      activeText: 'Checking Koyambedu wholesale prices & demand trends...',
      doneText: 'Market selling opportunity computed',
      progress: step >= 4 || isComplete ? 100 : step === 3 ? 50 : 0,
    },
  ];

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-agro-100 shadow-premium space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-5">
        <div>
          <h3 className="text-xl font-bold text-agro-950 flex items-center gap-2">
            {isComplete ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            ) : (
              <Loader2 className="w-6 h-6 text-agro-600 animate-spin" />
            )}
            {isComplete ? 'All Intelligence Systems Complete' : 'Analyzing your farm...'}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {isComplete
              ? 'Multi-agent outputs combined by AgroSmart Decision Engine'
              : 'Our 4 specialized AI agents are processing farm parameters in parallel'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-agro-50 text-agro-800 border border-agro-200 font-semibold">
            {isComplete ? 'SYNTHESIS READY' : 'PIPELINE RUNNING'}
          </span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start space-x-3 text-red-800 text-sm">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Analysis encountered a notice:</p>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Agents Status Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {agents.map((ag, index) => {
          const Icon = ag.icon;
          const isDone = isComplete || step > index + 1;
          const isRunning = !isComplete && (step === index + 1 || (step === 0 && index === 0));
          const isWaiting = !isComplete && !isDone && !isRunning;

          return (
            <div
              key={ag.id}
              className={`p-4 rounded-2xl border transition-all duration-300 ${
                isDone
                  ? 'bg-agro-50/50 border-agro-200'
                  : isRunning
                  ? 'bg-white border-agro-400 shadow-soft ring-2 ring-agro-200/50'
                  : 'bg-gray-50/60 border-gray-200 opacity-75'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-xl ${ag.bgColor} flex items-center justify-center ${ag.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-agro-950">{ag.shortName}</h4>
                  </div>
                </div>

                <div className="flex items-center">
                  {isDone ? (
                    <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Complete
                    </span>
                  ) : isRunning ? (
                    <span className="flex items-center gap-1 text-xs font-semibold text-agro-800 bg-agro-100 px-2.5 py-0.5 rounded-full animate-pulse">
                      <Loader2 className="w-3 h-3 animate-spin" /> In Progress
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
                      <Circle className="w-3 h-3" /> Queued
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs text-gray-600 mb-3 pl-11">
                {isDone ? ag.doneText : isRunning ? ag.activeText : 'Waiting for pipeline turn'}
              </p>

              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    isDone ? 'bg-emerald-500' : isRunning ? 'bg-agro-600' : 'bg-gray-300'
                  }`}
                  style={{ width: `${isDone ? 100 : isRunning ? ag.progress : 10}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AgentStatus;
