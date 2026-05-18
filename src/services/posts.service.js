export function createPostsService(pool) {
  const getAllPosts = async () => {
    const result = await pool.query("SELECT * FROM posts ORDER BY id ASC");
    return result.rows;
  };

  const getPostById = async (id) => {
    const result = await pool.query("SELECT * FROM posts WHERE id = $1", [id]);
    return result.rows[0];
  };

  const getPostsByAuthorId = async (authorId) => {
    const authorCheck = await pool.query(
      "SELECT id FROM authors WHERE id = $1",
      [authorId],
    );
    if (!authorCheck.rows[0]) return null;

    const result = await pool.query(
      `SELECT posts.*, authors.name, authors.email, authors.bio
       FROM posts
       JOIN authors ON posts.author_id = authors.id
       WHERE posts.author_id = $1
       ORDER BY posts.created_at DESC`,
      [authorId],
    );
    return result.rows;
  };

  const createPost = async ({ title, content, author_id, published }) => {
    const result = await pool.query(
      "INSERT INTO posts (title, content, author_id, published) VALUES ($1, $2, $3, $4) RETURNING *",
      [title, content, author_id, published ?? false],
    );
    return result.rows[0];
  };

  const updatePost = async (id, { title, content, author_id, published }) => {
    const result = await pool.query(
      "UPDATE posts SET title = $1, content = $2, author_id = $3, published = $4 WHERE id = $5 RETURNING *",
      [title, content, author_id, published, id],
    );
    return result.rows[0];
  };

  const deletePost = async (id) => {
    const result = await pool.query(
      "DELETE FROM posts WHERE id = $1 RETURNING *",
      [id],
    );
    return result.rows[0];
  };

  return { getAllPosts, getPostById, getPostsByAuthorId, createPost, updatePost, deletePost };
}
