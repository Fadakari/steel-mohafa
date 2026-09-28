BEGIN
        DECLARE final_price DECIMAL(18,2);
        IF NEW.unit = 'عدد' OR NEW.unit = 'شاخه' THEN
            SET final_price = NEW.calculated_total_price_per_unit;
        ELSE
            SET final_price = NEW.calculated_price_per_kg;
        END IF;

        IF (NEW.calculated_total_price_per_unit <> OLD.calculated_total_price_per_unit) OR (OLD.calculated_total_price_per_unit IS NULL AND NEW.calculated_total_price_per_unit IS NOT NULL) THEN
            INSERT INTO price_history (product_id, price, unit, is_call_for_price, date_created)
            VALUES (NEW.product_id, CAST(final_price AS UNSIGNED), NEW.unit, 0, CURRENT_TIMESTAMP);
        END IF;
    END