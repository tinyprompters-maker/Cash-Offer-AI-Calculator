
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calculator, 
  Home, 
  Hammer, 
  Layers, 
  FileText, 
  Sparkles, 
  ArrowRight, 
  Printer,
  ChevronRight,
  Info,
  AlertCircle
} from 'lucide-react';
import { NumberInput } from './components/NumberInput';
import { DealDetails, CalculationResult, RehabScenario, AIAnalysis } from './types';
import { DEFAULT_REHAB_COSTS, DEFAULT_INVESTOR_MARGIN, DEFAULT_WHOLESALE_FEE } from './constants';
import { getAIAnalysis } from './services/geminiService';

const App: React.FC = () => {
  const [address, setAddress] = useState('');
  const [arv, setArv] = useState<number>(350000);
  const [sqft, setSqft] = useState<number>(1800);
  const [fee, setFee] = useState<number>(DEFAULT_WHOLESALE_FEE);
  const [margin, setMargin] = useState<number>(DEFAULT_INVESTOR_MARGIN);
  const [cosmeticCost, setCosmeticCost] = useState<number>(DEFAULT_REHAB_COSTS.COSMETIC);
  const [gutCost, setGutCost] = useState<number>(DEFAULT_REHAB_COSTS.FULL_GUT);
  
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const results: CalculationResult = useMemo(() => {
    const details: DealDetails = { address, arv, squareFootage: sqft, wholesaleFee: fee, investorMargin: margin };
    
    const calculateScenario = (type: 'Cosmetic' | 'Full Gut', costPerSq: number): RehabScenario => {
      const totalRehab = sqft * costPerSq;
      // Formula: (ARV * 0.70) - Rehab - Fee
      const maxOffer = (arv * margin) - totalRehab - fee;
      return {
        type,
        costPerSqFt: costPerSq,
        totalRehabCost: totalRehab,
        maxOffer: Math.max(0, maxOffer),
        description: type === 'Cosmetic' 
          ? 'Light renovation including paint, flooring, fixtures, and cleaning.' 
          : 'Extensive overhaul including electrical, plumbing, HVAC, and structural work.'
      };
    };

    return {
      details,
      scenarios: [
        calculateScenario('Cosmetic', cosmeticCost),
        calculateScenario('Full Gut', gutCost)
      ]
    };
  }, [address, arv, sqft, fee, margin, cosmeticCost, gutCost]);

  const handleGenerateAI = async () => {
    setLoadingAI(true);
    try {
      const analysis = await getAIAnalysis(results.details);
      setAiAnalysis(analysis);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAI(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12 print:bg-white print:p-0">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 print:hidden">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Calculator size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">Cash Offer <span className="text-blue-600">AI</span></h1>
          </div>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Printer size={18} />
            <span>Export PDF</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 print:block print:m-0">
        
        {/* Left Column: Inputs */}
        <section className="lg:col-span-4 space-y-6 print:hidden">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Home size={20} className="text-blue-500" />
              Property Details
            </h2>
            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">Property Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="123 Investment St, Austin, TX"
                />
              </div>
              <NumberInput label="ARV (After Repair Value)" value={arv} onChange={setArv} prefix="$" />
              <NumberInput label="Square Footage" value={sqft} onChange={setSqft} suffix="sqft" />
              <NumberInput label="Desired Wholesale Fee" value={fee} onChange={setFee} prefix="$" />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Layers size={20} className="text-indigo-500" />
              Strategy Configuration
            </h2>
            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700 flex justify-between">
                  <span>Investor Margin (Rule)</span>
                  <span className="text-blue-600 font-bold">{Math.round(margin * 100)}%</span>
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="0.85"
                  step="0.01"
                  value={margin}
                  onChange={(e) => setMargin(Number(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
              <NumberInput label="Cosmetic $/sqft" value={cosmeticCost} onChange={setCosmeticCost} prefix="$" />
              <NumberInput label="Full Gut $/sqft" value={gutCost} onChange={setGutCost} prefix="$" />
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-100 flex gap-3">
              <Info size={20} className="text-blue-500 shrink-0" />
              <p className="text-xs text-blue-700 leading-relaxed">
                Standard wholesalers use the 70% rule: <br/>
                <strong>(ARV × 0.70) - Rehab - Fee = MAO</strong>
              </p>
            </div>
          </div>
        </section>

        {/* Right Column: Results & AI */}
        <section className="lg:col-span-8 space-y-8 print:w-full">
          {/* Main Offers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {results.scenarios.map((scenario) => (
              <div 
                key={scenario.type}
                className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group transition-all hover:translate-y-[-4px]"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 opacity-5 translate-x-8 translate-y-[-8px] rotate-12 transition-transform group-hover:rotate-[20deg]`}>
                  {scenario.type === 'Cosmetic' ? <Sparkles size={120} /> : <Hammer size={120} />}
                </div>
                
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 ${
                  scenario.type === 'Cosmetic' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'
                }`}>
                  {scenario.type} Rehab
                </span>
                
                <h3 className="text-slate-500 text-sm font-medium mb-1 uppercase tracking-tight">Max Cash Offer</h3>
                <div className="text-4xl font-extrabold text-slate-900 mb-6 tabular-nums">
                  ${scenario.maxOffer.toLocaleString()}
                </div>

                <div className="space-y-3 pt-6 border-t border-slate-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-medium">Rehab Budget</span>
                    <span className="text-slate-900 font-bold">${scenario.totalRehabCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-medium">Est. Profit</span>
                    <span className="text-slate-900 font-bold">${Math.round(results.details.arv * (1 - results.details.investorMargin)).toLocaleString()}</span>
                  </div>
                </div>
                
                <p className="mt-6 text-sm text-slate-400 italic">
                  {scenario.description}
                </p>
              </div>
            ))}
          </div>

          {/* AI Insights Section */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Sparkles className="text-yellow-400" />
                    Investment Intelligence
                  </h2>
                  <p className="text-indigo-200/70 text-sm">Gemini AI analysis based on current property data</p>
                </div>
                {!aiAnalysis && (
                  <button 
                    onClick={handleGenerateAI}
                    disabled={loadingAI}
                    className="bg-white text-indigo-900 hover:bg-indigo-50 disabled:opacity-50 px-6 py-3 rounded-2xl font-bold transition-all shadow-xl shadow-indigo-950/20 flex items-center gap-2 shrink-0"
                  >
                    {loadingAI ? (
                      <div className="w-5 h-5 border-2 border-indigo-900/30 border-t-indigo-900 rounded-full animate-spin"></div>
                    ) : (
                      <Sparkles size={18} />
                    )}
                    {loadingAI ? 'Analyzing...' : 'Generate Analysis'}
                  </button>
                )}
              </div>

              {aiAnalysis ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-indigo-300 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                        <FileText size={14} /> Deal Summary
                      </h4>
                      <p className="text-indigo-50 leading-relaxed font-medium">
                        {aiAnalysis.summary}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-indigo-300 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                        <AlertCircle size={14} /> Market & Risk
                      </h4>
                      <div className="bg-white/10 p-4 rounded-2xl border border-white/10 space-y-3">
                        <p className="text-sm"><span className="text-indigo-300">Sentiment:</span> {aiAnalysis.marketSentiment}</p>
                        <p className="text-sm"><span className="text-indigo-300">Risk Level:</span> {aiAnalysis.riskAssessment}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-indigo-300 text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                      <ChevronRight size={14} /> Recommended Action Items
                    </h4>
                    <ul className="space-y-3">
                      {aiAnalysis.rehabTips.map((tip, idx) => (
                        <li key={idx} className="flex gap-3 text-sm bg-white/5 p-3 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                          <span className="text-yellow-400 font-bold">{idx + 1}</span>
                          <span className="text-indigo-100">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button 
                    onClick={() => setAiAnalysis(null)}
                    className="md:col-span-2 text-indigo-300/50 hover:text-indigo-300 text-xs font-medium self-center mt-4 transition-colors"
                  >
                    Regenerate Analysis
                  </button>
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-center opacity-40">
                  <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4">
                    <Calculator size={32} />
                  </div>
                  <p className="max-w-xs text-sm">Click generate to get an AI-powered summary and risk assessment for this deal.</p>
                </div>
              )}
            </div>
          </div>

          {/* Breakdown List */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm print:shadow-none">
            <h2 className="text-lg font-bold mb-6">Offer Breakdown</h2>
            <div className="space-y-2">
              <div className="flex justify-between py-3 border-b border-slate-50">
                <span className="text-slate-500">After Repair Value (ARV)</span>
                <span className="font-bold tabular-nums">${arv.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-slate-50">
                <span className="text-slate-500">Investor Margin ({Math.round(margin * 100)}% Rule)</span>
                <span className="font-bold text-slate-400 tabular-nums">-${Math.round(arv * (1 - margin)).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-slate-50">
                <span className="text-slate-500">Assignment / Wholesale Fee</span>
                <span className="font-bold text-slate-400 tabular-nums">-${fee.toLocaleString()}</span>
              </div>
              <div className="pt-6 mt-4 border-t-2 border-slate-100 flex justify-between items-baseline">
                <span className="text-slate-800 font-bold">Baseline for Offers</span>
                <span className="text-2xl font-black text-blue-600 tabular-nums">${(arv * margin - fee).toLocaleString()}</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-4 leading-normal">
                * Max offers are calculated by subtracting the total estimated rehab cost from the baseline above. 
                Always conduct a physical walk-through to confirm rehab estimates before signing a contract.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Floating Action Bar - Mobile */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-3rem)] max-w-sm print:hidden">
        <div className="bg-slate-900 rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-4">
          <div className="text-white">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Max Cosmetic Offer</p>
            <p className="text-xl font-black tabular-nums">${results.scenarios[0].maxOffer.toLocaleString()}</p>
          </div>
          <button 
            onClick={handlePrint}
            className="bg-blue-600 text-white px-4 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-500 active:scale-95 transition-all"
          >
            <Printer size={18} />
            <span>PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
