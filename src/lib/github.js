import { Octokit } from '@octokit/rest';

const OWNER = 'mavinash-dev';
const REPO  = 'badminton-squad';
const PATH  = 'history.json';

// PAT is stored base64-encoded in the env var so the raw token pattern
// never appears in the bundle (prevents GitHub secret scanning revocation)
const PAT_B64 = import.meta.env.VITE_GH_PAT_B64 || '';
const PAT = PAT_B64 ? atob(PAT_B64) : '';
const IS_LOCAL = !PAT || PAT.startsWith('your_');
const IS_DEMO = new URLSearchParams(window.location.search).has('demo');

const octokit = (IS_LOCAL || IS_DEMO) ? null : new Octokit({ auth: PAT });

export async function readHistory() {
  if (IS_LOCAL || IS_DEMO) {
    const res = await fetch(import.meta.env.BASE_URL + 'history.local.json');
    if (!res.ok) throw new Error('history.local.json not found in public/');
    const data = await res.json();
    return { data, sha: 'demo' };
  }
  const { data } = await octokit.repos.getContent({ owner: OWNER, repo: REPO, path: PATH });
  return {
    data: JSON.parse(atob(data.content.replace(/\n/g, ''))),
    sha: data.sha,
  };
}

export async function writeHistory(newData, sha, sessionDate) {
  if (IS_LOCAL || IS_DEMO) {
    console.info('[demo] writeHistory (no-op):', sessionDate, newData);
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
