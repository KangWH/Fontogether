"use client";

import Spacer from "@/components/spacer";
import Topbar from "@/components/topbar";
import TopbarButton from "@/components/topbarButton";

import { useUserStore } from "@/store/userStore";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Group, Panel } from "react-resizable-panels";

export default function AccountPage() {
  const router = useRouter();

  const accountMenuCategory = [
    { label: "계정 정보", value: "account_info" },
    { label: "정보 수정", value: "change_info" },
    { label: "회원 탈퇴", value: "delete_account" },
  ]

  let [ selectedCategory, setSelectedCategory ] = useState(accountMenuCategory[0].value);
  let [ isDeleteAccountModalOpen, setIsDeleteAccountModalOpen ] = useState(false);

  let [ deleteAccountConformField, setDeleteAccountConformField ] = useState("");

  let user = useUserStore((s) => s.user);
  let setUser = useUserStore((s) => s.setUser);

  if (!user)
    // return null;
    user = { email: "test@example.com", nickname: "TestUser", createdAt: "2024-01-01" };

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden relative">
      <Group direction="horizontal">
        <Panel
          defaultSize={240}
          minSize={240}
          maxSize={240}
          className="relative bg-gray-50 dark:bg-zinc-900"
        >
          <Topbar>
            <TopbarButton onClick={() => router.back()}>
              <ChevronLeft size={18} strokeWidth={1.5} />
            </TopbarButton>
            <Spacer />
          </Topbar>
          <div className="absolute mt-12 p-2 h-full flex flex-col w-full overflow-y-auto">
            {accountMenuCategory.map((category) => (
              <div
                key={category.value}
                className={`p-3 rounded-lg cursor-pointer ${selectedCategory === category.value ? 'bg-gray-200 dark:bg-zinc-800 text-blue-500' : ''}`}
                onClick={() => setSelectedCategory(category.value)}
              >
                {category.label}
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="relative">
          <Topbar>
            <p className="p-2 font-bold">계정 정보</p>
            <Spacer />
          </Topbar>
          <div
            className="absolute mt-12 h-full overflow-y-auto"
          >
            {selectedCategory === 'account_info' && (
              <div className="p-6">
                <p className="font-bold text-2xl mb-4">{user.nickname}</p>
                <p className="text-sm text-gray-500 dark:text-zinc-400 mb-1">이메일: {user.email}</p>
                <p className="text-sm text-gray-500 dark:text-zinc-400">가입일: {user.createdAt}</p>
              </div>
            )}
            {selectedCategory === 'change_info' && (
              <div className="p-6">
                <h2>닉네임 변경</h2>
                <h2>암호 변경</h2>
              </div>
            )}
            {selectedCategory === 'delete_account' && (
              <div className="p-6">
                <p className="mb-2">회원을 탈퇴하시겠습니까?</p>
                <p className="text-xs">회원님께서 작성하신 모든 프로젝트가 삭제되며, 이는 복구할 수 없습니다.</p>
                <button
                  onClick={() => setIsDeleteAccountModalOpen(true)}
                  className="mt-4 px-4 py-1 bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 rounded"
                >회원 탈퇴</button>
              </div>
            )}
          </div>
        </Panel>

        {isDeleteAccountModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
            <div className="bg-white dark:bg-black rounded-xl shadow-lg dark:shadow-zinc-500/50 w-96 overflow-hidden">
              {/* Header */}
              <div className="text-sm flex items-center justify-between p-2 border-b border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsDeleteAccountModalOpen(false)}
                    className="w-3 h-3 rounded-full bg-red-500 active:bg-red-700 flex items-center justify-center"
                    title="닫기"
                  />
                  <h2 className="font-bold select-none">회원 탈퇴</h2>
                </div>
              </div>

              {/* Window body */}
              <div className="p-4">
                <p className="mb-2">정말로 회원 탈퇴를 진행하시겠습니까?</p>
                <p className="text-xs text-gray-500 dark:text-zinc-400">회원님께서 작성하신 모든 프로젝트가 삭제되며, 이는 복구할 수 없습니다.</p>
                <div className="mt-4">
                  <p>회원 탈퇴를 진행하시려면 아래에 "{user.email}"을 입력해주세요.</p>
                  <input
                    type="text"
                    value={deleteAccountConformField}
                    onChange={(e) => setDeleteAccountConformField(e.target.value)}
                    className="mt-2 w-full p-2 font-mono border border-gray-300 rounded-lg dark:bg-zinc-800 dark:border-zinc-700"
                  />
                </div>
                <div className="flex flex-row justify-end text-sm gap-2">
                  <button
                    className="mt-4 px-4 py-1 bg-gray-100 active:bg-gray-200 text-black dark:text-white rounded dark:bg-zinc-800 dark:active:bg-zinc-900"
                    onClick={() => setIsDeleteAccountModalOpen(false)}
                  >
                    취소
                  </button>
                  <button
                    className="mt-4 px-4 py-1 bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 rounded"
                    onClick={() => {
                      if (deleteAccountConformField === user.email) {
                        // Proceed with account deletion
                        router.push('/');
                        setUser(null);
                        setIsDeleteAccountModalOpen(false);
                      } else {
                        alert("이메일이 일치하지 않습니다.");
                      }
                    }}
                  >
                    탈퇴
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Group>
    </div>
  );
}
