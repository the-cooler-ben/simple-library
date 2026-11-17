import { useState, useEffect } from 'react'
import BookForm from './BookForm.jsx'
import BookList from './BookList'
import LoginForm from './LoginForm.jsx'
import './app.css'

function App() {
  const API_BASE = "http://localhost:3000/api";
  const [books, setBooks] = useState([])
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      const res = await fetch(`${API_BASE}/books`);
      setBooks(await res.json());
      const me = await fetch(`${API_BASE}/me`, {
        credentials: "include",
      });
      if (me.ok) {
        setUser(await me.json());
      }
    }
    load();
  }, []);

    async function fetchBooks() {
      try {
        setLoading(true);
        setErrorMessage("");

        const response = await fetch(`${API_BASE}/books`);

        if (!response.ok) {
          const message = await response.json()
          throw new Error("Failed to fetch books");
        }
        const data = await response.json();
        setBooks(data);
      } catch (error) {
        setErrorMessage("Failed to get books. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    useEffect(() => {
      fetchBooks();
    }, []);

    async function addBook(newBook) {
      try {
        setLoading(true);
        setErrorMessage("");

        const response = await fetch(`${API_BASE}/books`, {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          credentials: "include",
          body: JSON.stringify({
            username: user.username,
            password: user.password,
          })
        })

        if (!response.ok) {
          const message = await response.text();
          throw new Error(message);
        }

        await fetchBooks();
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setLoading(false);
      }
    }

    async function toggleCheckout(id) {
      const book = books.find(b => b.id === id);
      if (!book) return;

      try {
        setLoading(true);
        setErrorMessage("");

        const response = await fetch(`${API_BASE}/books/${id}`, {
          method: "PUT",
          headers: {"Content-Type": "application/json"},
          credentials: "include",
          body: JSON.stringify({
            checked_out: !book.checked_out
          })
        })
        const text = await response.text();

        if (!response.ok) {
          throw new Error(text);
        }
        await fetchBooks();
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setLoading(false);
      }
    }

  async function handleLogout() {
    await fetch(`${API_BASE}/logout`, { method: "POST", credentials: "include" });
    setUser(null);
  }

  async function handleDelete(id) {
    const res = await fetch(`${API_BASE}/books/${id}`, { method: "DELETE", credentials: "include" });
    if (res.status === 401) {
      setUser(null);
      setMessage("Please log in again");
      return;
    }
    if (res.ok) {
      setBooks(books.filter((book) => book.id !== id));
    }
  }

  return (
    <>
      {loading && <p className='loading'>Loading...</p>}
      {!user && message && <p className="message">{message}</p>}
      {errorMessage && <p className="error">{errorMessage}</p>}
      <h1>Books</h1>
      {user ? (
          <p>Hi, {user.username}! <button onClick={handleLogout}>Log out</button></p>
      ) : (
          <LoginForm onLogin={setUser} />
      )}
      {!user && message && <p className="error">{message}</p>}
      {user && <BookForm onAdd={(book) => setBooks([...books, book])} />}
      <ul style={{listStyleType: "none"}}>
        {books.map((book) => (
            <li key={book.id}>
              {book.title} by {book.authors.join(", ")}
              {user && (<button onClick={() => toggleCheckout(book.id)}>{book.checked_out ? "Return" : "Checkout"}</button>)}
              {user && <button onClick={() => handleDelete(book.id)}>Delete</button>}
            </li>
        ))}
      </ul>
    </>
  )
}

export default App;