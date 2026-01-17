"use client";
import { useRouter } from "next/navigation";

export default function LoginView() {
  const router = useRouter();

  const handleLogin = () => {
    // handle login here
    router.push("/projects");
  };

  return (
    <div className="h-screen py-15 bg-gray-100 dark:bg-gray-900 text-center">
      <div className="mx-auto mb-12 font-thin text-6xl tracking-[0.2em]">FONTOGETHER</div>
      <div className="font-light text-lg tracking-widest">대충 있어 보이는 한 줄 소개를 여기에 입력</div>
      {/* Inner container */}
      <div className="mx-auto my-20 w-128 py-10 bg-white dark:bg-black rounded-xl shadow-md">
        <div className="mb-8 text-2xl">로그인</div>
        {/* Buttons container */}
        <div className="mx-auto w-84 flex flex-col gap-5">
          <button className="p-2 rounded" style={{ backgroundColor: "green", color: "white" }} onClick={handleLogin}>Naver 로그인</button>
          <button className="p-2 rounded" style={{ backgroundColor: "yellow", color: "black" }} onClick={() => {router.push("/register")}}>Kakao 로그인</button>
          <button className="p-2 rounded" style={{ backgroundColor: "white", color: "blue", border: "1px solid gray", boxSizing: "border-box" }}>Google 로그인</button>
          <button className="p-2 rounded" style={{ backgroundColor: "black", color: "white" }}>Apple 로그인</button>
        </div>
      </div>
    </div>
  );
}
