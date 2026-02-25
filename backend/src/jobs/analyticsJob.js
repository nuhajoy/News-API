const cron = require("node-cron");
const { v4: uuidv4 } = require("uuid");
const db = require("../config/db.config");

const queue = [];
let processing = false;

function enqueueAnalyticsJob(jobDate) {
  queue.push(jobDate);
  if (!processing) {
    processQueue();
  }
}

async function processQueue() {
  processing = true;

  while (queue.length > 0) {
    const jobDate = queue.shift();
    
    console.log("Processing analytics job for date", jobDate.toISOString().slice(0, 10));
    
    await runDailyAnalytics(jobDate);
  }

  processing = false;
}

async function runDailyAnalytics() {
  const insertSql = `
    INSERT INTO daily_analytics (id, article_id, view_count, date)
    SELECT
      UUID() AS id,
      rl.article_id,
      COUNT(*) AS view_count,
      DATE(CONVERT_TZ(rl.read_at, @@session.time_zone, '+00:00')) AS analytics_date
    FROM read_logs rl
    GROUP BY rl.article_id, analytics_date
    ON DUPLICATE KEY UPDATE view_count = VALUES(view_count);
  `;

  await db.query(insertSql);
}

cron.schedule(
  "0 0 * * *",
  () => {
    enqueueAnalyticsJob(new Date());
  },
  {
    timezone: "Etc/UTC",
  },
);

module.exports = {
  enqueueAnalyticsJob,
  runDailyAnalytics,
};

