const { Client } = require('pg');
const { v4: uuidv4 } = require('uuid');

const client = new Client({
  user: 'mwarabu',
  host: 'localhost',
  database: 'ouk_db',
  password: '',
  port: 5432,
});

const feeStructures = [
  {
    id: uuidv4(),
    category: 'Bachelors Programmes',
    order_index: 1,
    is_active: true,
    content: `<table>
      <thead>
        <tr>
          <th>S/NO</th>
          <th>Programme</th>
          <th>Duration (Years)</th>
          <th>1st Semester (KSH)</th>
          <th>2nd Semester (KSH)</th>
          <th>Academic Year (KSH)</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>1.</td><td>Bachelor of Agri-Technology and food systems</td><td>4</td><td>43,000</td><td>43,000</td><td>86,000</td></tr>
        <tr><td>2.</td><td>Bachelor of Business and Entrepreneurship</td><td>4</td><td>39,500</td><td>39,500</td><td>79,000</td></tr>
        <tr><td>3.</td><td>Bachelor of Commerce</td><td>4</td><td>39,500</td><td>39,500</td><td>79,000</td></tr>
        <tr><td>4.</td><td>Bachelor of Data Science</td><td>4</td><td>39,500</td><td>39,500</td><td>79,000</td></tr>
        <tr><td>5.</td><td>Bachelor of Economics and Data Science</td><td>4</td><td>39,500</td><td>39,500</td><td>79,000</td></tr>
        <tr><td>6.</td><td>Bachelor of Economics and Statistics</td><td>4</td><td>39,500</td><td>39,500</td><td>79,000</td></tr>
        <tr><td>7.</td><td>Bachelor of Science in Computer Science</td><td>4</td><td>39,500</td><td>39,500</td><td>79,000</td></tr>
        <tr><td>8.</td><td>Bachelor of Science in Cyber Security and Digital Forensics</td><td>4</td><td>39,500</td><td>39,500</td><td>79,000</td></tr>
        <tr><td>9.</td><td>Bachelor of Science in Interactive Media Technologies</td><td>4</td><td>39,500</td><td>39,500</td><td>79,000</td></tr>
      </tbody>
    </table>`
  },
  {
    id: uuidv4(),
    category: 'Masters Programmes',
    order_index: 2,
    is_active: true,
    content: `<table>
      <thead>
        <tr>
          <th rowspan="2">Fee Category</th>
          <th colspan="3">Year 1</th>
          <th colspan="3">Year 2</th>
        </tr>
        <tr>
          <th>1st Semester</th>
          <th>2nd Semester</th>
          <th>Total</th>
          <th>1st Semester</th>
          <th>2nd Semester</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>Tuition</td><td>38,000</td><td>38,000</td><td><strong>76,000</strong></td><td>-</td><td>-</td><td>-</td></tr>
        <tr><td>Examination</td><td>5,000</td><td>5,000</td><td><strong>10,000</strong></td><td>5,000</td><td>5,000</td><td><strong>10,000</strong></td></tr>
        <tr><td>Thesis Supervision</td><td>-</td><td>-</td><td>-</td><td>35,000</td><td>25,000</td><td><strong>60,000</strong></td></tr>
        <tr><td>Thesis Examination</td><td>5,500</td><td>5,500</td><td><strong>11,000</strong></td><td>5,500</td><td>5,500</td><td><strong>11,000</strong></td></tr>
        <tr><td>Miscellaneous (ID, Library, Quality Assurance)</td><td>2,250</td><td>2,250</td><td><strong>4,500</strong></td><td>2,500</td><td>2,500</td><td><strong>5,000</strong></td></tr>
        <tr><td><strong>Total</strong></td><td><strong>50,750</strong></td><td><strong>50,750</strong></td><td><strong>101,500</strong></td><td><strong>48,000</strong></td><td><strong>38,000</strong></td><td><strong>86,000</strong></td></tr>
        <tr><td colspan="7" style="text-align: right; background-color: #ff6b35; color: white;"><strong>Grand Total: 187,500</strong></td></tr>
      </tbody>
    </table>`
  },
  {
    id: uuidv4(),
    category: 'PhD Programmes',
    order_index: 3,
    is_active: true,
    content: `<table>
      <thead>
        <tr>
          <th rowspan="2">Fee Category</th>
          <th colspan="3">Year 1</th>
          <th colspan="3">Year 2</th>
          <th colspan="3">Year 3</th>
        </tr>
        <tr>
          <th>1st Sem</th>
          <th>2nd Sem</th>
          <th>Total</th>
          <th>1st Sem</th>
          <th>2nd Sem</th>
          <th>Total</th>
          <th>1st Sem</th>
          <th>2nd Sem</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>Tuition</td><td>67,500</td><td>67,500</td><td><strong>135,000</strong></td><td>20,000</td><td>-</td><td><strong>20,000</strong></td><td>-</td><td>-</td><td>-</td></tr>
        <tr><td>Examination</td><td>6,000</td><td>6,000</td><td><strong>12,000</strong></td><td>6,000</td><td>6,000</td><td><strong>12,000</strong></td><td>-</td><td>-</td><td>-</td></tr>
        <tr><td>Thesis Supervision</td><td>-</td><td>-</td><td>-</td><td>35,000</td><td>45,000</td><td><strong>80,000</strong></td><td>-</td><td>-</td><td>-</td></tr>
        <tr><td>Thesis Examination</td><td>-</td><td>-</td><td>-</td><td>-</td><td>10,000</td><td><strong>10,000</strong></td><td>11,750</td><td>11,750</td><td><strong>23,500</strong></td></tr>
        <tr><td>Miscellaneous</td><td>7,500</td><td>7,500</td><td><strong>15,000</strong></td><td>7,500</td><td>7,500</td><td><strong>15,000</strong></td><td>7,500</td><td>7,500</td><td><strong>15,000</strong></td></tr>
        <tr><td><strong>Total</strong></td><td><strong>81,000</strong></td><td><strong>81,000</strong></td><td><strong>162,000</strong></td><td><strong>68,500</strong></td><td><strong>68,500</strong></td><td><strong>137,000</strong></td><td><strong>19,250</strong></td><td><strong>19,250</strong></td><td><strong>38,500</strong></td></tr>
        <tr><td colspan="10" style="text-align: right; background-color: #ff6b35; color: white;"><strong>Grand Total: 337,500</strong></td></tr>
      </tbody>
    </table>`
  },
  {
    id: uuidv4(),
    category: 'Post Graduate Diploma',
    order_index: 4,
    is_active: true,
    content: `<table>
      <thead>
        <tr>
          <th rowspan="2">Fee Category</th>
          <th colspan="3">Year 1</th>
        </tr>
        <tr>
          <th>1st Semester</th>
          <th>2nd Semester</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>Tuition</td><td>52,500</td><td>35,000</td><td><strong>87,500</strong></td></tr>
        <tr><td>Examination</td><td>-</td><td>10,000</td><td><strong>10,000</strong></td></tr>
        <tr><td>Project Supervision</td><td>-</td><td>10,000</td><td><strong>10,000</strong></td></tr>
        <tr><td>Miscellaneous (ID, Library, Quality Assurance)</td><td>2,500</td><td>-</td><td><strong>2,500</strong></td></tr>
        <tr><td><strong>Total</strong></td><td><strong>55,000</strong></td><td><strong>55,000</strong></td><td><strong>110,000</strong></td></tr>
      </tbody>
    </table>`
  }
];

async function seed() {
  await client.connect();
  
  // Clear existing
  await client.query('DELETE FROM fee_structures');

  for (const f of feeStructures) {
    await client.query(
      `INSERT INTO fee_structures (id, category, content, order_index, is_active, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
      [f.id, f.category, f.content, f.order_index, f.is_active]
    );
  }
  
  console.log('Mock fee structures seeded successfully!');
  await client.end();
}

seed().catch(console.error);
