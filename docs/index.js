function getOS() {
  const ua = navigator.userAgent;

  if (ua.includes('Windows')) {
    return 'windows';
  }

  if (ua.includes('Mac OS')) {
    return 'macos';
  }

  return null;
}

const $ = document.querySelector.bind(document);

// 判断 OS 高亮按钮或者显示不支持提示。
const os = getOS();

if (os === 'windows') {
  $('#download-windows').classList.add('recommend');
} else if (os === 'macos') {
  $('#download-macos').classList.add('recommend');
} else {
  $('#not-supported-tip').classList.add('show');
}

async function fetchReleaseInfoSwr(onDataUpdate) {
  async function fetchData() {
    const githubReleaseUrl =
      'https://api.github.com/repos/MoyuScript/double-mouse-downloader/releases';

    const fetchInstance = await fetch(githubReleaseUrl);
    return fetchInstance.json();
  }

  // 拉取 GitHub Release 信息，3 分钟内仅获取一次
  const releaseInfoKey = 'releaseInfo';
  let releaseInfo = JSON.parse(localStorage.getItem(releaseInfoKey));

  if (releaseInfo === null) {
    // 第一次拉取
    const resp = await fetchData();
    onDataUpdate && onDataUpdate(resp);
    localStorage.setItem(
      releaseInfoKey,
      JSON.stringify({
        nextFetchTime: Date.now() + 3 * 60000,
        data: resp,
      })
    );
  } else if (releaseInfo.nextFetchTime > Date.now()) {
    // 缓存未过期，使用缓存
    onDataUpdate && onDataUpdate(releaseInfo.data);
  } else {
    // SWR
    onDataUpdate && onDataUpdate(releaseInfo.data);
    const resp = await fetchData();
    onDataUpdate && onDataUpdate(resp);
    localStorage.setItem(
      releaseInfoKey,
      JSON.stringify({
        nextFetchTime: Date.now() + 3 * 60000,
        data: resp,
      })
    );
  }
}

fetchReleaseInfoSwr((data) => {
  const latestStableRelease = data.find((item) => !item.prerelease);
  const macosUrl = latestStableRelease.assets.find((item) =>
    item.name.endsWith('.dmg')
  ).browser_download_url;
  const windowsUrl = latestStableRelease.assets.find((item) =>
    item.name.endsWith('.exe')
  ).browser_download_url;

  $('#download-windows').href = windowsUrl;
  $('#download-macos').href = macosUrl;
});
