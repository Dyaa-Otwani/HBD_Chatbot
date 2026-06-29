# search_online.py

import json
import pandas as pd
from typing import List, Dict
from datetime import datetime 
import os
from db import get_connection

from llm_client import call_llm
from models import MODEL

EXCEL_FILE = "missing_data_from_db.xlsx"

REQUIRED_FIELDS = {
    "business_name": "",
    "address": "",
    "website_url": "",
    "phone_number": "",
    "reviews_count": 0,
    "ratings": 0.0,
    "business_category": "",
    # "subcategory": "",
    "city": "",
    "state": "",
    "area": ""
}


def _normalize_results(raw: List[Dict]) -> List[Dict]:
    normalized = []

    for item in raw:
        record = {}

        for field, default in REQUIRED_FIELDS.items():
            value = item.get(field, default)

            if field == "reviews_count":
                try:
                    value = int(value)
                except:
                    value = 0

            if field == "ratings":
                try:
                    value = float(value)
                except:
                    value = 0.0

            record[field] = value

        normalized.append(record)

    return normalized

def validate_business(record):
    if not record.get("business_name", "").strip():
        return False

    if not record.get("address", "").strip():
        return False

    if not record.get("city", "").strip():
        return False

    if not record.get("business_category", "").strip():
        return False

    if record.get("ratings", 0) < 0 or record.get("ratings", 0) > 5:
        return False

    if record.get("reviews_count", 0) < 0:
        return False

    return True

def find_existing_business(cursor, business_name, city):
    cursor.execute(
        """
        SELECT global_business_id
        FROM g_map_master_table
        WHERE LOWER(business_name) = %s
        AND LOWER(city) = %s
        LIMIT 1
        """,
        (business_name.strip().lower(), city.strip().lower())
    )

    row = cursor.fetchone()

    if row:
        return row["global_business_id"]  # business id

    return None

def update_existing_business(cursor, business_id, record):
    # Get existing data
    cursor.execute(
        """
        SELECT website_url, phone_number, reviews_count, ratings,
               city, state, area, subcategory
        FROM g_map_master_table
        WHERE id = %s
        """,
        (business_id,)
    )

    existing = cursor.fetchone()

    if not existing:
        return

    # Fill missing values only
    website_url = existing["website_url"] or record.get("website_url", "")
    phone_number = existing["phone_number"] or record.get("phone_number", "")
    city = existing["city"] or record.get("city", "")
    state = existing["state"] or record.get("state", "")
    area = existing["area"] or record.get("area", "")
    subcategory = existing["subcategory"] or record.get("subcategory", "")

    # Update reviews only if newer count is higher
    reviews_count = existing["reviews_count"]
    ratings = existing["ratings"]

    if record.get("reviews_count", 0) > (existing["reviews_count"] or 0):
        reviews_count = record.get("reviews_count", 0)
        ratings = record.get("ratings", 0)

    cursor.execute(
        """
        UPDATE g_map_master_table
        SET website_url = %s,
            phone_number = %s,
            reviews_count = %s,
            ratings = %s,
            city = %s,
            state = %s,
            area = %s,
            subcategory = %s
        WHERE global_business_id = %s
        """,
        (
            website_url,
            phone_number,
            reviews_count,
            ratings,
            city,
            state,
            area,
            subcategory,
            business_id
        )
    )

def insert_new_business(cursor, record):
    cursor.execute(
        """
        INSERT INTO g_map_master_table (
            business_name,
            address,
            website_url,
            phone_number,
            reviews_count,
            ratings,
            business_category,
            subcategory,
            city,
            state,
            area,
            created_at
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """,
        (
            record.get("business_name", ""),
            record.get("address", ""),
            record.get("website_url", ""),
            record.get("phone_number", ""),
            record.get("reviews_count", 0),
            record.get("ratings", 0.0),
            record.get("business_category", ""),
            record.get("subcategory", ""),
            record.get("city", ""),
            record.get("state", ""),
            record.get("area", ""),
            datetime.now() 
        )
    )


def save_results_to_mysql(results):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    inserted = 0
    updated = 0
    skipped = 0

    try:
        for record in results:

            # Validation
            if not validate_business(record):
                skipped += 1
                continue

            # Duplicate check
            business_id = find_existing_business(
                cursor,
                record.get("business_name", ""),
                record.get("city", "")
            )

            if business_id:
                update_existing_business(
                    cursor,
                    business_id,
                    record
                )
                updated += 1
            else:
                insert_new_business(
                    cursor,
                    record
                )
                inserted += 1

        conn.commit()

        print(
            f"MySQL Sync Complete | "
            f"Inserted={inserted}, "
            f"Updated={updated}, "
            f"Skipped={skipped}"
        )

    except Exception as e:
        conn.rollback()
        print(f"MySQL Sync Error: {e}")
        raise

    finally:
        cursor.close()
        conn.close()
def search_online_and_save(query: str) -> List[Dict]:
    if not query or not query.strip():
        raise ValueError("Search query cannot be empty")

    prompt = f"""
Return a STRICT JSON array of local businesses for: "{query}"

Each object must contain ONLY these fields:
business_name, address, website_url, phone_number, reviews_count, ratings, business_category,subcategory, city, state, area

Rules:
-- Always provide a subcategory whenever possible.
-- Example:
-  - category = Restaurant
-  - subcategory = South Indian
- Be extremely concise.
- Output ONLY valid, strict JSON.
- No markdown formatting.
- Absolutely NO conversational text or explanations.
"""

    message = call_llm(
        messages=[{"role": "user", "content": prompt}],
        model=MODEL
    )

    content = message.get("content", "").strip()
    
    # Sanitize content: remove markdown code block markers if present
    if content.startswith("```"):
        # Remove first line if it starts with ``` (and potentially ```json)
        lines = content.splitlines()
        if len(lines) > 2:
            # Join all lines except the first and last
            content = "\n".join(lines[1:-1]).strip()
        else:
            # Handle single line ```content```
            content = content.replace("```json", "").replace("```", "").strip()

    try:
        raw_results = json.loads(content)
    except json.JSONDecodeError:
        print(f"DEBUG: Failed to parse JSON. Content was: {content[:100]}...")
        raise RuntimeError("LLM returned invalid JSON")

    if not isinstance(raw_results, list) or not raw_results:
        return []

    results = _normalize_results(raw_results)
    save_results_to_mysql(results)

    # ----- Save to Excel -----
    df = pd.DataFrame(results)

    try:
        existing = pd.read_excel(EXCEL_FILE)
        df = pd.concat([existing, df], ignore_index=True)
    except FileNotFoundError:
        pass

    df.to_excel(EXCEL_FILE, index=False)

    return results


# -------------------------------------------------
# STANDALONE TEST MODE
# -------------------------------------------------

if __name__ == "__main__":
    print("🔎 Testing search_online module\n")

    q = input("Enter search query: ").strip()

    results = search_online_and_save(q)

    if not results:
        print("❌ No results returned")
    else:
        print(f"✅ {len(results)} result(s):\n")
        for i, r in enumerate(results, 1):
            print(
                f"{i}. {r['business_name']} | {r['business_category']} | "
                f"{r['city']}, {r['state']}"
            )
