// "use client";

import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild, Tab, TabGroup, TabList, TabPanels, TabPanel } from '@headlessui/react';
import { Fragment, useState, useRef } from 'react';

function classNames(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export default function ExportProjectModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  let [ selectedFormat, setSelectedFormat ] = useState<string>('ufo');

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-9999" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-100"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-100"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-100"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-black text-left align-middle shadow-xl dark:shadow-gray-500/50 transition-all select-none">
                <div className="p-4 pb-0">
                  <p>내려받을 형식:</p>
                  <select value={selectedFormat} onChange={(e) => setSelectedFormat(e.target.value)} className="w-full mt-2 mb-4 px-2 py-1 border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800 text-sm">
                    <option value="ufo">UFO</option>
                    <option value="otf">OTF</option>
                    <option value="ttf">TTF</option>
                    <option value="woff">WOFF</option>
                    <option value="woff2">WOFF2</option>
                  </select>
                </div>

                <div className="p-4 flex flex-row justify-end gap-2 border-t border-gray-300 dark:border-zinc-700">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 dark:bg-zinc-800 px-6 py-1 text-sm font-medium active:bg-gray-200 dark:active:bg-zinc-700"
                    onClick={onClose}
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-500 px-6 py-1 text-sm font-medium text-white active:bg-blue-600 disabled:bg-blue-500/50"
                    onClick={() => {
                      onClose();
                    }}
                  >
                    확인
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}