import { useEffect } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import { useQueryClient } from "@tanstack/react-query";
import { useDuelStore } from "@/store/duelStore";
import { challengeKeys } from "@/hooks/useChallenges";
import { dashboardKeys } from "@/hooks/useDashboardData";

// ============================================================================
// CodeEditor — Now integrated with centralized duel state
// - Editor state (code, language) lives in Zustand duel store
// - On save/run, invalidates React Query caches for related data
// - Event listeners properly cleaned up on unmount
// ============================================================================

export default function CodeEditor() {
  const queryClient = useQueryClient();

  // ✅ Read/write from global Zustand store instead of local state
  const currentCode = useDuelStore((state) => state.currentCode);
  const currentLanguage = useDuelStore((state) => state.currentLanguage);
  const setCode = useDuelStore((state) => state.setCode);
  const setLanguage = useDuelStore((state) => state.setLanguage);
  const duelId = useDuelStore((state) => state.duelId);
  const addSubmission = useDuelStore((state) => state.addSubmission);

  // 🔹 Run Code — invalidate related caches after submission
  const handleRunCode = () => {
    console.log("Running code...");

    // Add submission to duel store
    addSubmission({
      id: crypto.randomUUID(),
      challengeId: duelId || "",
      userId: "",
      code: currentCode,
      language: currentLanguage,
      status: "pending",
      submittedAt: new Date().toISOString(),
    });

    // ✅ Invalidate dashboard/challenge caches so related views auto-update
    queryClient.invalidateQueries({ queryKey: dashboardKeys.stats });
    if (duelId) {
      queryClient.invalidateQueries({
        queryKey: challengeKeys.detail(duelId),
      });
    }

    alert("Run triggered!");
  };

  // 🔹 Save Code — persists to localStorage + duel store
  const handleSaveCode = () => {
    localStorage.setItem("duel-code", currentCode);
    alert("Code saved!");
  };

  // 🔹 Prevent browser default Ctrl + S (with proper cleanup)
  useEffect(() => {
    const preventSave = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", preventSave);
    // ✅ Cleanup listener on unmount — prevents memory leaks
    return () => window.removeEventListener("keydown", preventSave);
  }, []);

  // 🔹 Monaco Shortcuts
  const handleEditorDidMount: OnMount = (editor, monaco) => {
    // Ctrl + Enter → Run
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
      () => {
        handleRunCode();
      }
    );

    // Ctrl + S → Save
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
      () => {
        handleSaveCode();
      }
    );

    // Ctrl + Shift + F → Format
    editor.addCommand(
      monaco.KeyMod.CtrlCmd |
      monaco.KeyMod.Shift |
      monaco.KeyCode.KeyF,
      () => {
        editor.getAction("editor.action.formatDocument").run();
      }
    );
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Live Code Duel</h2>

      {/* 🔹 Shortcut Info */}
      <div style={{ fontSize: "14px", color: "gray", marginBottom: "8px" }}>
        Shortcuts: Ctrl+Enter (Run) | Ctrl+S (Save) | Ctrl+Shift+F (Format)
      </div>

      <select
        value={currentLanguage}
        onChange={(e) => setLanguage(e.target.value)}
      >
        <option value="javascript">JavaScript</option>
        <option value="typescript">TypeScript</option>
        <option value="python">Python</option>
        <option value="cpp">C++</option>
      </select>

      <div style={{ marginTop: "10px" }}>
        <Editor
          height="500px"
          language={currentLanguage}
          value={currentCode}
          theme="vs-dark"
          onChange={(value) => setCode(value || "")}
          onMount={handleEditorDidMount}
        />
      </div>
    </div>
  );
}