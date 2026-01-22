"use client";

import { koreanFullDate } from "@/components/dateFormatter";
import Spacer from "@/components/spacer";
import Topbar from "@/components/topbar";
import TopbarButton from "@/components/topbarButton";

import { useUserStore } from "@/store/userStore";

import { ChevronLeft, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Group, Panel } from "react-resizable-panels";

export default function AccountPage() {
  const router = useRouter();

  const accountMenuCategory = [
    { label: "계정 정보", value: "account_info" },
    { label: "정보 수정", value: "change_info" },
    { label: "회원 탈퇴", value: "delete_account" },
  ]

  let [ selectedCategory, setSelectedCategory ] = useState(accountMenuCategory[0].value);

  let user = useUserStore((s) => s.user);
  let setUser = useUserStore((s) => s.setUser);
  let clearUser = useUserStore((s) => s.clearUser);

  const [newNickname, setNewNickname] = useState(user?.nickname || '');

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
  const oldPasswordFieldRef = useRef<HTMLInputElement>(null);
  const newPasswordFieldRef = useRef<HTMLInputElement>(null);
  const newPasswordConfirmFieldRef = useRef<HTMLInputElement>(null);

  let [ isDeleteAccountModalOpen, setIsDeleteAccountModalOpen ] = useState(false);
  let [ deleteAccountConformField, setDeleteAccountConformField ] = useState("");

  const logoutHandler = () => {
    clearUser();
    router.push('/');
  }

  const nicknameChangeHandler = () => {
    fetch(process.env.NEXT_PUBLIC_SERVER_URI + `/api/users/${user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname: newNickname })
    })
    .then(res => {
      if (!res.ok) {
        alert('닉네임 변경을 실패했습니다. 다시 시도해 주세요.');
        return;
      }

      alert('닉네임이 변경되었습니다.');
      setUser({ ...user, nickname: newNickname });
    });
  };

  const passwordChangeHandler = () => {
    setPasswordErrorMessage('');
    if (oldPassword.length < 1) {
      setPasswordErrorMessage('기존 암호를 입력해 주세요.');
      oldPasswordFieldRef.current?.focus();
      return;
    }
    if (newPassword.length < 1) {
      setPasswordErrorMessage('새 암호를 입력해 주세요.');
      newPasswordFieldRef.current?.focus();
      return;
    }
    if (newPasswordConfirm.length < 1) {
      setPasswordErrorMessage('암호 확인을 입력해 주세요.');
      newPasswordConfirmFieldRef.current?.focus();
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      newPasswordConfirmFieldRef.current?.focus();
      setPasswordErrorMessage('새 암호와 암호 확인이 일치하지 않습니다.');
      return;
    }

    fetch(process.env.NEXT_PUBLIC_SERVER_URI + `/api/users/${user.id}/password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        oldPassword: oldPassword,
        newPassword: newPassword
      })
    })
    .then(res => {
      if (!res.ok) {
        setPasswordErrorMessage('기존 암호를 다시 확인해 주세요.');
        return;
      }

      alert('암호가 변경되었습니다. 다시 로그인해 주세요.');
      clearUser();
      router.push('/');
      return;
    })
    .catch(error => {
      alert('네트워크 연결이 원활하지 않습니다.');
      return;
    });
  };

  const deleteAccountHandler = (confirmString: string) => {
    if (confirmString !== user.email) {
      alert('입력한 문자열이 정확하지 않습니다.');
      return;
    }

    fetch(process.env.NEXT_PUBLIC_SERVER_URI + `/api/users/${user.id}`, {
      method: 'DELETE'
    })
    .then(response => {
      if (!response.ok) {
        alert('계정 삭제에 실패했습니다. 다시 시도해 주세요.');
        return;
      }

      alert('계정이 삭제되었습니다.');
      clearUser();
      router.push('/');
    })
    .catch(error => {
      console.error(error);
      alert('계정 삭제에 실패했습니다. 다시 시도해 주세요.');
    })
  }

  if (!user)
    return null;

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden relative">
      <Group orientation="horizontal">
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
                className={`p-3 rounded-lg select-none ${selectedCategory === category.value ? 'bg-gray-200 dark:bg-zinc-800 text-blue-500' : ''}`}
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
            <TopbarButton onClick={logoutHandler}>
              <LogOut size={18} strokeWidth={1.5} />
            </TopbarButton>
          </Topbar>
          <div
            className="absolute mt-12 h-full overflow-y-auto"
          >
            {selectedCategory === 'account_info' && (
              <div className="p-6">
                <p className="font-bold text-2xl mb-4">{user.nickname}</p>
                <p className="text-sm text-gray-500 dark:text-zinc-400 mb-1">이메일: {user.email}</p>
                <p className="text-sm text-gray-500 dark:text-zinc-400">가입일: {koreanFullDate(new Date(user.createdAt))}</p>
              </div>
            )}

            {selectedCategory === 'change_info' && (
              <div className="p-6">
                <div className="pb-8 flex flex-col gap-2 flex-start">
                  <h2 className="text-lg font-semibold mb-2">닉네임 변경</h2>
                  <div className="flex flex-col gap-2">
                    <p className="font-medium">새 닉네임</p>
                    <input
                      value={newNickname}
                      onChange={(e) => setNewNickname(e.target.value)}
                      className={`p-1 border border-gray-300 dark:border-zinc-700 rounded-md outline-none focus:border-blue-500`}
                    />
                  </div>
                  <div className="flex flex-row">
                    <Spacer />
                    <button
                      onClick={nicknameChangeHandler}
                      className="px-6 py-1 bg-gray-100 dark:bg-zinc-900 rounded active:bg-gray-200 dark:active:bg-zinc-800"
                    >
                      변경
                    </button>
                  </div>
                </div>
                <div className="pb-8 flex flex-col gap-2 flex-start">
                  <h2 className="text-lg font-semibold mb-2">암호 변경</h2>
                  <div className="flex flex-col gap-2">
                    <p className="font-medium">기존 암호</p>
                    <input
                      type="password"
                      ref={oldPasswordFieldRef}
                      value={oldPassword}
                      onChange={(e) => {setPasswordErrorMessage(''); setOldPassword(e.target.value)}}
                      className={`p-1 border border-gray-300 dark:border-zinc-700 rounded-md outline-none focus:border-blue-500`}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <p className="font-medium">새 암호</p>
                    <input
                      type="password"
                      ref={newPasswordFieldRef}
                      value={newPassword}
                      onChange={(e) => {setPasswordErrorMessage(''); setNewPassword(e.target.value)}}
                      className={`p-1 border border-gray-300 dark:border-zinc-700 rounded-md outline-none focus:border-blue-500`}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <p className="font-medium">암호 확인</p>
                    <input
                      type="password"
                      ref={newPasswordConfirmFieldRef}
                      value={newPasswordConfirm}
                      onChange={(e) => {setPasswordErrorMessage(''); setNewPasswordConfirm(e.target.value)}}
                      className={`p-1 border border-gray-300 dark:border-zinc-700 rounded-md outline-none focus:border-blue-500`}
                    />
                  </div>
                  {passwordErrorMessage.length < 1 || (
                    <p className='text-red-500'>{passwordErrorMessage}</p>
                  )}
                  <div className="flex flex-row">
                    <Spacer />
                    <button
                      onClick={passwordChangeHandler}
                      className="px-6 py-1 bg-gray-100 dark:bg-zinc-900 rounded active:bg-gray-200 dark:active:bg-zinc-800"
                    >
                      변경
                    </button>
                  </div>
                </div>
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
                    className="mt-2 w-full p-1 font-mono border border-gray-300 rounded-lg dark:bg-zinc-800 dark:border-zinc-700 outline-none focus:border-blue-500"
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
                    onClick={() => {deleteAccountHandler(deleteAccountConformField)}}
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
