"use client";
import { useRouter } from "next/navigation";

export default function LoginView() {
  const router = useRouter();

  return (
    <div className="h-screen py-15 bg-gray-100 dark:bg-gray-900 text-center">
      <div className="mx-auto mb-12 font-thin text-6xl tracking-[0.2em]">FONTOGETHER</div>
      <div className="font-light text-lg tracking-widest">대충 있어 보이는 한 줄 소개를 여기에 입력</div>
      {/* Inner container */}
      <div className="mx-auto my-20 w-128 py-10 bg-white dark:bg-black rounded-xl shadow-md">
        <div className="mb-8 text-2xl">회원가입</div>
        {/* Buttons container */}
        <div className="mx-auto w-84 flex flex-col gap-5">
          <div className="flex flex-col justify-start text-left">
            <p className="pb-2">사용자 이름</p>
            <input type="text" className="p-1 rounded-sm border border-gray-500 outline-none" />
          </div>
          <div className="flex flex-row justify-end gap-2 text-sm">
            <button onClick={() => {router.back()}} className="px-6 py-1 bg-gray-100 rounded">취소</button>
            <button onClick={() => {router.push("/projects")}} className="px-6 py-1 bg-blue-500 rounded text-white">확인</button>
          </div>
        </div>
      </div>
    </div>
  );
}
