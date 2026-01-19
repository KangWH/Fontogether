"use client";

import { useState } from "react";
import { Plus, Trash2, MessageSquare, Edit2 } from "lucide-react";

type Permission = 'owner' | 'co-owner' | 'editor' | 'viewer';

interface Collaborator {
  id: string;
  name: string;
  email: string;
  permission: Permission;
}

interface Note {
  id: string;
  author: string;
  content: string;
  timestamp: Date;
}

interface Message {
  id: string;
  author: string;
  content: string;
  timestamp: Date;
}

export default function CollaboratePanel() {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([
    { id: '1', name: '사용자 1', email: 'user1@example.com', permission: 'owner' },
    { id: '2', name: '사용자 2', email: 'user2@example.com', permission: 'editor' },
  ]);
  const [notes, setNotes] = useState<Note[]>([
    { id: '1', author: '사용자 1', content: '오늘 작업 목표: A-Z 글리프 완성', timestamp: new Date() },
  ]);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', author: '사용자 2', content: '안녕하세요!', timestamp: new Date() },
  ]);
  const [activeTab, setActiveTab] = useState<'collaborators' | 'notes' | 'chat'>('collaborators');
  const [newMessage, setNewMessage] = useState('');

  const addCollaborator = () => {
    const email = prompt('이메일 주소를 입력하세요:');
    if (email) {
      setCollaborators([...collaborators, {
        id: Date.now().toString(),
        name: email.split('@')[0],
        email,
        permission: 'viewer',
      }]);
    }
  };

  const removeCollaborator = (id: string) => {
    setCollaborators(collaborators.filter(c => c.id !== id));
  };

  const updatePermission = (id: string, permission: Permission) => {
    setCollaborators(collaborators.map(c => c.id === id ? { ...c, permission } : c));
  };

  const addNote = () => {
    const content = prompt('메모를 입력하세요:');
    if (content) {
      setNotes([...notes, {
        id: Date.now().toString(),
        author: '현재 사용자',
        content,
        timestamp: new Date(),
      }]);
    }
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      setMessages([...messages, {
        id: Date.now().toString(),
        author: '현재 사용자',
        content: newMessage,
        timestamp: new Date(),
      }]);
      setNewMessage('');
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Segmented Control */}
      {/* <div className="p-1 flex bg-gray-100 dark:bg-zinc-800 rounded-full mx-1 mt-1">
        <button
          onClick={() => setActiveTab('collaborators')}
          className={`flex-1 px-2 py-1 rounded-full text-xs ${activeTab === 'collaborators' ? 'bg-white dark:bg-zinc-700 shadow' : ''}`}
        >
          협업자
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`flex-1 px-2 py-1 rounded-full text-xs ${activeTab === 'notes' ? 'bg-white dark:bg-zinc-700 shadow' : ''}`}
        >
          메모
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 px-2 py-1 rounded-full text-xs ${activeTab === 'chat' ? 'bg-white dark:bg-zinc-700 shadow' : ''}`}
        >
          채팅
        </button>
      </div> */}

      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'collaborators' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold">협업 인원</h3>
              <button
                onClick={addCollaborator}
                className="flex items-center gap-1 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
              >
                <Plus size={14} />
                추가
              </button>
            </div>
            <div className="space-y-2">
              {collaborators.map(collab => (
                <div key={collab.id} className="p-3 border border-gray-200 dark:border-zinc-700 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium">{collab.name}</p>
                      <p className="text-xs text-gray-500">{collab.email}</p>
                    </div>
                    <button
                      onClick={() => removeCollaborator(collab.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  {collab.permission === 'owner' ? (
                    <div className="w-full px-2 py-1 bg-gray-100 dark:bg-zinc-800 rounded text-xs text-gray-500 select-none">
                      소유자 (변경 불가)
                    </div>
                  ) : (
                    <select
                      value={collab.permission}
                      onChange={(e) => updatePermission(collab.id, e.target.value as Permission)}
                      className="w-full px-2 py-1 border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800 text-xs"
                    >
                      <option value="co-owner">준소유자</option>
                      <option value="editor">편집자</option>
                      <option value="viewer">뷰어</option>
                    </select>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold">메모</h3>
              <button
                onClick={addNote}
                className="flex items-center gap-1 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
              >
                <Edit2 size={14} />
                추가
              </button>
            </div>
            <div className="space-y-2">
              {notes.map(note => (
                <div key={note.id} className="p-3 border border-gray-200 dark:border-zinc-700 rounded">
                  <p className="text-xs text-gray-500 mb-1">{note.author} • {note.timestamp.toLocaleString()}</p>
                  <p className="text-sm">{note.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto space-y-2 mb-4">
              {messages.map(msg => (
                <div key={msg.id} className="p-2 bg-gray-100 dark:bg-zinc-800 rounded">
                  <p className="text-xs text-gray-500 mb-1">{msg.author} • {msg.timestamp.toLocaleTimeString()}</p>
                  <p className="text-sm">{msg.content}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="메시지 입력..."
                className="flex-1 min-w-0 px-2 py-1 border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800 text-sm"
              />
              <button
                onClick={sendMessage}
                className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 flex-shrink-0"
              >
                <MessageSquare size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
