import { query } from '../db.js';
import { sendError, HTTP_STATUS } from '../utils/response.js';

const DAILY_LIMIT_PER_TYPE = 3;
const WEEKLY_TOTAL_LIMIT = 10;

function startOfTodayISO() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return start.toISOString();
}

function startOfWeekISO() {
  const now = new Date();
  const day = now.getDay(); // 0=Sun ... 6=Sat
  const distanceFromMonday = (day + 6) % 7;
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - distanceFromMonday);
  return start.toISOString();
}

async function getSubmissionCounts(userId) {
  const fromToday = startOfTodayISO();
  const fromWeek = startOfWeekISO();

  const sql = `
    SELECT source, COUNT(*)::int AS count
    FROM (
      SELECT 'issue' AS source, created_at
      FROM issues
      WHERE user_id = $1 AND created_at >= $2
      UNION ALL
      SELECT 'campaign' AS source, created_at
      FROM campaigns
      WHERE user_id = $1 AND created_at >= $2
    ) combined
    GROUP BY source
  `;
  const dailyRows = await query(sql, [userId, fromToday]);

  const weeklySql = `
    SELECT COUNT(*)::int AS total
    FROM (
      SELECT created_at FROM issues WHERE user_id = $1 AND created_at >= $2
      UNION ALL
      SELECT created_at FROM campaigns WHERE user_id = $1 AND created_at >= $2
    ) combined
  `;
  const weeklyResult = await query(weeklySql, [userId, fromWeek]);

  const daily = { issue: 0, campaign: 0 };
  dailyRows.rows.forEach((row) => {
    if (row.source === 'issue') daily.issue = row.count;
    if (row.source === 'campaign') daily.campaign = row.count;
  });

  return {
    daily,
    weeklyTotal: weeklyResult.rows[0]?.total || 0,
  };
}

function buildLimitMessage(type) {
  const typeLabel = type === 'issue' ? 'issues' : 'campaigns';
  return `Daily limit reached: you can create up to ${DAILY_LIMIT_PER_TYPE} ${typeLabel} per day. Weekly total limit is ${WEEKLY_TOTAL_LIMIT}.`;
}

export function submissionLimiter(type) {
  return async (req, res, next) => {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, 'Unauthorized', HTTP_STATUS.UNAUTHORIZED);
    }

    const counts = await getSubmissionCounts(userId);

    if (type === 'issue' && counts.daily.issue >= DAILY_LIMIT_PER_TYPE) {
      return sendError(res, buildLimitMessage('issue'), HTTP_STATUS.TOO_MANY_REQUESTS);
    }

    if (type === 'campaign' && counts.daily.campaign >= DAILY_LIMIT_PER_TYPE) {
      return sendError(res, buildLimitMessage('campaign'), HTTP_STATUS.TOO_MANY_REQUESTS);
    }

    if (counts.weeklyTotal >= WEEKLY_TOTAL_LIMIT) {
      return sendError(
        res,
        `Weekly limit reached: you can create up to ${WEEKLY_TOTAL_LIMIT} issues/campaigns combined in a week.`,
        HTTP_STATUS.TOO_MANY_REQUESTS
      );
    }

    return next();
  };
}

