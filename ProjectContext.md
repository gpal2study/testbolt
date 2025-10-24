# Project Context

## Important Guidelines

Please read this file at the beginning of every new session before proceeding with any instructions.

---

### 1. Project Type
This is a **prototype project**.

### 2. Data Storage
- **DO NOT** connect to any database
- **DO NOT** use Supabase or any external database services
- All data entries must be stored in **localStorage** or maintained in **separate local files**
- Remove any database connection packages if installed

### 3. Dummy Data Generation
- When creating a new master, **ALWAYS ask**: "How many dummy records need to generate?"
- Generate realistic dummy data with proper data types and relationships
- Maintain referential integrity between master and child relationships

### 4. Incremental Changes (CRITICAL)
When modifying existing masters or screens:
- **RETAIN all old information and functionality**
- **ONLY change the specific information provided**
- **NEVER remove existing dummy data** unless explicitly instructed
- **NEVER remove existing features** unless explicitly instructed

**Example:**
- If instructed to add "status in search page" and "Active field in entry screen"
- Add these new fields WITHOUT removing existing dummy data or features
- Preserve all previously created records and functionality

### 5. Master Search Page Design
- All master search pages should follow the **same consistent design pattern**
- Maintain uniformity across all search interfaces

---

## Current Project Status
- Master implemented: Document Type Master
- Storage method: localStorage
- Authentication: Local storage based (no database)
