# business_by_phone.py - Updated to use correct g_map_master_table

import sqlite3
import csv
import os
import re

BIZ_TABLE = "g_map_master_table"

def normalize_phone(phone: str) -> str:
    p = re.sub(r'\D', '', phone)
    if p.startswith('91') and len(p) == 12:
        p = p[2:]
    elif p.startswith('0') and len(p) == 11:
        p = p[1:]
    return p

def row_to_dict(row_dict):
    """Convert g_map_master_table row to standard business dict"""
    return {
        "global_business_id": row_dict.get("global_business_id"),
        "id": row_dict.get("global_business_id"),
        "business_name": row_dict.get("business_name"),
        "name": row_dict.get("business_name"),
        "address": row_dict.get("address"),
        "phone_number": row_dict.get("phone_number"),
        "ratings": row_dict.get("ratings", 0),
        "reviews_average": row_dict.get("ratings", 0),
        "reviews_count": row_dict.get("reviews_count", 0),
        "business_category": row_dict.get("business_category"),
        "category": row_dict.get("business_category"),
        "subcategory": row_dict.get("subcategory"),
        "website_url": row_dict.get("website_url"),
        "website": row_dict.get("website_url"),
        "area": row_dict.get("area"),
        "city": row_dict.get("city"),
        "state": row_dict.get("state"),
        "owner_id": row_dict.get("owner_id"),
        "email": row_dict.get("email")
    }

def get_businesses_by_phone(phone: str):
    search_phone = normalize_phone(phone)
    if len(search_phone) != 10:
        raise ValueError("Invalid phone number")

    db_path = os.path.join(os.path.dirname(__file__), "google_map_data.db")
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    cursor.execute(
        f"""
        SELECT * FROM {BIZ_TABLE}
        WHERE REPLACE(phone_number, ' ', '') LIKE ?
        ORDER BY global_business_id DESC
        """,
        (f"%{search_phone}%",)
    )

    rows = cursor.fetchall()
    if rows:
        conn.close()
        return [row_to_dict(dict(r)) for r in rows]

    conn.close()
    
    # Step: Check CSV
    businesses = []
    csv_file_path = os.path.join(os.path.dirname(__file__), "g_map_master_table_sample.csv")
    if os.path.exists(csv_file_path):
        found_row = None
        with open(csv_file_path, mode='r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            for row in reader:
                row_phone = str(row.get("phone_number", ""))
                norm_row_phone = normalize_phone(row_phone)
                if search_phone and search_phone in norm_row_phone:
                    found_row = row
                    break
        
        if found_row:
            # Insert into DB
            try:
                conn2 = sqlite3.connect(db_path)
                conn2.row_factory = sqlite3.Row
                cur2 = conn2.cursor()
                cur2.execute(
                    f"""
                    INSERT INTO {BIZ_TABLE} (
                        csv_id, business_name, address, website_url, phone_number,
                        reviews_count, ratings, business_category, 
                        subcategory, city, state, area, created_at, email
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        found_row.get("id"),
                        found_row.get("name"),
                        found_row.get("address"),
                        found_row.get("website"),
                        found_row.get("phone_number"),
                        int(found_row.get("reviews_count") or 0),
                        float(found_row.get("reviews_avg") or 0.0),
                        found_row.get("category"),
                        found_row.get("subcategory"),
                        found_row.get("city"),
                        found_row.get("state"),
                        found_row.get("area"),
                        found_row.get("created_at"),
                        found_row.get("email")
                    )
                )
                new_id = cur2.lastrowid
                conn2.commit()
                conn2.close()
            except sqlite3.Error as e:
                print(f"Error inserting CSV record to DB: {e}")
                new_id = None
                
            businesses.append({
                "global_business_id": new_id,
                "id": new_id,
                "business_name": found_row.get("name"),
                "name": found_row.get("name"),
                "address": found_row.get("address"),
                "phone_number": found_row.get("phone_number"),
                "ratings": float(found_row.get("reviews_avg") or 0.0),
                "reviews_average": float(found_row.get("reviews_avg") or 0.0),
                "reviews_count": int(found_row.get("reviews_count") or 0),
                "business_category": found_row.get("category"),
                "category": found_row.get("category"),
                "subcategory": found_row.get("subcategory"),
                "website_url": found_row.get("website"),
                "website": found_row.get("website"),
                "area": found_row.get("area"),
                "city": found_row.get("city"),
                "state": found_row.get("state"),
                "email": found_row.get("email")
            })

    if not businesses:
        raise ValueError("Phone number not registered")
        
    return businesses

def get_businesses_by_email(email: str):
    email = email.strip().lower()
    if not email or "@" not in email:
        raise ValueError("Invalid email address")

    db_path = os.path.join(os.path.dirname(__file__), "google_map_data.db")
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    cursor.execute(
        f"""
        SELECT * FROM {BIZ_TABLE}
        WHERE LOWER(email) = ?
        ORDER BY global_business_id DESC
        """,
        (email,)
    )

    rows = cursor.fetchall()
    if rows:
        conn.close()
        return [row_to_dict(dict(r)) for r in rows]

    conn.close()
    
    businesses = []
    csv_file_path = os.path.join(os.path.dirname(__file__), "g_map_master_table_sample.csv")
    if os.path.exists(csv_file_path):
        found_row = None
        with open(csv_file_path, mode='r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            for row in reader:
                row_email = str(row.get("email", "")).strip().lower()
                if email == row_email:
                    found_row = row
                    break
        
        if found_row:
            try:
                conn2 = sqlite3.connect(db_path)
                cur2 = conn2.cursor()
                cur2.execute(
                    f"""
                    INSERT INTO {BIZ_TABLE} (
                        csv_id, business_name, address, website_url, phone_number,
                        reviews_count, ratings, business_category,
                        subcategory, city, state, area, created_at, email
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        found_row.get("id"),
                        found_row.get("name"),
                        found_row.get("address"),
                        found_row.get("website"),
                        found_row.get("phone_number"),
                        int(found_row.get("reviews_count") or 0),
                        float(found_row.get("reviews_avg") or 0.0),
                        found_row.get("category"),
                        found_row.get("subcategory"),
                        found_row.get("city"),
                        found_row.get("state"),
                        found_row.get("area"),
                        found_row.get("created_at"),
                        found_row.get("email")
                    )
                )
                new_id = cur2.lastrowid
                conn2.commit()
                conn2.close()
            except sqlite3.Error as e:
                print(f"Error inserting CSV record to DB by email: {e}")
                new_id = None
                
            businesses.append({
                "global_business_id": new_id,
                "id": new_id,
                "business_name": found_row.get("name"),
                "name": found_row.get("name"),
                "address": found_row.get("address"),
                "phone_number": found_row.get("phone_number"),
                "ratings": float(found_row.get("reviews_avg") or 0.0),
                "reviews_average": float(found_row.get("reviews_avg") or 0.0),
                "reviews_count": int(found_row.get("reviews_count") or 0),
                "business_category": found_row.get("category"),
                "category": found_row.get("category"),
                "subcategory": found_row.get("subcategory"),
                "website_url": found_row.get("website"),
                "website": found_row.get("website"),
                "area": found_row.get("area"),
                "city": found_row.get("city"),
                "state": found_row.get("state"),
                "email": found_row.get("email")
            })

    if not businesses:
        raise ValueError("Email not registered")
        
    return businesses
