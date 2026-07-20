const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

async function run() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'mwarabu',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ouk_db',
  });

  await client.connect();

  try {
    // 1. Remove top-level redundant items
    console.log('Removing top-level redundant items...');
    await client.query("DELETE FROM menus WHERE title IN ('Office of the Chancellor', 'Vice-Chancellor Vision') AND \"parentId\" IS NULL");

    // 2. Find the About menu ID
    const aboutRes = await client.query("SELECT id FROM menus WHERE title = 'About' LIMIT 1");
    if (aboutRes.rows.length > 0) {
      const aboutId = aboutRes.rows[0].id;

      // 3. Update Chancellor child
      console.log('Updating Chancellor child menu...');
      await client.query("UPDATE menus SET title = 'Office of the Chancellor', link = '/university-chancellor' WHERE title = 'The Chancellor'");

      // 4. Add Vice-Chancellor child if it doesn't exist
      const vcRes = await client.query("SELECT id FROM menus WHERE title = 'Vice-Chancellor Vision' AND \"parentId\" = $1", [aboutId]);
      if (vcRes.rows.length === 0) {
        console.log('Adding VC child menu under About...');
        await client.query(
          "INSERT INTO menus (id, title, slug, link, \"order\", position, target, \"parentId\", created_at, updated_at, is_public) VALUES (gen_random_uuid(), 'Vice-Chancellor Vision', 'about/vice-chancellor', '/vice-chancellor', 3, 'header', '_self', $1, NOW(), NOW(), true)",
          [aboutId]
        );
      }
    }

    console.log('Navigation cleanup complete.');
  } finally {
    await client.end();
  }
}

run().catch(console.error);
