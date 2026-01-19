"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUserStore } from '@/store/userStore';

export default function SocialLoginView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  useEffect(() => {
    const code = searchParams.get('code');

    if (code) {
      console.log('Authorization code received:', code);
      sendCodeToBackend(code);
    }
  }, [searchParams]);

  const sendCodeToBackend = async (code: string) => {
    try {
      const response = await fetch('/api/users/me', {
        // method: 'POST',
        // headers: { 'Content-Type': 'application/json' },
        // body: JSON.stringify({ code }),
        // credentials: 'include',
      });
      const result = await response.json();

      if (response.status === 200) {
        // 계정 존재: 로그인 처리
        // 현재 계정 상태를 쿠키에 저장
        console.log('login success');
        router.push(`/projects/${0}`)
      } else if (response.status === 404) {
        // 계정 없음: 회원가입 페이지로 리다이렉트
        const query = new URLSearchParams({
          email: result.email,
          name: result.name,
        }).toString();
        console.log(query);
        router.push(`/socialRegister?${query}`);
      }
    } catch (error) {
      console.error("Error during social login:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">소셜 로그인 중...</h1>
      <p className="mb-8">잠시만 기다려주세요.</p>
      <h2 className="text-lg font-semibold mb-4">오랫동안 진행이 되지 않나요?</h2>
      <a href="/" className="text-blue-500 hover:underline">첫 페이지로 돌아가기</a>
    </div>
  );
}
