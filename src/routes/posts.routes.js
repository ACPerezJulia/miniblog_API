import { Router } from "express";
import postsService from "../services/posts.service.js";
import { validatePost } from "../middlewares/validate.js";

const router = Router();

// Obtener todos los posts
router.get("/", async (req, res, next) => {
  try {
    const posts = await postsService.getAllPosts();
    res.json(posts);
  } catch (error) {
    next(error);
  }
});

// Obtener posts de un autor con sus datos (debe ir antes de /:id)
router.get("/author/:authorId", async (req, res, next) => {
  try {
    const posts = await postsService.getPostsByAuthorId(req.params.authorId);
    if (!posts.length)
      return res
        .status(404)
        .json({ error: "No se encontraron posts para ese autor" });
    res.json(posts);
  } catch (error) {
    next(error);
  }
});

// Obtener un post por ID
router.get("/:id", async (req, res, next) => {
  try {
    const post = await postsService.getPostById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post no encontrado" });
    res.json(post);
  } catch (error) {
    next(error);
  }
});

// Crear un post
router.post("/", validatePost, async (req, res, next) => {
  try {
    const { title, content, author_id, published } = req.body;
    const post = await postsService.createPost({
      title,
      content,
      author_id,
      published,
    });
    res.status(201).json(post);
  } catch (error) {
    next(error);
  }
});

// Actualizar un post
router.put("/:id", validatePost, async (req, res, next) => {
  try {
    const { title, content, author_id, published } = req.body;
    const post = await postsService.updatePost(req.params.id, {
      title,
      content,
      author_id,
      published,
    });
    if (!post) return res.status(404).json({ error: "Post no encontrado" });
    res.json(post);
  } catch (error) {
    next(error);
  }
});

// Eliminar un post
router.delete("/:id", async (req, res, next) => {
  try {
    const post = await postsService.deletePost(req.params.id);
    if (!post) return res.status(404).json({ error: "Post no encontrado" });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
