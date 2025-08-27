-- Seed today's feature rows per supplier if missing (placeholders; Phase 1 will compute real values)

-- features_supplier_daily: one row per supplier for today
INSERT INTO features_supplier_daily (
  supplier_id, feature_date, otif30d, late_rate30d, spend30d,
  open_po_count, median_lead_time90d, lead_time_iqr90d,
  defect_rate180d, dispute_rate180d, price_index30d, created_at
)
SELECT s.supplier_id, CURRENT_DATE, NULL, NULL, NULL,
       NULL, NULL, NULL,
       NULL, NULL, NULL, NOW()
FROM suppliers s
LEFT JOIN features_supplier_daily f
  ON f.supplier_id = s.supplier_id AND f.feature_date = CURRENT_DATE
WHERE f.id IS NULL;

-- supplier_scores_daily: one row per supplier for today
INSERT INTO supplier_scores_daily (
  supplier_id, score_date, on_time_rate30d, in_full_rate30d,
  avg_late_days30d, median_lead_time90d, lead_time_iqr90d,
  price_index30d, created_at
)
SELECT s.supplier_id, CURRENT_DATE, NULL, NULL,
       NULL, NULL, NULL,
       NULL, NOW()
FROM suppliers s
LEFT JOIN supplier_scores_daily d
  ON d.supplier_id = s.supplier_id AND d.score_date = CURRENT_DATE
WHERE d.id IS NULL;

-- features_po_at_creation: seed minimal rows from existing POs (adjust created timestamp column name)
-- If your POs have a column named 'created_at':
INSERT INTO features_po_at_creation (
  po_id, supplier_id, created_at, total_amount, item_count, item_mix_entropy,
  expected_lead_time_days, supplier_otif90d, supplier_lead_time_var,
  month, weekday, created_row_at
)
SELECT p.po_id, p.supplier_id, p.date,
       NULL, NULL, NULL,
       NULL, NULL, NULL,
       MONTH(p.date), WEEKDAY(p.date), NOW()
FROM purchase_orders p
LEFT JOIN features_po_at_creation f ON f.po_id = p.po_id
WHERE f.id IS NULL;

-- If your POs use a different timestamp column (e.g., 'created_date'), comment the block above
-- and use this instead:
-- SELECT p.po_id, p.supplier_id, p.created_date,
--        NULL, NULL, NULL,
--        NULL, NULL, NULL,
--        MONTH(p.created_date), WEEKDAY(p.created_date), NOW()
-- FROM purchase_orders p
-- LEFT JOIN features_po_at_creation f ON f.po_id = p.po_id
-- WHERE f.id IS NULL;
