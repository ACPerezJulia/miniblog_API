import { Router } from "express";
import { createPostsService } from "../services/posts.service.js";
import { validatePost } from "../middlewares/validate.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import { notFound } from "../../errors.js";

export function createPostsRouter(pool) {
  const router = Router();
  const postsService = createPostsService(pool);

  router.get(
    "/",
    asyncHandler(async (req, res) => {
      const posts = await postsService.getAllPosts();
      res.json(posts);
    }),
  );

  router.get(
    "/author/:authorId",
    asyncHandler(async (req, res, next) => {
      const posts = await postsService.getPostsByAuthorId(req.params.authorId);
      if (!posts.length)
        return next(notFound("No se encontraron posts para ese autor"));
      res.json(posts);
    }),
  );

  router.get(
    "/:id",
    asyncHandler(async (req, res, next) => {
      const post = await postsService.getPostById(req.params.id);
      if (!post) return next(notFound("Post no encontrado"));
      res.json(post);
    }),
  );

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

  router.put(
    "/:id",
    validatePost,
    asyncHandler(async (req, res, next) => {
      const { title, content, author_id, published } = req.body;
      const post = await postsService.updatePost(req.params.id, {
        title,
        content,
        author_id,
        published,
      });
      if (!post) return next(notFound("Post no encontrado"));
      res.json(post);
    }),
  );

  router.delete(
    "/:id",
    asyncHandler(async (req, res, next) => {
      const post = await postsService.deletePost(req.params.id);
      if (!post) return next(notFound("Post no encontrado"));
      res.status(204).send();
    }),
  );

  return router;
}
