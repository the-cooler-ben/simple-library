import { useState } from 'react'
import './index.css'

function BookForm({ onAdd }) {
    const [title, setTitle] = useState('');
    const [year, setYear] = useState('');
    const [authors, setAuthors] = useState('');
    const [titleError, setTitleError] = useState('');
    const [authorsError, setAuthorsError] = useState('');

    function handleSubmit(e) {
        e.preventDefault();

        let hasError = false;
        if (!title.trim()) {
            setTitleError('Title is required');
            hasError = true;
        }
        if (!authors.trim()) {
            setAuthorsError('Author(s) are required');
            hasError = true;
        }
        if (hasError) return;

        setTitleError('');
        setAuthorsError('')

        const authorList = authors
            .split(",")
            .map(a => a.trim())
            .filter(a => a.length > 0);

        const newBook = {
            title: title.trim(),
            authors: authorList,
            year: year ? Number(year) : null,
            checked_out: false
        };

        onAdd(newBook);

        setTitle('');
        setYear('');
        setAuthors('');
    }

    return (
        <form onSubmit={handleSubmit}>
            {titleError && <p className='error'>{titleError}</p>}
            {authorsError && <p className='error'>{authorsError}</p>}
            <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            />

            <input
                type="number"
                placeholder="Year Published"
                value={year}
                onChange={e => setYear(e.target.value)}
            />

            <input
                type="text"
                placeholder="Author(s)"
                value={authors}
                onChange={e => setAuthors(e.target.value)}
            />

            <button type="submit">Add Book</button>
        </form>
    )
}

export default BookForm;