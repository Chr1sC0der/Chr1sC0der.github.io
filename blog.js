// Shared blog logic for blog.html and write.html.
// Posts live in localStorage under STORAGE_KEY, so they are visible only in this browser.
var Blog = (function () {
  var STORAGE_KEY = 'blog.posts';
  var ALLOWED_TAGS = ['B', 'STRONG', 'I', 'EM', 'A', 'H2', 'UL', 'OL', 'LI', 'BLOCKQUOTE', 'BR', 'P', 'DIV'];

  function loadPosts() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var posts = raw ? JSON.parse(raw) : [];
      return Array.isArray(posts) ? posts : [];
    } catch (e) {
      return [];
    }
  }

  // Returns null on success, or an error message string.
  function savePosts(posts) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
      return null;
    } catch (e) {
      if (e && (e.name === 'QuotaExceededError' || e.code === 22)) {
        return 'Storage is full. Remove a post or use fewer/smaller photos.';
      }
      return 'Could not save: browser storage is unavailable (private window or blocked site data).';
    }
  }

  function storageAvailable() {
    try {
      var k = STORAGE_KEY + '.test';
      localStorage.setItem(k, '1');
      localStorage.removeItem(k);
      return true;
    } catch (e) {
      return false;
    }
  }

  function newId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  // A post is live when published, or queued with a publish time that has passed.
  function isLive(post, now) {
    now = now || Date.now();
    if (post.state === 'published') return true;
    if (post.state === 'queued') return new Date(post.publishAt).getTime() <= now;
    return false;
  }

  // The date a post is shown under: when it went live.
  function displayDate(post) {
    return post.state === 'queued' ? post.publishAt : post.createdAt;
  }

  function isSafeUrl(url) {
    return /^(https?:|mailto:)/i.test(url);
  }

  // Copies `html` into a fragment keeping only allow-listed tags and safe link hrefs.
  function sanitize(html) {
    var doc = new DOMParser().parseFromString('<body>' + html + '</body>', 'text/html');
    var out = document.createDocumentFragment();
    (function walk(src, dest) {
      Array.prototype.forEach.call(src.childNodes, function (node) {
        if (node.nodeType === 3) {
          dest.appendChild(document.createTextNode(node.nodeValue));
        } else if (node.nodeType === 1) {
          if (ALLOWED_TAGS.indexOf(node.tagName) === -1) {
            walk(node, dest); // drop the element, keep its text/children
            return;
          }
          var el = document.createElement(node.tagName);
          if (node.tagName === 'A') {
            var href = node.getAttribute('href') || '';
            if (isSafeUrl(href)) {
              el.setAttribute('href', href);
              el.setAttribute('rel', 'noopener noreferrer');
            }
          }
          walk(node, el);
          dest.appendChild(el);
        }
      });
    })(doc.body, out);
    return out;
  }

  function el(tag, className, text) {
    var e = document.createElement(tag);
    if (className) e.className = className;
    if (text != null) e.textContent = text;
    return e;
  }

  function formatDate(iso) {
    var d = new Date(iso);
    return isNaN(d) ? '' : d.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
  }

  // Builds the DOM for one post. `opts.tagHref(tag)` makes tags links; otherwise they are plain chips.
  function renderPost(post, opts) {
    opts = opts || {};
    var article = el('article', 'post post-' + post.type);

    if (post.type === 'photo') {
      var photos = el('div', 'post-photos');
      (post.photos || []).forEach(function (src) {
        var img = el('img');
        img.src = src;
        img.alt = '';
        photos.appendChild(img);
      });
      article.appendChild(photos);
      if (post.caption) article.appendChild(el('p', 'post-caption', post.caption));
    } else if (post.type === 'link') {
      var heading = el('h2', 'post-title');
      if (isSafeUrl(post.url || '')) {
        var a = el('a', null, post.title || post.url);
        a.href = post.url;
        a.rel = 'noopener noreferrer';
        heading.appendChild(a);
      } else {
        heading.textContent = post.title || post.url || '';
      }
      article.appendChild(heading);
      if (post.url) article.appendChild(el('p', 'post-url', post.url));
      if (post.body) article.appendChild(el('p', 'post-caption', post.body));
    } else {
      if (post.title) article.appendChild(el('h2', 'post-title', post.title));
      var body = el('div', 'post-body');
      body.appendChild(sanitize(post.body || ''));
      article.appendChild(body);
    }

    var meta = el('footer', 'post-meta');
    var time = el('time', null, formatDate(displayDate(post)));
    time.dateTime = displayDate(post) || '';
    meta.appendChild(time);
    (post.tags || []).forEach(function (tag) {
      var chip;
      if (opts.tagHref) {
        chip = el('a', 'tag', '#' + tag);
        chip.href = opts.tagHref(tag);
      } else {
        chip = el('span', 'tag', '#' + tag);
      }
      meta.appendChild(chip);
    });
    article.appendChild(meta);
    return article;
  }

  return {
    loadPosts: loadPosts,
    savePosts: savePosts,
    storageAvailable: storageAvailable,
    newId: newId,
    isLive: isLive,
    displayDate: displayDate,
    isSafeUrl: isSafeUrl,
    sanitize: sanitize,
    renderPost: renderPost,
    formatDate: formatDate,
    el: el
  };
})();
