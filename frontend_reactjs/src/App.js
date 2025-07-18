import React, { useState, useEffect } from "react";
import "./App.css";
import "./NotesApp.css";
import supabase, { getEnv, getSupabaseConfigError } from "./utils/supabaseClient";

/**
 * Minimal note model for local app state
 * {
 *   id: string,
 *   title: string,
 *   content: string,
 *   created: number,
 *   updated: number
 * }
 */

// PUBLIC_INTERFACE
function App() {
  // All hooks MUST be at the top level
  const [theme, setTheme] = useState("light");
  const [notes, setNotes] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [editorNote, setEditorNote] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  // Config error can be checked any time from util
  const configError = getSupabaseConfigError();

  // Apply theme CSS variable root
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Load all notes from Supabase on mount
  useEffect(() => {
    if (!configError) {
      fetchNotes();
    }
    // eslint-disable-next-line
  }, []);

  // Select the first note if available when none selected
  useEffect(() => {
    if (notes.length > 0 && !selectedNoteId) {
      setSelectedNoteId(notes[0].id);
    } else if (notes.length === 0) {
      setSelectedNoteId(null);
      setIsEditing(false);
      setEditorNote(null);
    }
  }, [notes, selectedNoteId]);

  // On selecting note, update editor/viewer
  useEffect(() => {
    if (selectedNoteId) {
      const note = notes.find((n) => n.id === selectedNoteId);
      setEditorNote(note ? { ...note } : null);
      setIsEditing(false);
    } else {
      setEditorNote(null);
      setIsEditing(false);
    }
  }, [selectedNoteId, notes]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // PUBLIC_INTERFACE
  const fetchNotes = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: supaErr } = await supabase
        .from("notes")
        .select("*")
        .order("updated", { ascending: false });
      if (supaErr) throw supaErr;
      setNotes(data || []);
    } catch (err) {
      setError("Could not load notes.");
    } finally {
      setLoading(false);
    }
  };

  // PUBLIC_INTERFACE
  const handleSelectNote = (id) => {
    setSelectedNoteId(id);
    setError(null);
  };

  // PUBLIC_INTERFACE
  const handleDeleteNote = async (id) => {
    if (!window.confirm("Delete this note?")) return;
    setDeleting(true);
    setError(null);
    try {
      const { error: supaErr } = await supabase.from("notes").delete().eq("id", id);
      if (supaErr) throw supaErr;
      setNotes((prev) => prev.filter((n) => n.id !== id));
      // After deletion, auto-select next note
      const idx = notes.findIndex((n) => n.id === id);
      if (idx > 0 && notes.length > 1) {
        setSelectedNoteId(notes[idx - 1].id);
      } else if (notes.length > 1) {
        setSelectedNoteId(notes[1].id);
      } else {
        setSelectedNoteId(null);
      }
    } catch (err) {
      setError("Unable to delete note.");
    } finally {
      setDeleting(false);
    }
  };

  // PUBLIC_INTERFACE
  const handleStartEdit = () => {
    if (!selectedNoteId) return;
    const note = notes.find((n) => n.id === selectedNoteId);
    setEditorNote({ ...note });
    setIsEditing(true);
    setError(null);
  };

  // PUBLIC_INTERFACE
  const handleNewNote = () => {
    setEditorNote({ id: "", title: "", content: "" });
    setIsEditing(true);
    setSelectedNoteId(null);
    setError(null);
  };

  // PUBLIC_INTERFACE
  const handleEditorChange = (field, value) => {
    setEditorNote((prev) => ({ ...prev, [field]: value }));
  };

  // PUBLIC_INTERFACE
  const handleSaveNote = async () => {
    const { title = "", content = "" } = editorNote || {};
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();
    if (!trimmedTitle && !trimmedContent) {
      alert("Please enter a title or content.");
      return;
    }
    setSaving(true);
    setError(null);
    if (!editorNote.id) {
      // New note
      try {
        const now = Date.now();
        const noteObj = {
          title: trimmedTitle || "Untitled",
          content: trimmedContent,
          created: now,
          updated: now,
        };
        const { error: supaErr, data } = await supabase
          .from("notes")
          .insert([noteObj])
          .select()
          .single();
        if (supaErr) throw supaErr;
        setNotes((prev) => [data, ...prev]);
        setSelectedNoteId(data.id);
        setIsEditing(false);
        setEditorNote(null);
      } catch (err) {
        setError("Failed to create note.");
      } finally {
        setSaving(false);
      }
    } else {
      // Edit existing note
      try {
        const now = Date.now();
        const { error: supaErr, data } = await supabase
          .from("notes")
          .update({
            title: trimmedTitle || "Untitled",
            content: trimmedContent,
            updated: now,
          })
          .eq("id", editorNote.id)
          .select()
          .single();
        if (supaErr) throw supaErr;
        setNotes((prev) =>
          prev.map((n) =>
            n.id === editorNote.id
              ? { ...data }
              : n
          )
        );
        setIsEditing(false);
        setEditorNote(null);
      } catch (err) {
        setError("Failed to update note.");
      } finally {
        setSaving(false);
      }
    }
  };

  // PUBLIC_INTERFACE
  const handleCancelEdit = () => {
    if (selectedNoteId) {
      setEditorNote(notes.find((n) => n.id === selectedNoteId));
      setIsEditing(false);
    } else {
      setEditorNote(null);
      setIsEditing(false);
    }
    setError(null);
  };

  // ----------------- COMPONENTS -----------------

  // Now, you can show config error fallback after hooks:
  if (configError) {
    return (
      <div style={{ padding: "2.5rem", textAlign: "center", color: "#b41010" }}>
        <h2>⚠️ App Configuration Error</h2>
        <p style={{ fontSize: "1.07rem", margin: "12px 0" }}>
          {configError}
        </p>
        <p style={{ color: "gray", marginTop: "1.7em" }}>
          Please check your environment variables or contact support.<br/>
          <code>REACT_APP_SUPABASE_URL / REACT_APP_SUPABASE_KEY</code>
        </p>
      </div>
    );
  }

  function Header() {
    // Minimal & responsive header with clean button alignment
    return (
      <header className="notes-header">
        <div className="notes-title">📝 Personal Notes</div>
        <div className="notes-header-actions">
          <button
            className="btn new-note-btn"
            onClick={handleNewNote}
            disabled={saving || loading}
          >
            + New Note
          </button>
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            {theme === "light" ? "🌙 Dark" : "☀️ Light"}
          </button>
        </div>
      </header>
    );
  }

  function NoteList() {
    return (
      <nav className="notes-list">
        {loading ? (
          <div className="notes-empty">Loading notes...</div>
        ) : notes.length === 0 ? (
          <div className="notes-empty">No notes yet.</div>
        ) : (
          <ul>
            {notes.map((note) => (
              <li
                key={note.id}
                className={note.id === selectedNoteId ? "selected" : ""}
                onClick={() => handleSelectNote(note.id)}
                tabIndex={0}
                aria-selected={note.id === selectedNoteId}
                style={deleting ? { opacity: 0.6, pointerEvents: 'none' } : {}}
              >
                <div className="note-title">{note.title}</div>
                <div className="note-meta">
                  <span>
                    {note.updated ? `${new Date(note.updated).toLocaleDateString()} ${new Date(note.updated).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}` : ""}
                  </span>
                  <button
                    className="btn small danger"
                    title="Delete note"
                    onClick={async (e) => {
                      e.stopPropagation();
                      await handleDeleteNote(note.id);
                    }}
                    aria-label="Delete note"
                    disabled={deleting}
                  >
                    🗑
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </nav>
    );
  }

  function NoteEditor() {
    // New or edit mode
    return (
      <div className="note-editor">
        <input
          className="note-title-input"
          type="text"
          placeholder="Title"
          value={editorNote?.title || ""}
          onChange={(e) => handleEditorChange("title", e.target.value)}
          disabled={saving}
        />
        <textarea
          className="note-content-input"
          placeholder="Write your note here..."
          value={editorNote?.content || ""}
          onChange={(e) => handleEditorChange("content", e.target.value)}
          rows={12}
          disabled={saving}
        />
        <div className="editor-actions">
          <button className="btn primary" onClick={handleSaveNote} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
          <button className="btn secondary" onClick={handleCancelEdit} disabled={saving}>
            Cancel
          </button>
        </div>
        {error && <div style={{ color: "red", marginTop: 10 }}>{error}</div>}
      </div>
    );
  }

  function NoteViewer() {
    if (!editorNote) {
      return (
        <div className="note-viewer note-viewer-empty">
          <span>{loading ? "Loading..." : "Select or create a note to view."}</span>
        </div>
      );
    }
    return (
      <div className="note-viewer">
        <div className="note-view-title">{editorNote.title}</div>
        <div className="note-view-meta">
          <span>
            Updated:{" "}
            {editorNote.updated
              ? new Date(editorNote.updated).toLocaleString(undefined, {
                  dateStyle: "short",
                  timeStyle: "short",
                })
              : ""}
          </span>
        </div>
        <div className="note-view-content">
          {editorNote.content ? (
            editorNote.content.split("\n").map((str, idx) => (
              <p key={idx}>{str}</p>
            ))
          ) : (
            <span className="note-view-placeholder">No content.</span>
          )}
        </div>
        <button className="btn edit-btn" onClick={handleStartEdit} disabled={saving || loading}>
          Edit
        </button>
        {error && <div style={{ color: "red", marginTop: 10 }}>{error}</div>}
      </div>
    );
  }

  // Main Layout
  return (
    <div className="notes-app-wrapper">
      <Header />
      <main className="notes-main">
        <section className="notes-pane notes-left">
          <NoteList />
        </section>
        <section className="notes-pane notes-right">
          {isEditing ? (
            <NoteEditor />
          ) : (
            <NoteViewer />
          )}
        </section>
      </main>
      <footer className="notes-footer">
        <span>
          Personal Notes Manager &copy; {new Date().getFullYear()} &ndash; Minimal React App
        </span>
        {/* For demonstration: .env display (hidden) */}
        <span style={{ display: "none" }}>
          {getEnv("SUPABASE_URL")} {getEnv("SUPABASE_KEY")}
        </span>
      </footer>
    </div>
  );
}

export default App;
