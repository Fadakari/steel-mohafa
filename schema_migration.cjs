const mysql = require('mysql2/promise');

async function runMigration() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'ai_agent',
    password: 'StrongPassword123!',
    database: 'steel_mahfa'
  });

  try {
    console.log('--- STARTING BACKUPS ---');
    const tablesToBackup = ['products', 'price_history', 'categories', 'alloy'];
    const backupSuffix = '_backup_20260831';
    
    for (const tbl of tablesToBackup) {
      const backupName = tbl + backupSuffix;
      console.log(`Backing up ${tbl} to ${backupName}...`);
      // Drop if exists (just in case of re-run)
      await conn.execute(`DROP TABLE IF EXISTS \`${backupName}\``);
      await conn.execute(`CREATE TABLE \`${backupName}\` AS SELECT * FROM \`${tbl}\``);
      console.log(`Backup of ${tbl} successful.`);
    }

    console.log('\n--- CREATING NEW TABLES ---');
    
    const queries = [
      `CREATE TABLE \`product_alloy_mapping\` (
          \`product_id\` INT UNSIGNED NOT NULL PRIMARY KEY,
          \`alloy_id\` INT NOT NULL COMMENT 'Matched exact type: INT (Signed) from alloy table',
          \`source\` ENUM('explicit', 'title_regex', 'meta_json', 'category_inheritance', 'manual') NOT NULL,
          \`confidence_score\` DECIMAL(5, 2) NOT NULL,
          \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          CONSTRAINT \`fk_alloy_map_product\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\` (\`id\`) ON DELETE CASCADE,
          CONSTRAINT \`fk_alloy_map_alloy\` FOREIGN KEY (\`alloy_id\`) REFERENCES \`alloy\` (\`id\`) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

      `CREATE TABLE \`pricing_rules\` (
          \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          \`rule_type\` ENUM('alloy', 'product_type', 'category', 'finish_surface', 'brand_origin', 'global') NOT NULL,
          \`rule_value\` VARCHAR(255) NOT NULL,
          \`multiplier\` DECIMAL(10, 4) NOT NULL DEFAULT 1.0000,
          \`category_id\` INT UNSIGNED NULL COMMENT 'Matched INT UNSIGNED',
          \`subcategory_id\` INT UNSIGNED NULL,
          \`alloy_id\` INT NULL COMMENT 'Matched INT (Signed)',
          \`priority\` INT NOT NULL DEFAULT 0 COMMENT 'Higher integer dictates conflict resolution',
          \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          CONSTRAINT \`fk_rules_category\` FOREIGN KEY (\`category_id\`) REFERENCES \`categories\` (\`id\`) ON DELETE CASCADE,
          CONSTRAINT \`fk_rules_alloy\` FOREIGN KEY (\`alloy_id\`) REFERENCES \`alloy\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

      `CREATE TABLE \`pricing_config\` (
          \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          \`config_key\` VARCHAR(100) NOT NULL UNIQUE,
          \`config_value\` DECIMAL(10, 4) NOT NULL DEFAULT 1.0000,
          \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

      `CREATE TABLE \`product_pricing_attributes\` (
          \`product_id\` INT UNSIGNED NOT NULL PRIMARY KEY,
          \`length_m\` DECIMAL(10, 4) DEFAULT NULL,
          \`width_mm\` DECIMAL(10, 4) DEFAULT NULL,
          \`thickness_mm\` DECIMAL(10, 4) DEFAULT NULL,
          \`outer_diameter_mm\` DECIMAL(10, 4) DEFAULT NULL,
          \`inner_diameter_mm\` DECIMAL(10, 4) DEFAULT NULL,
          \`height_mm\` DECIMAL(10, 4) DEFAULT NULL COMMENT 'Required for rectangular profiles',
          \`product_type\` VARCHAR(100) DEFAULT NULL,
          \`pricing_strategy\` ENUM('FORMULA_WEIGHT', 'FIXED_WEIGHT', 'MANUAL_PRICE') NOT NULL DEFAULT 'FORMULA_WEIGHT',
          \`fixed_weight_kg\` DECIMAL(15, 4) DEFAULT NULL,
          \`manual_price\` DECIMAL(15, 2) DEFAULT NULL,
          \`calculated_weight_kg\` DECIMAL(15, 4) DEFAULT NULL,
          \`calculated_price_per_unit\` DECIMAL(15, 2) DEFAULT NULL,
          \`unit\` VARCHAR(50) DEFAULT 'کیلوگرم' COMMENT 'Tracks kg vs piece (شاخه/عدد)',
          \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          CONSTRAINT \`fk_ppa_prod\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

      `CREATE TABLE \`pricing_dry_run_reports\` (
          \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          \`product_id\` INT UNSIGNED NOT NULL,
          \`current_price\` DECIMAL(15, 2) DEFAULT NULL COMMENT 'Sourced from active price_history',
          \`current_unit\` VARCHAR(50) DEFAULT NULL,
          \`calculated_new_price\` DECIMAL(15, 2) NOT NULL,
          \`price_difference_amount\` DECIMAL(15, 2) NOT NULL,
          \`percentage_change\` DECIMAL(10, 4) NOT NULL,
          \`rule_snapshot\` JSON NOT NULL COMMENT 'Logs exactly which multipliers and equations triggered this price',
          \`run_timestamp\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT \`fk_dry_run_prod\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
    ];

    for (const q of queries) {
      await conn.execute(q);
      console.log('Executed create table query successfully.');
    }

    console.log('\n--- VERIFYING NEW TABLES ---');
    const newTables = [
      'product_alloy_mapping',
      'pricing_rules',
      'pricing_config',
      'product_pricing_attributes',
      'pricing_dry_run_reports'
    ];

    for (const tbl of newTables) {
      const [desc] = await conn.execute(`SHOW CREATE TABLE \`${tbl}\``);
      console.log(`\nVerified Table: ${tbl}`);
      console.log(desc[0]['Create Table']);
    }

  } catch (e) {
    console.error('Migration failed:', e);
  } finally {
    await conn.end();
  }
}

runMigration();
