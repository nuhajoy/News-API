const db = require("../config/db.config");
const { buildPaginatedResponse } = require("../utils/response");

function getPaginationParams(req) {
  const pageNumber = Number(req.query.pageNumber) || 1;
  const pageSize = Number(req.query.pageSize) || 10;
  const offset = (pageNumber - 1) * pageSize;
  return { pageNumber, pageSize, offset };
}

async function getDashboard(req, res, next) {
  const authorId = req.user.id;
  const { pageNumber, pageSize, offset } = getPaginationParams(req);

  try {
    const listQuery = `
      SELECT a.id,
             a.title,
             a.created_at,
             COALESCE(SUM(d.view_count), 0) AS total_views
      FROM articles a
      LEFT JOIN daily_analytics d ON d.article_id = a.id
      WHERE a.author_id = ?
        AND a.deleted_at IS NULL
      GROUP BY a.id, a.title, a.created_at
      ORDER BY a.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM articles a
      WHERE a.author_id = ?
        AND a.deleted_at IS NULL
    `;

    const rows = await db.query(listQuery, [authorId, pageSize, offset]);
    const countRows = await db.query(countQuery, [authorId]);

    const totalSize = countRows[0].total;

    const objects = rows.map((row) => ({
      id: row.id,
      title: row.title,
      createdAt: row.created_at,
      totalViews: row.total_views,
    }));

    const response = buildPaginatedResponse(
      "Author dashboard fetched successfully",
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

module.exports = {
  getDashboard,
};

