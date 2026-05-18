export function createAuthorsService(pool) {
  const getAllAuthors = async ({ page = 1, limit = 10 } = {}) => {
    const offset = (page - 1) * limit;
    const [dataResult, countResult] = await Promise.all([
      pool.query("SELECT * FROM authors ORDER BY id ASC LIMIT $1 OFFSET $2", [limit, offset]),
      pool.query("SELECT COUNT(*) FROM authors"),
    ]);
    return {
      data: dataResult.rows,
      total: parseInt(countResult.rows[0].count),
      page,
      limit,
    };
  };

  const getAuthorById = async (id) => {
    const result = await pool.query("SELECT * FROM authors WHERE id = $1", [id]);
    return result.rows[0];
  };

  const createAuthor = async ({ name, email, bio }) => {
    const result = await pool.query(
      "INSERT INTO authors (name, email, bio) VALUES ($1, $2, $3) RETURNING *",
      [name, email, bio],
    );
    return result.rows[0];
  };

  const updateAuthor = async (id, { name, email, bio }) => {
    const result = await pool.query(
      "UPDATE authors SET name = $1, email = $2, bio = $3 WHERE id = $4 RETURNING *",
      [name, email, bio, id],
    );
    return result.rows[0];
  };

  const deleteAuthor = async (id) => {
    const result = await pool.query(
      "DELETE FROM authors WHERE id = $1 RETURNING *",
      [id],
    );
    return result.rows[0];
  };

  return { getAllAuthors, getAuthorById, createAuthor, updateAuthor, deleteAuthor };
}
