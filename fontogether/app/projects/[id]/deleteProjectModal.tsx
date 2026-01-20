export default function DeleteProjectModal({ userId, ids, onClose }: { userId: number, ids: Set<number>, onClose: () => void }) {
  const handleDeletion = async () => {
    const responses: Promise<Response>[] = [];
    ids.forEach(id => {
      responses.push(fetch(process.env.NEXT_PUBLIC_SERVER_URI + `/api/projects/${id}?userId=${userId}`, {
        method: 'DELETE'
      }));
    });

    Promise.all(responses)
      .then((a) => {
        onClose();
      })
      .catch((err) => {
        console.error(err);
        alert('삭제가 진행되지 않았습니다. 다시 시도하세요.');
      })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
      <div className="bg-white dark:bg-black rounded-xl shadow-lg dark:shadow-zinc-500/50 overflow-hidden">
        <div className="p-4">
          <p className="font-bold mb-2">선택한 {ids.size}개의 프로젝트를 삭제하시겠습니까?</p>
          <p className="text-gray-600 dark:text-gray-400">삭제된 프로젝트는 복구할 수 없습니다.</p>
          <div className="flex flex-row text-sm gap-2">
            <button
              className="mt-4 px-4 py-2 grow bg-gray-100 active:bg-gray-200 text-black dark:text-white rounded-md dark:bg-zinc-800 dark:active:bg-zinc-900"
              onClick={onClose}
            >
              취소
            </button>
            <button
              className="mt-4 px-4 py-2 grow bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 rounded-md"
              onClick={handleDeletion}
            >
              삭제
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
