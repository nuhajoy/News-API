const db = require("../config/db.config");
const { v4: uuidv4 } = require("uuid");
const { buildBaseResponse, buildPaginatedResponse } = require("../utils/response");

function getPaginationParams(req) {
  const pageNumber = Number(req.query.pageNumber) || 1;
  const pageSize = Number(req.query.pageSize) || 10;
  const offset = (pageNumber - 1) * pageSize;
  return { pageNumber, pageSize, offset };
}

async function createArticle(req, res, next) {
  const { title, content, category, status } = req.body;
  const authorId = req.user.id;

  try {
    const id = uuidv4();
    const finalStatus = status || "Draft";

    await db.query(
      "INSERT INTO articles (id, title, content, category, status, author_id) VALUES (?, ?, ?, ?, ?, ?)",
      [id, title, content, category, finalStatus, authorId],
    );

    const article = {
      id,
      title,
      content,
      category,
      status: finalStatus,
      author_id: authorId,
    };

    const response = buildBaseResponse(true, "Article created successfully", article, null);
    return res.status(201).json(response);
  } catch (err) {
    return next(err);
  }
}

async function updateArticle(req, res, next) {
  const articleId = req.params.id;
  const { title, content, category, status } = req.body;
  const authorId = req.user.id;

  try {
    const rows = await db.query("SELECT * FROM articles WHERE id = ?", [articleId]);
    if (rows.length === 0) {
      const response = buildBaseResponse(false, "Article not found", null, ["Not found"]);
      return res.status(404).json(response);
    }

    const article = rows[0];

    if (article.author_id !== authorId) {
      const response = buildBaseResponse(false, "Forbidden", null, ["Forbidden"]);
      return res.status(403).json(response);
    }

    await db.query(
      "UPDATE articles SET title = ?, content = ?, category = ?, status = ? WHERE id = ?",
      [title, content, category, status || article.status, articleId],
    );

    const updated = {
      id: articleId,
      title,
      content,
      category,
      status: status || article.status,
    };

    const response = buildBaseResponse(true, "Article updated successfully", updated, null);
    return res.status(200).json(response);
  } catch (err) {
    return next(err);
  }
}

async function deleteArticle(req, res, next) {
  const articleId = req.params.id;
  const authorId = req.user.id;

  try {
    const rows = await db.query("SELECT * FROM articles WHERE id = ?", [articleId]);
    if (rows.length === 0) {
      const response = buildBaseResponse(false, "Article not found", null, ["Not found"]);
      return res.status(404).json(response);
    }

    const article = rows[0];

    if (article.author_id !== authorId) {
      const response = buildBaseResponse(false, "Forbidden", null, ["Forbidden"]);
      return res.status(403).json(response);
    }

    if (article.deleted_at) {
      const response = buildBaseResponse(false, "Article already deleted", null, ["Already deleted"]);
      return res.status(400).json(response);
    }

    await db.query("UPDATE articles SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?", [articleId]);

    const response = buildBaseResponse(true, "Article deleted successfully", null, null);
    return res.status(200).json(response);
  } catch (err) {
    return next(err);
  }
}

async function getMyArticles(req, res, next) {
  const authorId = req.user.id;
  const includeDeleted = String(req.query.includeDeleted || "").toLowerCase() === "true";
  const { pageNumber, pageSize, offset } = getPaginationParams(req);

  try {
    const whereSoftDelete = includeDeleted ? "" : "AND deleted_at IS NULL";

    const listQuery = `
      SELECT id, title, content, category, status, created_at, deleted_at
      FROM articles
      WHERE author_id = ? ${whereSoftDelete}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM articles
      WHERE author_id = ? ${whereSoftDelete}
    `;

    const articles = await db.query(listQuery, [authorId, pageSize, offset]);
    const countRows = await db.query(countQuery, [authorId]);
    const totalSize = countRows[0].total;

    const objects = articles.map((a) => ({
      id: a.id,
      title: a.title,
      status: a.status,
      category: a.category,
      createdAt: a.created_at,
      deleted: !!a.deleted_at,
    }));

    const response = buildPaginatedResponse(
      "Author articles fetched successfully",
      objects,
      pageNumber,
      pageSize,
      totalSize,
    );

    return res.status(200).json(response);
  } catch (err) {
    return next(err);
  }
}

async function getPublicArticles(req, res, next) {
  const { category, author, q } = req.query;
  const { pageNumber, pageSize, offset } = getPaginationParams(req);

  try {
    const filters = ["a.status = 'Published'", "a.deleted_at IS NULL"];
    const params = [];

    if (category) {
      filters.push("a.category = ?");
      params.push(category);
    }

    if (author) {
      filters.push("u.name LIKE ?");
      params.push(`%${author}%`);
    }

    if (q) {
      filters.push("a.title LIKE ?");
      params.push(`%${q}%`);
    }

    const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

    const listQuery = `
      SELECT a.id, a.title, a.category, a.created_at, u.name as author_name
      FROM articles a
      JOIN users u ON u.id = a.author_id
      ${whereClause}
      ORDER BY a.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM articles a
      JOIN users u ON u.id = a.author_id
      ${whereClause}
    `;

    const listParams = params.concat([pageSize, offset]);
    const articles = await db.query(listQuery, listParams);
    const countRows = await db.query(countQuery, params);
    const totalSize = countRows[0].total;

    const objects = articles.map((a) => ({
      id: a.id,
      title: a.title,
      category: a.category,
      authorName: a.author_name,
      createdAt: a.created_at,
    }));

    const response = buildPaginatedResponse(
      "Articles fetched successfully",
      objects,
      pageNumber,
      pageSize,
      totalSize,
    );

    return res.status(200).json(response);
  } catch (err) {
    return next(err);
  }
}

async function getArticleById(req, res, next) {
  const articleId = req.params.id;
  const readerId = req.user ? req.user.id : null;

  try {
    const rows = await db.query(
      "SELECT a.*, u.name as author_name FROM articles a JOIN users u ON u.id = a.author_id WHERE a.id = ? AND a.deleted_at IS NULL",
      [articleId],
    );

    if (rows.length === 0) {
      const response = buildBaseResponse(false, "News article no longer available", null, ["Not available"]);
      return res.status(404).json(response);
    }

    const article = rows[0];

    const articleObject = {
      id: article.id,
      title: article.title,
      content: article.content,
      category: article.category,
      status: article.status,
      authorName: article.author_name,
      createdAt: article.created_at,
    };

    const response = buildBaseResponse(true, "Article fetched successfully", articleObject, null);
    res.status(200).json(response);

    setImmediate(async () => {
      try {
        const id = uuidv4();
        await db.query(
          "INSERT INTO read_logs (id, article_id, reader_id) VALUES (?, ?, ?)",
          [id, articleId, readerId],
        );
      } catch (logErr) {
        // keep logging silent to avoid leaking internal details
        // eslint-disable-next-line no-console
        console.error("Failed to insert read log", logErr.message || logErr);
      }
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  createArticle,
  updateArticle,
  deleteArticle,
  getMyArticles,
  getPublicArticles,
  getArticleById,
};

