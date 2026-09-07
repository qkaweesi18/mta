"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, LogOut, Edit2, Trash2 } from "lucide-react";

interface Task {
  id: number;
  title: string;
  description: string | null;
  status: string;
}

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const router = useRouter();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Todo");

  const fetchTasks = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }
      const res = await fetch("/api/tasks", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      setTasks(data);
    } catch (error) {
      console.error("Failed to fetch tasks", error);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    localStorage.removeItem("token");
    router.push("/login");
  };

  const openModal = (task?: Task) => {
    if (task) {
      setEditingTask(task);
      setTitle(task.title);
      setDescription(task.description || "");
      setStatus(task.status);
    } else {
      setEditingTask(null);
      setTitle("");
      setDescription("");
      setStatus("Todo");
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const saveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token") || "";
    
    try {
      if (editingTask) {
        await fetch(`/api/tasks/${editingTask.id}`, {
          method: "PUT",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` 
          },
          body: JSON.stringify({ title, description, status }),
        });
      } else {
        await fetch("/api/tasks", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ title, description, status }),
        });
      }
      closeModal();
      fetchTasks();
    } catch (error) {
      console.error("Failed to save task", error);
    }
  };

  const deleteTask = async (id: number) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    
    const token = localStorage.getItem("token") || "";
    try {
      await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });
      fetchTasks();
    } catch (error) {
      console.error("Failed to delete task", error);
    }
  };

  const updateStatus = async (task: Task, newStatus: string) => {
    const token = localStorage.getItem("token") || "";
    try {
      await fetch(`/api/tasks/${task.id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ ...task, status: newStatus }),
      });
      fetchTasks();
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="animate-spin h-8 w-8 text-white" />
      </div>
    );
  }

  const columns = ["Todo", "In Progress", "Done"];

  return (
    <div className="min-h-screen bg-black text-white font-sans relative flex flex-col overflow-hidden">
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none z-0"></div>

      <header className="bg-black/50 backdrop-blur-md border-b border-white/10 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-xl font-black tracking-tighter uppercase italic text-white flex items-center gap-2">
            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-black rotate-45"></div>
            </div>
            TASK APP
          </h1>
          <button
            onClick={handleLogout}
            className="flex items-center text-xs font-bold tracking-widest uppercase text-gray-400 hover:text-white transition-colors"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 relative z-10 w-full flex flex-col">
        <div className="flex justify-between items-end mb-12 border-b border-white/10 pb-8">
          <h2 className="text-[60px] leading-[0.8] font-black tracking-tighter uppercase italic flex flex-col">
            <span>MY</span>
            <span className="text-transparent" style={{ WebkitTextStroke: "2px white" }}>TASKS</span>
          </h2>
          <button
            onClick={() => openModal()}
            className="flex items-center bg-white text-black px-6 py-4 font-black text-xs tracking-widest uppercase skew-x-[-12deg] hover:bg-gray-200 transition-colors"
          >
            <span className="skew-x-[12deg] flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/10 border border-white/10 flex-1">
          {columns.map((colStatus) => (
            <div key={colStatus} className="bg-black/90 p-8 flex flex-col">
              <h3 className="text-xs font-bold tracking-widest uppercase text-gray-500 mb-8 flex items-center justify-between">
                <span>{colStatus}</span>
                <span className="text-white text-3xl font-black italic underline underline-offset-8 decoration-1">
                  {String(tasks.filter((t) => t.status === colStatus).length).padStart(2, '0')}
                </span>
              </h3>
              
              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {tasks
                  .filter((t) => t.status === colStatus)
                  .map((task) => (
                    <div
                      key={task.id}
                      className="bg-white/5 p-6 border-l-2 border-white/20 group hover:border-white transition-colors relative"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-bold tracking-tight text-white text-lg">{task.title}</h4>
                        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 top-4">
                          <button
                            onClick={() => openModal(task)}
                            className="p-1.5 text-gray-400 hover:text-white bg-black/50 rounded-sm"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="p-1.5 text-gray-400 hover:text-white bg-black/50 rounded-sm"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      {task.description && (
                        <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                          {task.description}
                        </p>
                      )}
                      
                      {/* Quick Move Buttons */}
                      <div className="flex space-x-4 mt-4 pt-4 border-t border-white/5">
                        {columns.map((s) => (
                          s !== colStatus && (
                            <button
                              key={s}
                              onClick={() => updateStatus(task, s)}
                              className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500 hover:text-white transition-colors flex items-center gap-1"
                            >
                              <span>Move to {s}</span>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="skew-x-[12deg]">
                                <path d="M5 12h14M12 5l7 7-7 7"/>
                              </svg>
                            </button>
                          )
                        ))}
                      </div>
                    </div>
                  ))}
                  {tasks.filter((t) => t.status === colStatus).length === 0 && (
                    <div className="border border-dashed border-white/10 p-8 text-center text-xs font-bold tracking-widest uppercase text-gray-600 italic">
                      No tasks
                    </div>
                  )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-black rounded-none shadow-2xl w-full max-w-md border border-white/10 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-purple-600"></div>
            <div className="px-8 py-6 border-b border-white/10">
              <h3 className="text-3xl font-black tracking-tighter uppercase italic text-white flex flex-col">
                <span>{editingTask ? "EDIT" : "CREATE"}</span>
                <span className="text-transparent" style={{ WebkitTextStroke: "1px white" }}>TASK</span>
              </h3>
            </div>
            <form onSubmit={saveTask} className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-gray-500 mb-2">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-white focus:border-white transition-colors"
                  placeholder="TASK TITLE"
                />
              </div>
              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-gray-500 mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-white focus:border-white transition-colors resize-none"
                  placeholder="TASK DESCRIPTION (OPTIONAL)"
                />
              </div>
              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-gray-500 mb-2">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-3 bg-black border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-white focus:border-white transition-colors appearance-none rounded-none"
                >
                  <option value="Todo">TODO</option>
                  <option value="In Progress">IN PROGRESS</option>
                  <option value="Done">DONE</option>
                </select>
              </div>
              <div className="flex justify-end space-x-6 mt-8 pt-6 border-t border-white/10">
                <button
                  type="button"
                  onClick={closeModal}
                  className="text-xs font-bold tracking-widest uppercase text-gray-500 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-white text-black font-black text-xs tracking-widest uppercase skew-x-[-12deg] px-8 py-3 hover:bg-gray-200 transition-colors flex items-center"
                >
                  <span className="skew-x-[12deg] flex items-center gap-2">
                    {editingTask ? "SAVE" : "CREATE"}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
