# ouk.ac.ke — SEO spam hack audit & remediation

**Scan date:** 23 Jul 2026  
**Target:** https://ouk.ac.ke/ (Open University of Kenya — Drupal 10 public site)  
**Scope:** External HTML scan + Google index signals. Remediation runs on the **OUK Drupal server**, not in this SHAPE repo.

---

## Verdict

**The main site is compromised.** Hidden Indonesian gambling SEO spam (`slot gacor`, `pena88`, `angkot88`, etc.) is injected into live page HTML using `visibility:hidden` / `display:none`. Google has already indexed that spam in snippets.

This is **not** a Google glitch. Clean content first, then re-index.

---

## About the Google “OUK” screenshot

| What you saw | What it means |
|---|---|
| `my.ouk.ac.ke` — OUK Email | Legitimate OUK subdomain |
| `stamforduniversity.edu.bd` — Bandar Toto / slot | **Not your site.** Another `.edu` domain SEO-spammed for the letters “OUK” |
| `ouk.kuccps.net` / `admissions.ouk.ac.ke` | Legitimate portals |
| `ouk.ac.ke` weak / weird for brand query | Your homepage **is** infected with hidden spam, which hurts brand search |

---

## Findings

| Severity | Finding | Evidence |
|---|---|---|
| Critical | Hidden gambling SEO spam on homepage | Homepage HTML: `visibility:hidden` blocks + dofollow spam links; **36+** “slot” mentions |
| Critical | Spam already in Google’s index | `site:ouk.ac.ke slot OR gacor` returns OUK URLs with gambling snippets |
| High | Multiple pages infected | `/information-literacy`, `/curriculum-and-content-development-dec`, some news/article nodes |
| Medium | Canonical is `/home` | `<link rel="canonical" href="https://ouk.ac.ke/home" />` while `/` also serves home |
| Medium | Drupal + Gaviasthemes stack | Drupal **10.5.6**, theme `gavias_facdori`, modules `gavias_sliderlayer` / `gavias_content_builder` |
| Low | Weak security headers | No HSTS/CSP observed; `Server: nginx/1.18.0` leaked |

### Confirmed infected URLs (examples)

- https://ouk.ac.ke/
- https://ouk.ac.ke/home
- https://ouk.ac.ke/information-literacy
- https://ouk.ac.ke/curriculum-and-content-development-dec
- https://ouk.ac.ke/huawei-kenya-equity-group-foundation-and-open-university-kenya-partner-launch-huawei-ict-academy

---

## 0) Verify from your laptop (before / after cleanup)

```bash
# Homepage headers / CMS fingerprint
curl -sI https://ouk.ac.ke/ | head -30

# Count spam keywords on live homepage
curl -sL https://ouk.ac.ke/ -o /tmp/ouk-home.html
rg -ic 'slot|gacor|pena88|angkot88|visibility:hidden|display:none' /tmp/ouk-home.html

# Show hidden spam snippets
rg -n -i 'slot gacor|pena88|angkot88|visibility:hidden' /tmp/ouk-home.html | head -40

# Spot-check other pages
for p in / /home /information-literacy /curriculum-and-content-development-dec /history-ouk /careers; do
  hits=$(curl -sL --max-time 20 "https://ouk.ac.ke$p" | rg -ic 'slot gacor|pena88|angkot88|royalhoki|laskar288' || true)
  echo "$hits  $p"
done

# After cleanup, every line below should print 0
for p in / /home /information-literacy /curriculum-and-content-development-dec; do
  hits=$(curl -sL --max-time 20 "https://ouk.ac.ke$p" | rg -ic 'slot|gacor|pena88|angkot88' || true)
  echo "AFTER: $hits  $p"
done
```

Google check (browser):

- https://www.google.com/search?q=site%3Aouk.ac.ke+slot+OR+gacor

---

## 1) Contain access (do this first)

SSH into the OUK web server, then:

```bash
# Who is logged into Drupal as admin recently? (Drush)
cd /var/www/html   # <-- adjust to real Drupal root
# Common paths: /var/www/ouk.ac.ke/web  OR  /var/www/html/web  OR  /home/*/public_html

pwd
ls -la
test -f web/index.php && echo "Drupal root may be ./web" || true
test -f index.php && rg -n "Drupal" index.php | head || true

# List users with administrator role (Drush 12+)
drush user:role:list
drush sql:query "SELECT u.uid, u.name, u.mail, u.status, FROM_UNIXTIME(u.access) AS last_access
FROM users_field_data u
INNER JOIN user__roles r ON r.entity_id = u.uid
WHERE r.roles_target_id = 'administrator'
ORDER BY u.access DESC;"

# Force-reset a compromised admin (example)
drush user:password ADMIN_USERNAME
# or
drush user:block SUSPICIOUS_USERNAME

# Rotate OS secrets after cleanup (examples)
# passwd
# sudo mysql -e "ALTER USER 'drupal'@'localhost' IDENTIFIED BY 'NEW_STRONG_PASSWORD';"
```

Also rotate: hosting panel, SSH keys, DB password in `web/sites/default/settings.php`, CDN/WAF keys, and enable 2FA on all admin accounts.

---

## 2) Find every infected node in the database

Drupal stores body HTML in field tables. Run from the Drupal root with Drush (preferred) or `mysql` / `psql`.

### 2a) Drush one-liners (works on MySQL or Postgres)

```bash
cd /path/to/drupal   # directory that contains vendor/ + web/ (or project root)

# Any body field containing spam keywords
drush sql:query "SELECT entity_id, langcode, LEFT(body_value, 160)
FROM node__body
WHERE body_value LIKE '%slot%'
   OR body_value LIKE '%gacor%'
   OR body_value LIKE '%pena88%'
   OR body_value LIKE '%angkot88%'
   OR body_value LIKE '%visibility:hidden%'
   OR body_value LIKE '%royalhoki%'
   OR body_value LIKE '%laskar288%';"

# Revisions too (spam often survives in old revisions)
drush sql:query "SELECT entity_id, revision_id, LEFT(body_value, 160)
FROM node_revision__body
WHERE body_value LIKE '%gacor%'
   OR body_value LIKE '%pena88%'
   OR body_value LIKE '%angkot88%'
   OR body_value LIKE '%visibility:hidden%';"

# Map entity_id → URL alias
drush sql:query "SELECT n.nid, n.type, d.title, a.alias
FROM node_field_data d
INNER JOIN node n ON n.nid = d.nid
LEFT JOIN path_alias a ON a.path = CONCAT('/node/', n.nid) AND a.status = 1
WHERE n.nid IN (
  SELECT DISTINCT entity_id FROM node__body
  WHERE body_value LIKE '%gacor%'
     OR body_value LIKE '%pena88%'
     OR body_value LIKE '%visibility:hidden%'
);"
```

### 2b) Raw MySQL / MariaDB (if no Drush)

```bash
# Read DB credentials
sudo rg -n "database|username|password|host" /path/to/drupal/web/sites/default/settings.php | head -40

mysql -u DRUPAL_USER -p DRUPAL_DB <<'SQL'
SELECT entity_id, LEFT(body_value, 160)
FROM node__body
WHERE body_value LIKE '%gacor%'
   OR body_value LIKE '%pena88%'
   OR body_value LIKE '%visibility:hidden%';
SQL
```

### 2c) Also search blocks / builder / paragraphs

Gaviasthemes content builders sometimes store HTML outside `node__body`.

```bash
# Dump table list, then grep for likely content tables
drush sql:query "SHOW TABLES;" | rg -i 'body|block|paragraph|gavias|builder|field_.*text|field_.*html'

# Broad search across all text-ish tables (MySQL)
drush sql:query "
SELECT TABLE_NAME, COLUMN_NAME
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND DATA_TYPE IN ('text','longtext','mediumtext','varchar')
  AND COLUMN_NAME LIKE '%value%';
" 

# Example: search block content
drush sql:query "SELECT entity_id, LEFT(body_value, 160) FROM block_content__body
WHERE body_value LIKE '%gacor%' OR body_value LIKE '%visibility:hidden%';" 2>/dev/null || true
```

If `SHOW TABLES` fails (Postgres), use:

```bash
drush sql:query "SELECT tablename FROM pg_tables WHERE schemaname = 'public';"
```

---

## 3) Remove the spam

### Option A — Drupal admin UI (safest for editors)

1. Log into `/user/login` as a trusted admin.
2. Edit **Home** (`/node/...` or `/home`) → Body / Content Builder.
3. Switch to **Source / HTML** view.
4. Delete every block that contains `visibility:hidden`, `display:none`, `slot`, `gacor`, spam `<a href=...>`.
5. Save, then repeat for every NID from the SQL report.
6. Check **Revisions** and delete spammy revisions if present.

### Option B — Surgical SQL cleanup of known spam patterns (backup first)

```bash
# BACKUP FIRST
drush sql:dump > ~/ouk-db-backup-$(date +%Y%m%d-%H%M).sql
# or
mysqldump -u DRUPAL_USER -p DRUPAL_DB > ~/ouk-db-backup-$(date +%Y%m%d-%H%M).sql
```

MySQL example — strip common hidden spam wrappers (review a dry-run SELECT before UPDATE):

```bash
# Dry-run: see rows that would be touched
drush sql:query "SELECT entity_id,
  (body_value LIKE '%visibility:hidden%') AS has_hidden,
  (body_value LIKE '%gacor%') AS has_gacor
FROM node__body
WHERE body_value LIKE '%gacor%' OR body_value LIKE '%visibility:hidden%';"
```

Preferred path when infection is large: **restore infected fields from a clean backup** taken before the compromise, then re-apply legitimate edits.

If you must edit in place, use Drupal UI / `drush php:eval` to load nodes via the Entity API rather than blind `UPDATE` on HTML (blind replace can break layout markup).

```bash
# Example: list titles of infected nodes for manual edit queue
drush sql:query "SELECT d.nid, d.title
FROM node_field_data d
WHERE d.nid IN (
  SELECT entity_id FROM node__body
  WHERE body_value LIKE '%gacor%' OR body_value LIKE '%pena88%'
);"
```

---

## 4) Hunt webshells & backdoors on disk

```bash
DRUPAL_ROOT=/path/to/drupal/web   # adjust
cd "$DRUPAL_ROOT"

# Recently modified PHP under files (high risk)
sudo find sites/default/files -type f \( -name '*.php' -o -name '*.phtml' -o -name '*.phar' \) -print

# PHP modified in last 30 days anywhere under web/
sudo find . -type f -name '*.php' -mtime -30 -printf '%TY-%Tm-%Td %TT %p\n' | sort

# Common webshell strings
sudo rg -n -i 'eval\s*\(\s*base64_decode|gzinflate\s*\(|assert\s*\(\s*\$_|shell_exec\s*\(\s*\$_|FilesMan|c99shell|wso\s*shell' \
  --glob '*.php' . | head -100

# Unexpected writable dirs
sudo find . -type d -perm -0002 -not -path '*/sites/default/files*' -print

# Compare to a known-good release / git if you have one
# git status
# git diff --stat
```

Update core + contrib + theme after cleanup:

```bash
cd /path/to/drupal
composer outdated 'drupal/*' | head -50
composer update drupal/core-recommended --with-dependencies
drush updatedb -y
drush cache:rebuild
```

Also update / patch **Gaviasthemes** (`gavias_facdori`, slider, content builder) from the vendor, or replace with a maintained theme if abandoned.

---

## 5) Clear caches and harden quickly

```bash
drush cache:rebuild
# or
drush cr

# Optional: put site in maintenance while cleaning
drush state:set system.maintenance_mode 1 -y
# ... cleanup ...
drush state:set system.maintenance_mode 0 -y
drush cr
```

Nginx hardening snippets (add then reload):

```nginx
# /etc/nginx/sites-available/ouk.ac.ke  (example — adapt)
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Content-Type-Options nosniff always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
# Prefer hiding version:
# server_tokens off;
```

```bash
sudo nginx -t && sudo systemctl reload nginx
```

Fix homepage canonical in Drupal SEO settings / Metatag module to:

```text
https://ouk.ac.ke/
```

not `https://ouk.ac.ke/home`.

---

## 6) Fix Google indexing (only after spam is gone)

1. Open [Google Search Console](https://search.google.com/search-console).
2. Add/verify property **Domain: `ouk.ac.ke`** (DNS TXT).
3. **Sitemaps** → submit:

   ```text
   https://ouk.ac.ke/sitemap.xml
   ```

4. **URL Inspection** → inspect and **Request indexing** for:

   ```text
   https://ouk.ac.ke/
   https://ouk.ac.ke/home
   https://ouk.ac.ke/information-literacy
   https://ouk.ac.ke/curriculum-and-content-development-dec
   ```

   (plus every other cleaned URL)

5. Check **Security & Manual Actions**. If “Hacked content” / spam appears, follow Google’s remediation checklist and request review **after** cleanup.
6. Optional temporary removals (use sparingly): Removals → Temporary removals for a specific spam URL that still shows while cache catches up.
7. Monitor for 2–4 weeks:

   ```text
   site:ouk.ac.ke slot OR gacor
   ```

   That query should stop returning infected snippets once Google re-crawls clean pages.

### Optional: Bing

- https://www.bing.com/webmasters — submit the same sitemap after cleanup.

---

## 7) Post-cleanup acceptance checklist

```bash
# Must all be 0
for p in / /home /information-literacy /curriculum-and-content-development-dec; do
  echo -n "$p → "
  curl -sL "https://ouk.ac.ke$p" | rg -ic 'slot gacor|pena88|angkot88|royalhoki|laskar288|visibility:hidden' || true
done

# Homepage title/description should be clean university copy only
curl -sL https://ouk.ac.ke/ | rg -n '<title>|meta name="description"' | head -5
```

- [ ] No spam keywords in live HTML  
- [ ] No hidden spam blocks  
- [ ] Admin passwords rotated + 2FA  
- [ ] No unexpected `.php` under `sites/default/files`  
- [ ] Drupal/core + theme updated  
- [ ] Caches rebuilt  
- [ ] Search Console sitemap submitted  
- [ ] Clean URLs requested for indexing  
- [ ] Canonical set to `https://ouk.ac.ke/`  

---

## Notes for this SHAPE repo

This document lives in the **SHAPE / shapethefuture** project for tracking and handoff. The infected site is the separate **Drupal** deployment at `ouk.ac.ke`. Nothing in `frontend/` or `backend/` of this repo can remove that spam — you need Drupal admin / SSH / DB on the OUK host.

If you later need the same class of protection on SHAPE (Next.js), keep CMS publish permissions tight, sanitize rich text, and monitor public HTML for `visibility:hidden` spam injections.
