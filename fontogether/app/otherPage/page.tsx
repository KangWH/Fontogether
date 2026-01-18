"use client";

import { useUserStore } from "@/store/userStore";

export default function A() {
  const user = useUserStore((state: any) => state.user);

  if (!user) {
    return <div>로그인이 필요합니다.</div>;
  }

  return (
    <div>환영합니다, {user.email}!</div>
  )
}
