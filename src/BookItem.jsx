function BookItem({ book, onCheckout, onDelete}) {
    if (!book) return null;

    return (
        <li>
            <strong>{book.title}</strong> ({book.year ? book.year : "Unknown"}) <br />
            {Array.isArray(book.authors) ? book.authors.join(", ") : ""} <br />
            {book.checked_out ? "Checked Out" : "Available"}
            <button onClick={() => onCheckout(book.id)}>
                {book.checked_out ? "Return" : "Checkout"}
            </button>
            <button onClick={() => onDelete(book.id)}>
                Delete
            </button>
        </li>
    )
}

export default BookItem;