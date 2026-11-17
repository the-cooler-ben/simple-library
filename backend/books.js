
export default function validateBook(data) {
    if (typeof data.title !== "string") {
        return "Title is required";
    }
    if (!Array.isArray(data.authors)) {
        return "Authors must contain at least one name";
    }
    if (data.year != null && typeof data.year !== "number") {
        return "Year must be a number";
    }
    return null
}