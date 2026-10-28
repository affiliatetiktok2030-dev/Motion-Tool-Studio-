import React from 'react';
import { AlertTriangle, X, RefreshCw } from 'lucide-react';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 shadow-2xl text-slate-100">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup Dialog"
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <h3 id="modal-title" className="text-lg font-bold text-white mb-2">
          Mulai Proyek Dokumenter Baru?
        </h3>
        <p className="text-sm text-slate-300 mb-6 leading-relaxed">
          Naskah narasi saat ini, hasil riset sumber web, audio voice-over, dan prompt video yang sudah dibuat akan diatur ulang. Pastikan Anda sudah mengunduh naskah atau prompt yang diperlukan.
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950/60 active:scale-95 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Mulai Ulang Proyek</span>
          </button>
        </div>
      </div>
    </div>
  );
};
