// Google Drive share links (drive.google.com/file/d/<id>/view, open?id=<id>)
// point at an HTML page, not a video file, so <video> can't play them. Drive
// only allows playback through its own embedded player, so we return that
// player's URL, or null when the link isn't a Drive file.
export function driveEmbedUrl(url) {
  if (!url || !/drive\.google\.com/.test(url)) return null;
  const m = /\/file\/d\/([\w-]+)/.exec(url) || /[?&]id=([\w-]+)/.exec(url);
  return m ? `https://drive.google.com/file/d/${m[1]}/preview` : null;
}
