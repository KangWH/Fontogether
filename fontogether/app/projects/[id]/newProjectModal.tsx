import { useState, useRef } from 'react';

export default function NewProjectModal({ onClose }: { onClose: () => void }) {
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
      <div className="bg-white dark:bg-black rounded-xl shadow-lg dark:shadow-zinc-500/50 w-96 overflow-hidden">
        {/* Header */}
        <div className="text-sm flex items-center justify-between p-2 border-b border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="w-3 h-3 rounded-full bg-red-500 active:bg-red-700 flex items-center justify-center"
              title="닫기"
            />
            <h2 className="font-bold select-none">새 프로젝트</h2>
          </div>
        </div>

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
      </div>
    </div>
  )
}