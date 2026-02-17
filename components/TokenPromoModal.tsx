import React, { useState } from 'react';
import { X, ExternalLink, ShieldCheck, Zap, BarChart3, Key, Eye, EyeOff } from 'lucide-react';

interface TokenPromoModalProps {
  isOpen: boolean;
  onClose: (hideFuture: boolean) => void;
  onSave: (key: string) => void;
}

export const TokenPromoModal: React.FC<TokenPromoModalProps> = ({ isOpen, onClose, onSave }) => {
  const [keyInput, setKeyInput] = useState('');
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [showToken, setShowToken] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    if (keyInput.trim()) {
      onSave(keyInput.trim());
    }
  };

  const handleClose = () => {
    onClose(dontShowAgain);
  };

  return (
    <div className="relative z-50" aria-labelledby="promo-modal-title" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm transition-opacity animate-in fade-in duration-300" 
        onClick={handleClose}
      />

      <div className="fixed inset-0 z-10 overflow-y-auto pointer-events-none">
        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
          
          {/* Modal Panel */}
          <div 
            className="pointer-events-auto relative transform overflow-hidden bg-white rounded-3xl shadow-2xl text-left transition-all sm:my-8 w-full max-w-md animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-20"
            >
              <X size={20} />
            </button>

            {/* Content */}
            <div className="p-8 pt-10">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 text-apple-blue shadow-sm">
                   <ShieldCheck size={32} />
                </div>
                <h3 className="text-xl font-semibold text-apple-text mb-2">
                  Unlock the Full Experience
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
                  Add your free GitHub Token to access <b>accurate contribution data</b> (green squares) and <b>bypass rate limits</b>.
                </p>
              </div>

              {/* Feature List */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-3">
                 <div className="flex items-center gap-3 text-sm text-gray-600">
                    <BarChart3 size={16} className="text-green-600" />
                    <span>See real contribution calendar stats</span>
                 </div>
                 <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Zap size={16} className="text-orange-500" />
                    <span>Increase limits: 60 &rarr; 5,000 req/hr</span>
                 </div>
              </div>

              {/* Input Area */}
              <div className="space-y-4">
                 <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <Key size={16} className="text-gray-400" />
                   </div>
                   <input 
                      type={showToken ? "text" : "password"}
                      placeholder="Paste your GitHub token..." 
                      value={keyInput}
                      onChange={(e) => setKeyInput(e.target.value)}
                      className="block w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-apple-blue focus:ring-1 focus:ring-apple-blue transition-all"
                   />
                   <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                   >
                     {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
                   </button>
                 </div>

                 <button 
                   onClick={handleSave}
                   className="w-full bg-apple-blue hover:bg-apple-blueHover text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98]"
                 >
                   Save Token & Continue
                 </button>
                 
                 <div className="text-center">
                    <a 
                      href="https://github.com/settings/tokens" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-apple-blue transition-colors font-medium"
                    >
                      Don't have one? Generate here <ExternalLink size={10} />
                    </a>
                 </div>
              </div>
            </div>
            
            {/* Footer / Don't show again */}
            <div className="bg-gray-50 px-8 py-4 flex items-center justify-center border-t border-gray-100">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-apple-blue focus:ring-apple-blue cursor-pointer"
                />
                <span className="text-xs text-gray-500 group-hover:text-gray-700 select-none">
                  Don't show again for today
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};