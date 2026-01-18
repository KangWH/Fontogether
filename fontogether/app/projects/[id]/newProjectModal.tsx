"use client";

import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild, Tab, TabGroup, TabList, TabPanels, TabPanel } from '@headlessui/react';
import { Fragment, useState, useRef } from 'react';

function classNames(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export default function NewProjectModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const tabCategories = [
    { label: '빈 프로젝트', category: 'emptyProject' },
    { label: '템플릿', category: 'template' },
    { label: '파일 업로드', category: 'fileUpload' }
  ];
  const [ selectedTabIndex, setSelectedTabIndex ] = useState(0);

  const glyphSetNames = [
    '라틴 (Adobe Latin 1)',
    '라틴 (Adobe Latin 2)',
    '라틴 (Adobe Latin 3)',
    '한글 (완성형)',
    '한글 (완성형, 한자 제외)',
    '한글 (Adobe-Korean-2)',
    '한글 (Adobe-KR-9)',
  ];
  const [ selectedGlyphSetIndex, setSelectedGlyphSetIndex ] = useState(0);

  const [ selectedFile, setSelectedFile ] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("업로드할 파일을 선택해주세요.");
      return;
    }
    
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("http://10.249.16.96:444/api/projects/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        alert("파일이 성공적으로 업로드되었습니다.");
        onClose();
        setSelectedFile(null);
      }
    } catch (error) {
      console.error("파일 업로드 실패:", error);
      alert("파일 업로드에 실패했습니다. 다시 시도해주세요.");
    }
  }

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
                {/* Tab bar */}
                <div
                  className="w-full space-x-2 p-4 pb-0"
                >
                  <div className="p-1 bg-gray-100 dark:bg-zinc-800 rounded-xl flex flex-grow">
                    {tabCategories.map((tab, index) => (index === 1 ? null : (
                      <button
                        key={tab.category}
                        className={`px-4 py-1 text-sm flex-grow font-medium rounded-lg ${selectedTabIndex === index ? 'bg-white dark:bg-black shadow-md' : 'text-gray-700 dark:text-gray-300'}`}
                        onMouseDown={() => setSelectedTabIndex(index)}
                      >
                        {tab.label}
                      </button>
                    )))}
                  </div>
                </div>

                <div className="p-4">
                  {(selectedTabIndex === 0) && (
                    <>
                      <p>사용할 글리프 집합:</p>
                      <div className="mt-4 flex flex-col overflow-y-auto border border-gray-300 dark:border-zinc-700">
                        {glyphSetNames.map((name, index) => (
                          <div
                            key={name}
                            className={`flex-shrink-0 px-3 py-1 text-sm ${(selectedGlyphSetIndex === index) ? 'bg-blue-500 text-white' : (index % 2 !== 0) ? 'bg-gray-100 dark:bg-zinc-800' : ''}`}
                            onClick={() => setSelectedGlyphSetIndex(index)}
                          >
                            {name}
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {(selectedTabIndex === 2) && (
                    <>
                      <p>업로드 가능한 파일: .ufo, .ttf, .otf</p>
                      <div className="mt-4 flex flex-row gap-2 items-center">
                        <button
                          className="px-4 py-1 bg-gray-100 active:bg-gray-200 text-black dark:text-white rounded dark:bg-zinc-800 dark:active:bg-zinc-900"
                          onClick={() => fileInputRef.current?.click()}
                        >파일 선택</button>
                        {selectedFile ? (
                          <>
                            <div className="text-sm">{selectedFile?.name.trim() || ""}</div>
                            <button
                              className="text-sm text-red-500"
                              onClick={() => setSelectedFile(null)}
                            >×</button>
                          </>
                        ) : (
                          <div className="text-sm text-gray-500 dark:text-gray-400">선택된 파일 없음</div>
                        )}
                      </div>
                      <input
                        type="file"
                        accept=".ufo,.zip,.ttf,.otf"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                      />
                    </>
                  )}
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
                      if (selectedTabIndex === 2) {
                        handleUpload();
                      } else {
                        onClose();
                      }
                    }}
                    disabled={selectedTabIndex === 2 && !selectedFile}
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