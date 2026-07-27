import { Octokit } from '@octokit/rest';

const OWNER = 'mavinash-dev';
const REPO  = 'badminton-squad';
const PATH  = 'history.json';

const IS_LOCAL = !import.meta.env.VITE_GH_PAT;

const octokit = IS_LOCAL ? null : new Octokit({ auth: import.meta.env.VITE_GH_PAT });

export async function readHistory() {
  if (IS_LOCAL) {
    const res = await fetch('/history.local.json');
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
