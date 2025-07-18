import React, { useState, useEffect } from "react";
import "./App.css";
import "./NotesApp.css";

/**
 * Gets environment variable (for future backend usage/Supabase integration)
 * @param {string} key - Env variable name
 * @param {string} fallback - Fallback value
 * @returns {string}
 */
// PUBLIC_INTERFACE
function getEnv(key, fallback = "") {
  // By default React scripts exposes only env vars prefixed with REACT_APP_
  return process.env[`REACT_APP_${key}`] || fallback;
}

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
  const [theme, setTheme] = useState("light");
  const [notes, setNotes] = useState(() =>
    // Use localStorage for persistence between page reloads
    {
      const localData = window.localStorage.getItem("notes");
      return localData ? JSON.parse(localData) : [];
    }
  );
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [editorNote, setEditorNote] = useState(null); // Copy for edit/new
  const [isEditing, setIsEditing] = useState(false);

  // Apply theme CSS variable root
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Save notes to localStorage
  useEffect(() => {
    window.localStorage.setItem("notes", JSON.stringify(notes));
  }, [notes]);

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
  const handleSelectNote = (id) => {
    setSelectedNoteId(id);
  };

  // PUBLIC_INTERFACE
  const handleDeleteNote = (id) => {
    if (!window.confirm("Delete this note?")) return;
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
  };

  // PUBLIC_INTERFACE
  const handleStartEdit = () => {
    if (!selectedNoteId) return;
    const note = notes.find((n) => n.id === selectedNoteId);
    setEditorNote({ ...note }); // Shallow copy for editing
    setIsEditing(true);
  };

  // PUBLIC_INTERFACE
  const handleNewNote = () => {
    setEditorNote({ id: "", title: "", content: "" });
    setIsEditing(true);
    setSelectedNoteId(null);
  };

  // PUBLIC_INTERFACE
  const handleEditorChange = (field, value) => {
    setEditorNote((prev) => ({ ...prev, [field]: value }));
  };

  // PUBLIC_INTERFACE
  const handleSaveNote = () => {
    const { title = "", content = "" } = editorNote || {};
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();
    if (!trimmedTitle && !trimmedContent) {
      alert("Please enter a title or content.");
      return;
    }
    if (!editorNote.id) {
      // New note
      const newId = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const newNote = {
        id: newId,
        title: trimmedTitle || "Untitled",
        content: trimmedContent,
        created: Date.now(),
        updated: Date.now(),
      };
      setNotes((prev) => [newNote, ...prev]);
      setSelectedNoteId(newId);
      setIsEditing(false);
      setEditorNote(null);
    } else {
      // Edit existing note
      setNotes((prev) =>
        prev.map((n) =>
          n.id === editorNote.id
            ? {
                ...n,
                title: trimmedTitle || "Untitled",
                content: trimmedContent,
                updated: Date.now(),
              }
            : n
        )
      );
      setIsEditing(false);
      setEditorNote(null);
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
  };

  // ----------------- COMPONENTS -----------------

  function Header() {
    return (
      <header className="notes-header">
        <div className="notes-title">📝 Personal Notes</div>
        <button className="btn new-note-btn" onClick={handleNewNote}>
          + New Note
        </button>
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          {theme === "light" ? "🌙 Dark" : "☀️ Light"}
        </button>
      </header>
    );
  }

  function NoteList() {
    return (
      <nav className="notes-list">
        {notes.length === 0 ? (
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
              >
                <div className="note-title">{note.title}</div>
                <div className="note-meta">
                  <span>
                    {new Date(note.updated).toLocaleDateString()}{" "}
                    {new Date(note.updated).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <button
                    className="btn small danger"
                    title="Delete note"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNote(note.id);
                    }}
                    aria-label="Delete note"
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
        />
        <textarea
          className="note-content-input"
          placeholder="Write your note here..."
          value={editorNote?.content || ""}
          onChange={(e) => handleEditorChange("content", e.target.value)}
          rows={12}
        />
        <div className="editor-actions">
          <button className="btn primary" onClick={handleSaveNote}>
            Save
          </button>
          <button className="btn secondary" onClick={handleCancelEdit}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  function NoteViewer() {
    if (!editorNote) {
      return (
        <div className="note-viewer note-viewer-empty">
          <span>Select or create a note to view.</span>
        </div>
      );
    }
    return (
      <div className="note-viewer">
        <div className="note-view-title">{editorNote.title}</div>
        <div className="note-view-meta">
          <span>
            Updated:{" "}
            {new Date(editorNote.updated).toLocaleString(undefined, {
              dateStyle: "short",
              timeStyle: "short",
            })}
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
        <button className="btn edit-btn" onClick={handleStartEdit}>
          Edit
        </button>
      </div>
    );
  }

  // For future Supabase/remote backend usage; currently just demonstrates reading .env config
  const SUPABASE_URL = getEnv("SUPABASE_URL");
  const SUPABASE_KEY = getEnv("SUPABASE_KEY");

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
          {SUPABASE_URL} {SUPABASE_KEY}
        </span>
      </footer>
    </div>
  );
}

export default App;
