import { Octokit } from '@octokit/rest';

const OWNER = 'mavinash-dev';
const REPO = 'badminton-squad';
const PATH = 'history.json';

const octokit = new Octokit({ auth: import.meta.env.VITE_GH_PAT });

export async function readHistory() {
  const { data } = await octokit.repos.getContent({ owner: OWNER, repo: REPO, path: PATH });
  return {
    data: JSON.parse(atob(data.content.replace(/\n/g, ''))),
    sha: data.sha,
  };
}

export async function writeHistory(newData, sha, sessionDate) {
  await octokit.repos.createOrUpdateFileContents({
    owner: OWNER,
    repo: REPO,
    path: PATH,
    message: `session: ${sessionDate}`,
    content: btoa(unescape(encodeURIComponent(JSON.stringify(newData, null, 2)))),
    sha,
  });
}
