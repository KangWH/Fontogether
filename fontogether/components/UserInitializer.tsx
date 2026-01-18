"use client";

import { useEffect } from "react";
import { useUserStore } from "@/store/userStore";

export function UserInitializer({ user }: { user: any }) {
  const setUser = useUserStore((state: any) => state.setUser);

  useEffect(() => {
    // 서버에서 받은 유저 정보를 전역 상태에 저장
    if (user) {
      setUser(user);
    }
  }, [user, setUser]);

  return null; // 화면에 아무것도 그리지 않음
}
