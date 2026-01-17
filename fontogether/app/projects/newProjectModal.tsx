"use client";

import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild, Tab, TabGroup, TabList, TabPanels, TabPanel } from '@headlessui/react';
import { Fragment } from 'react';

function classNames(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export default function NewProjectModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
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
              <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all select-none">
                <TabGroup className="p-4">
                  <TabList className="flex space-x-[1px] rounded-lg bg-blue-900/10">
                    {['빈 프로젝트', '템플릿', '파일 업로드'].map((category) => (
                      <Tab
                        key={category}
                        className={({ selected }) =>
                          classNames(
                            'w-full rounded-lg py-1 text-sm font-medium leading-5 focus:outline-none active:bg-blue-500',
                            selected
                              ? 'bg-blue-500 text-white'
                              : 'active:text-blue-300'
                          )
                        }
                      >
                        {category}
                      </Tab>
                    ))}
                  </TabList>

                  <TabPanels className="mt-4">
                    <TabPanel>
                      <p>사용할 글리프 집합:</p>
                    </TabPanel>
                    <TabPanel>
                      <p>사용할 템플릿:</p>
                    </TabPanel>
                    <TabPanel>
                      <p>업로드 가능한 파일: .ufo, .ttf, .otf</p>
                    </TabPanel>
                  </TabPanels>
                </TabGroup>


                <div className="mt-4 p-4 flex flex-row justify-end gap-2 border-t border-gray-300">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-gray-200 px-6 py-1 text-sm font-medium active:bg-gray-300"
                    onClick={onClose}
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-500 px-6 py-1 text-sm font-medium text-white active:bg-blue-600"
                    onClick={onClose} 
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