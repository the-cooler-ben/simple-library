import BookItem from './BookItem'
import './index.css'

function BookList({ books, onCheckout, onDelete }) {
    return (
        <ul style={{ listStyle: 'none' }}>
            {books.map(book => (
                <BookItem
                    key={book.id}
                    book={book}
                    onCheckout={onCheckout}
                    onDelete={onDelete}
                />
            ))}
        </ul>
    )
}

export default BookList;