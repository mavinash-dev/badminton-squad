import { Octokit } from '@octokit/rest';

const OWNER = 'mavinash-dev';
const REPO  = 'badminton-squad';
const PATH  = 'history.json';

const PAT = import.meta.env.VITE_GH_PAT || '';
// Treat as local if PAT is absent or still the placeholder
const IS_LOCAL = !PAT || PAT.startsWith('your_');

const octokit = IS_LOCAL ? null : new Octokit({ auth: PAT });

export async function readHistory() {
  if (IS_LOCAL) {
    // BASE_URL includes the Vite base path (e.g. /badminton-squad/)
    const res = await fetch(import.meta.env.BASE_URL + 'history.local.json');
    if (!res.ok) throw new Error('history.local.json not found in public/');
    const data = await res.json();
    return { data, sha: 'local' };
  }
  const { data } = await octokit.repos.getContent({ owner: OWNER, repo: REPO, path: PATH });
  return {
    data: JSON.parse(atob(data.content.replace(/\n/g, ''))),
    sha: data.sha,
  };
}

export async function writeHistory(newData, sha, sessionDate) {
  if (IS_LOCAL) {
    // In local dev, log the write but don't persist — restart resets to history.local.json
    console.info('[local-dev] writeHistory (no-op):', sessionDate, newData);
    return;
  }
  await octokit.repos.createOrUpdateFileContents({
    owner: OWNER,
    repo: REPO,
    path: PATH,
    message: `session: ${sessionDate}`,
    content: btoa(unescape(encodeURIComponent(JSON.stringify(newData, null, 2)))),
    sha,
  });
}
