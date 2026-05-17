import { Router } from "express";
import postsService from "../services/posts.service.js";
import { validatePost } from "../middlewares/validate.js";
import asyncHandler from "../middlewares/asyncHandler.js";

const router = Router();

// Obtener todos los posts
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const posts = await postsService.getAllPosts();
    res.json(posts);
  }),
);

// Obtener posts de un autor con sus datos (debe ir antes de /:id)
router.get(
  "/author/:authorId",
  asyncHandler(async (req, res) => {
    const posts = await postsService.getPostsByAuthorId(req.params.authorId);
    if (!posts.length)
      return res
        .status(404)
        .json({ error: "No se encontraron posts para ese autor" });
    res.json(posts);
  }),
);

// Obtener un post por ID
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const post = await postsService.getPostById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post no encontrado" });
    res.json(post);
  }),
);

// Crear un post
router.post(
  "/",
  validatePost,
  asyncHandler(async (req, res) => {
    const { title, content, author_id, published } = req.body;
    const post = await postsService.createPost({
      title,
      content,
      author_id,
      published,
    });
    res.status(201).json(post);
  }),
);

// Actualizar un post
router.put(
  "/:id",
  validatePost,
  asyncHandler(async (req, res) => {
    const { title, content, author_id, published } = req.body;
    const post = await postsService.updatePost(req.params.id, {
      title,
      content,
      author_id,
      published,
    });
    if (!post) return res.status(404).json({ error: "Post no encontrado" });
    res.json(post);
  }),
);

// Eliminar un post
router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const post = await postsService.deletePost(req.params.id);
    if (!post) return res.status(404).json({ error: "Post no encontrado" });
    res.status(204).send();
  }),
);

export default router;
