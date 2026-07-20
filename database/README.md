# OUK Main Website Database Dump

This directory contains the latest structural and content dump of the `ouk_db` PostgreSQL database.

## Restoring the Database

To restore this database to a local or production environment, follow these steps:

1. **Create the target database** (if it doesn't exist):
   ```bash
   createdb ouk_db
   ```

2. **Import the dump**:
   ```bash
   psql ouk_db < dump.sql
   ```

## Automatic Migrations
The NestJS backend is configured with `synchronize: true` in development, but this dump contains essential seed data (Schools, Departments, Adverts, Settings) that are required for the initial UI state.
