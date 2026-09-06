const mysql = require('mysql2/promise');
async function m() {
  const c = await mysql.createConnection('mysql://root:@localhost:3306/steel_mahfa');
  const sql = `
    SELECT 
        p.id, 
        cat.title AS Category,
        p.dimensions,
        p.outer_diameter,
        cbp.base_price AS Price_of_1_Inch,
        (CASE 
            WHEN cat.title LIKE '%مفتول%' OR cat.title LIKE '%سیم%' THEN 'WEIGHT_BASED'
            ELSE 'SIZE_BASED'
        END) AS Strategy,
        (CASE 
            WHEN cat.title LIKE '%مفتول%' OR cat.title LIKE '%سیم%' THEN ppa.calculated_weight_kg
            WHEN p.dimensions LIKE '%1/8%' OR p.outer_diameter LIKE '%1/8%' THEN 0.3
            WHEN p.dimensions LIKE '%1/4%' OR p.outer_diameter LIKE '%1/4%' THEN 0.4
            WHEN p.dimensions LIKE '%3/8%' OR p.outer_diameter LIKE '%3/8%' THEN 0.5
            WHEN p.dimensions LIKE '%1/2%' OR p.outer_diameter LIKE '%1/2%' THEN 0.6
            WHEN p.dimensions LIKE '%3/4%' OR p.outer_diameter LIKE '%3/4%' THEN 0.8
            WHEN p.dimensions LIKE '%1 1/4%' OR p.outer_diameter LIKE '%1 1/4%' THEN 1.5
            WHEN p.dimensions LIKE '%1 1/2%' OR p.outer_diameter LIKE '%1 1/2%' THEN 2.0
            WHEN p.dimensions LIKE '%2 1/2%' OR p.outer_diameter LIKE '%2 1/2%' THEN 4.5
            WHEN p.dimensions LIKE '%2%' OR p.outer_diameter LIKE '%2%' THEN 3.0
            WHEN p.dimensions LIKE '%3%' OR p.outer_diameter LIKE '%3%' THEN 6.0
            WHEN p.dimensions LIKE '%4%' OR p.outer_diameter LIKE '%4%' THEN 10.0
            WHEN p.dimensions LIKE '%5%' OR p.outer_diameter LIKE '%5%' THEN 15.0
            WHEN p.dimensions LIKE '%6%' OR p.outer_diameter LIKE '%6%' THEN 22.0
            WHEN p.dimensions LIKE '%8%' OR p.outer_diameter LIKE '%8%' THEN 40.0
            WHEN p.dimensions LIKE '%10%' OR p.outer_diameter LIKE '%10%' THEN 65.0
            WHEN p.dimensions LIKE '%12%' OR p.outer_diameter LIKE '%12%' THEN 100.0
            WHEN p.dimensions LIKE '%1%' OR p.outer_diameter LIKE '%1%' THEN 1.0
            ELSE 1.0 
        END) AS Size_Or_Weight_Multiplier,
        ROUND(cbp.base_price * 
            (CASE 
                WHEN cat.title LIKE '%مفتول%' OR cat.title LIKE '%سیم%' THEN ppa.calculated_weight_kg
                WHEN p.dimensions LIKE '%1/8%' OR p.outer_diameter LIKE '%1/8%' THEN 0.3
                WHEN p.dimensions LIKE '%1/4%' OR p.outer_diameter LIKE '%1/4%' THEN 0.4
                WHEN p.dimensions LIKE '%3/8%' OR p.outer_diameter LIKE '%3/8%' THEN 0.5
                WHEN p.dimensions LIKE '%1/2%' OR p.outer_diameter LIKE '%1/2%' THEN 0.6
                WHEN p.dimensions LIKE '%3/4%' OR p.outer_diameter LIKE '%3/4%' THEN 0.8
                WHEN p.dimensions LIKE '%1 1/4%' OR p.outer_diameter LIKE '%1 1/4%' THEN 1.5
                WHEN p.dimensions LIKE '%1 1/2%' OR p.outer_diameter LIKE '%1 1/2%' THEN 2.0
                WHEN p.dimensions LIKE '%2 1/2%' OR p.outer_diameter LIKE '%2 1/2%' THEN 4.5
                WHEN p.dimensions LIKE '%2%' OR p.outer_diameter LIKE '%2%' THEN 3.0
                WHEN p.dimensions LIKE '%3%' OR p.outer_diameter LIKE '%3%' THEN 6.0
                WHEN p.dimensions LIKE '%4%' OR p.outer_diameter LIKE '%4%' THEN 10.0
                WHEN p.dimensions LIKE '%5%' OR p.outer_diameter LIKE '%5%' THEN 15.0
                WHEN p.dimensions LIKE '%6%' OR p.outer_diameter LIKE '%6%' THEN 22.0
                WHEN p.dimensions LIKE '%8%' OR p.outer_diameter LIKE '%8%' THEN 40.0
                WHEN p.dimensions LIKE '%10%' OR p.outer_diameter LIKE '%10%' THEN 65.0
                WHEN p.dimensions LIKE '%12%' OR p.outer_diameter LIKE '%12%' THEN 100.0
                WHEN p.dimensions LIKE '%1%' OR p.outer_diameter LIKE '%1%' THEN 1.0
                ELSE 1.0 
            END) * 
            (CASE WHEN p.brand_origin LIKE '%تایوان%' THEN 1.000 WHEN p.brand_origin LIKE '%چین%' THEN 0.965 WHEN p.brand_origin LIKE '%هند%' THEN 0.955 ELSE 1.000 END), -3) AS Final_Total_Unit_Price
    FROM products p
    JOIN product_pricing_attributes ppa ON ppa.product_id = p.id
    JOIN categories cat ON cat.id = p.category_id
    JOIN category_base_prices cbp ON cbp.category_id = p.category_id
    WHERE cat.title LIKE '%اتصال%' OR cat.title LIKE '%فلنج%' OR cat.title LIKE '%شیر%' OR cat.title LIKE '%مفتول%'
    ORDER BY RAND() LIMIT 10;
  `;
  const [res] = await c.query(sql);
  console.table(res);
  process.exit(0);
}
m().catch(console.error);
