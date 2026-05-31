// إدارة التعليقات عبر GitHub GraphQL API (Discussions).
// نسخة مطابقة لـ admin/server.js — تستعمل نفس GITHUB_TOKEN (يحتاج صلاحية Discussions).

import { json } from '../index.js';

async function gql(env, query, variables = {}) {
  if (!env.GITHUB_TOKEN) throw new Error('NO_TOKEN');
  const r = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
      'User-Agent': 'GT-NEWSTECH-Admin-Worker',
    },
    body: JSON.stringify({ query, variables }),
  });
  const data = await r.json();
  if (data.errors) throw new Error(data.errors.map(e => e.message).join(', '));
  if (!r.ok) throw new Error(`GraphQL ${r.status}: ${JSON.stringify(data)}`);
  return data.data;
}

function repoParts(env) {
  const [owner, name] = (env.GITHUB_REPO || '').split('/');
  return { owner, name };
}

// GET /api/comments — قائمة النقاشات + التعليقات + الردود + التفاعلات
export async function listComments(env) {
  const { owner, name } = repoParts(env);
  try {
    const data = await gql(env, `
      query($owner: String!, $name: String!) {
        repository(owner: $owner, name: $name) {
          discussions(first: 50, orderBy: {field: UPDATED_AT, direction: DESC}) {
            totalCount
            nodes {
              id title url createdAt updatedAt locked
              author { login avatarUrl url }
              comments(first: 50) {
                totalCount
                nodes {
                  id body bodyHTML createdAt
                  isAnswer isMinimized minimizedReason
                  author { login avatarUrl url }
                  authorAssociation
                  reactions(first: 20) {
                    totalCount
                    nodes { content user { login } }
                  }
                  replies(first: 20) {
                    totalCount
                    nodes {
                      id body bodyHTML createdAt
                      isMinimized minimizedReason
                      author { login avatarUrl url }
                      authorAssociation
                    }
                  }
                }
              }
              reactionGroups {
                content
                users(first: 0) { totalCount }
              }
            }
          }
        }
      }
    `, { owner, name });
    return json(data.repository);
  } catch (e) {
    return json({ error: e.message }, 500);
  }
}

// POST /api/comments/reply  body: { discussionId, replyToId?, body }
export async function replyToDiscussion(env, req) {
  const body = await req.json().catch(() => ({}));
  const { discussionId, replyToId, body: text } = body;
  if (!discussionId || !text) return json({ error: 'discussionId و body مطلوبان' }, 400);
  try {
    const input = { discussionId, body: text };
    if (replyToId) input.replyToId = replyToId;
    const data = await gql(env, `
      mutation($input: AddDiscussionCommentInput!) {
        addDiscussionComment(input: $input) {
          comment { id body createdAt }
        }
      }
    `, { input });
    return json({ ok: true, comment: data.addDiscussionComment.comment });
  } catch (e) {
    return json({ error: e.message }, 500);
  }
}

// POST /api/comments/:id/hide
const VALID_CLASSIFIERS = ['OFF_TOPIC', 'SPAM', 'ABUSE', 'OUTDATED', 'DUPLICATE', 'RESOLVED'];
export async function hideComment(env, req, id) {
  const body = await req.json().catch(() => ({}));
  const classifier = body.reason || 'OFF_TOPIC';
  if (!VALID_CLASSIFIERS.includes(classifier)) {
    return json({ error: 'reason غير صالح' }, 400);
  }
  try {
    const data = await gql(env, `
      mutation($input: MinimizeCommentInput!) {
        minimizeComment(input: $input) {
          minimizedComment { isMinimized minimizedReason }
        }
      }
    `, { input: { subjectId: id, classifier } });
    return json({ ok: true, ...data.minimizeComment.minimizedComment });
  } catch (e) {
    return json({ error: e.message }, 500);
  }
}

// POST /api/comments/:id/unhide
export async function unhideComment(env, id) {
  try {
    await gql(env, `
      mutation($id: ID!) {
        unminimizeComment(input: { subjectId: $id }) {
          unminimizedComment { ... on DiscussionComment { isMinimized } }
        }
      }
    `, { id });
    return json({ ok: true });
  } catch (e) {
    return json({ error: e.message }, 500);
  }
}

// DELETE /api/comments/:id
export async function deleteComment(env, id) {
  try {
    await gql(env, `
      mutation($id: ID!) {
        deleteDiscussionComment(input: { id: $id }) {
          comment { id }
        }
      }
    `, { id });
    return json({ ok: true });
  } catch (e) {
    return json({ error: e.message }, 500);
  }
}

// POST /api/comments/discussion/:id/lock
export async function lockDiscussion(env, id) {
  try {
    await gql(env, `
      mutation($id: ID!) {
        lockLockable(input: { lockableId: $id, lockReason: SPAM }) {
          lockedRecord { ... on Discussion { locked } }
        }
      }
    `, { id });
    return json({ ok: true });
  } catch (e) {
    return json({ error: e.message }, 500);
  }
}

// POST /api/comments/discussion/:id/unlock
export async function unlockDiscussion(env, id) {
  try {
    await gql(env, `
      mutation($id: ID!) {
        unlockLockable(input: { lockableId: $id }) {
          unlockedRecord { ... on Discussion { locked } }
        }
      }
    `, { id });
    return json({ ok: true });
  } catch (e) {
    return json({ error: e.message }, 500);
  }
}
