import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Keyboard, X } from 'lucide-react';

interface Shortcut {
  key: string;
  description: string;
  action: () => void;
}

interface KeyboardShortcutsHelpProps {
  shortcuts: Shortcut[];
}

export function KeyboardShortcutsHelp({ shortcuts }: KeyboardShortcutsHelpProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isHelpVisible, setIsHelpVisible] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle help with ? key
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        setIsHelpVisible(prev => !prev);
      }

      // Execute shortcut actions
      if (!isHelpVisible) {
        shortcuts.forEach(shortcut => {
          if (e.key.toLowerCase() === shortcut.key.toLowerCase() && 
              !e.ctrlKey && !e.metaKey && !e.altKey &&
              !['input', 'textarea', 'select'].includes((e.target as HTMLElement).tagName.toLowerCase())) {
            shortcut.action();
          }
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    // Show the hint briefly
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 5000);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [shortcuts, isHelpVisible]);

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg text-sm flex items-center gap-2"
          >
            <Keyboard className="w-4 h-4" />
            <span>Press <kbd className="px-2 py-1 bg-gray-700 rounded">?</kbd> for keyboard shortcuts</span>
            <button 
              onClick={() => setIsVisible(false)}
              className="ml-2 text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isHelpVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setIsHelpVisible(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Keyboard className="w-5 h-5" />
                  Keyboard Shortcuts
                </h2>
                <button
                  onClick={() => setIsHelpVisible(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-2">
                {shortcuts.map((shortcut, index) => (
                  <div 
                    key={index} 
                    className="flex justify-between items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <span className="text-gray-700 dark:text-gray-300">{shortcut.description}</span>
                    <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-gray-800 dark:text-gray-200 text-sm font-mono">
                      {shortcut.key}
                    </kbd>
                  </div>
                ))}
                
                <div className="mt-4 pt-2 border-t dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
                  <p>Press <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-gray-800 dark:text-gray-200 text-xs font-mono">?</kbd> to toggle this help dialog</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}