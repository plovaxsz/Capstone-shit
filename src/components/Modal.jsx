import React from 'react';
import { Icons } from './Icons';

/**
 * CONTAINER LAYOUT UTILITY: Modal
 * PURPOSE: Standardized clean shell rendering popup contexts over an animated glass backdrop-mask.
 * REFACTOR ACCENTS: Applied true 'backdrop-blur-md' overlay filters with scale easing transitions.
 */
const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    
    return (
        // FIXED: Swapped to backdrop-blur masks with soft high-contrast dark parameter adjustments
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-[9999] flex justify-center items-center p-4 animate-fade-in">
            
            {/* Core structural card frame sheet */}
            <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700/60 overflow-hidden transform transition-all animate-scale-up p-6">
                
                {/* Header configuration controls layout line */}
                <div className="flex justify-between items-center mb-5 border-b dark:border-gray-700/50 pb-2.5">
                    <h3 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <span className="w-1.5 h-3.5 bg-blue-600 rounded-full"></span>
                        {title}
                    </h3>
                    <button 
                        type="button"
                        onClick={onClose} 
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        title="Dismiss Panel"
                    >
                        {Icons.XMark}
                    </button>
                </div>
                
                {/* Content injection channel panel zone */}
                <div className="relative text-xs leading-normal">
                    {children}
                </div>
                
            </div>
        </div>
    );
};

export default Modal;