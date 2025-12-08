#!/bin/bash

# === Variables (edit as needed) ===
MYSQL_ROOT_USER="root"
DB_DUMP_FILE="docrecords_db_dump.sql"

NEW_USER="docrecords"
NEW_PASS="Doc_Records123"

# === Step 0: Grab MySQL root password (from log) ===
MYSQL_ROOT_PASS=$(grep 'temporary password' /var/log/mysqld.log | awk '{print $NF}')

if [ -z "$MYSQL_ROOT_PASS" ]; then
  echo "Could not find MySQL root temporary password in /var/log/mysqld.log"
  exit 1
fi

echo "Found MySQL temporary root password: $MYSQL_ROOT_PASS"

# === Step 1: Restore the databases ===
echo "Restoring databases from $DB_DUMP_FILE ..."
mysql -u"$MYSQL_ROOT_USER" -p"$MYSQL_ROOT_PASS" < "$DB_DUMP_FILE"

# === Step 2: Create the user (if not exists) ===
echo "Creating user '$NEW_USER'..."
mysql -u"$MYSQL_ROOT_USER" -p"$MYSQL_ROOT_PASS" <<EOF
ALTER USER 'root'@'localhost' IDENTIFIED BY 'Root@123'; -- reset root password (optional)
CREATE USER IF NOT EXISTS '$NEW_USER'@'%' IDENTIFIED BY '$NEW_PASS';
GRANT ALL PRIVILEGES ON auth_db.* TO '$NEW_USER'@'%';
GRANT ALL PRIVILEGES ON doctor_db.* TO '$NEW_USER'@'%';
GRANT ALL PRIVILEGES ON patient_db.* TO '$NEW_USER'@'%';
FLUSH PRIVILEGES;
EOF

echo "Databases restored and user '$NEW_USER' created with full access."
