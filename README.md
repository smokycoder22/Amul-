# Amul Price Portal - MVP Documentation

## Overview

The Amul Price Portal is a digital pricing platform built for Amul dairy to replace Excel sheets and paper flyers used for communicating product prices to retailers and distributors. The MVP replaces the manual price distribution process with a modern web application.

## Live Demo

**URL**: http://localhost:3000

- **Retailer Portal**: Open access, no authentication
- **Distributor Portal**: OTP-based login at `/distributor/login`
- **Admin Portal**: Credentials login at `/admin/login`

## Architecture

### Tech Stack
- **Frontend**: Next.js 16 + React 19 + Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: Neon PostgreSQL
- **Authentication**: Custom session tokens (OTP for distributors, credentials for admin)
- **File Processing**: XLSX for Excel parsing

### Database Schema

**3 core tables** (lean MVP design):

1. **products** - All product pricing data
   - Primary Key: `sap_code` (Amul's product identifier)
   - Fields: Product name, category, 8 pricing columns
   - Tracks: `updated_at` timestamp

2. **distributor_sessions** - OTP authentication
   - Phone number, OTP code, session token
   - Expiration and verification tracking

3. **admin_login** - Admin credentials
   - Username, password hash, session token
   - 24-hour session expiration

## User Personas & Features

### 1. Retailers (Public Portal)
- **URL**: `/`
- **Authentication**: None
- **Features**:
  - Browse all 15 Amul SKUs
  - Search by product name or SAP code
  - Filter by 4 major categories (Milk, Buttermilk, Paneer, Dahi)
  - View: Product Name, MRP/Unit, MRP/Crate, Retailer Price
  - Responsive mobile/tablet/desktop design

### 2. Distributors (Protected Dashboard)
- **URL**: `/distributor`
- **Authentication**: OTP login via phone number
- **Features**:
  - Same as retailers, plus:
  - Cost to WD (wholesale distributor cost)
  - GST percentage
  - Distributor-specific pricing
  - Recently updated products section
  - Demo OTP: `1111`

### 3. Admin (Management Portal)
- **URL**: `/admin`
- **Authentication**: Username/password credentials
- **Demo Credentials**: 
  - Username: `admin`
  - Password: `admin123`
- **Features**:
  - Upload Excel files with price updates
  - Preview changes before publishing
  - Automatic database updates
  - Sample Excel file: `public/sample-prices.xlsx`

## Project Structure

```
/app
  /page.tsx                       # Retailer homepage
  /distributor
    /login/page.tsx              # OTP login
    /page.tsx                    # Dashboard
  /admin
    /login/page.tsx              # Credentials login
    /page.tsx                    # Dashboard + Excel upload
  /api
    /products/route.ts           # Product data endpoint
    /auth
      /request-otp/route.ts      # OTP generation
      /verify-otp/route.ts       # OTP verification
      /admin-login/route.ts      # Admin login
      /logout/route.ts           # Session logout
      /verify-session/route.ts   # Session validation
    /admin
      /upload-excel/route.ts     # Excel parsing
      /publish-excel/route.ts    # Price updates

/components
  /header.tsx                    # Navigation header
  /product-table.tsx            # Role-aware table
  /search-filter.tsx            # Search + category filter

/lib
  /db.ts                        # Database connection
  /auth.ts                      # Auth utilities
  /excel-parser.ts              # Excel parsing logic

/middleware.ts                  # Route protection
```

## Workflow: Excel Import

1. Admin navigates to `/admin`
2. Logs in with credentials
3. Uploads Excel file (drag-and-drop or click)
4. System parses Excel and validates:
   - SAP code exists in database
   - Required fields present
   - Numeric data types valid
5. Preview table shows before/after prices
6. Admin reviews changes
7. Clicks "Publish" to update database
8. Success message confirms update
9. Retailers/distributors see live prices immediately

## Key Features Implemented

✅ **Retailer Portal**
- Public access, no auth required
- 15 seeded Amul products
- Search by name or SAP code
- Category filtering (Milk, Buttermilk, Paneer, Dahi)
- Responsive design
- Live pricing display

✅ **Distributor OTP Login**
- Phone number validation (10 digits)
- Demo OTP: 1111
- Session token generation
- 24-hour session expiry
- Ready for SMS integration (Twilio)

✅ **Admin Portal**
- Credentials-based login
- Demo credentials (admin/admin123)
- Session token management
- Excel upload infrastructure
- Data validation

✅ **Database**
- Neon PostgreSQL connection
- 3 optimized tables
- SAP code as primary key
- 15 sample products seeded

## Testing Checklist

- [x] Retailer portal loads all 15 products
- [x] Search functionality works
- [x] Category filtering works (tested Milk category)
- [x] Mobile-responsive layout
- [x] Header displays role correctly
- [x] Distributor OTP UI fully functional
- [x] Admin login page displays demo credentials
- [x] Sample Excel file created and ready for upload
- [x] Database connection verified
- [x] All API routes created
- [x] Authentication middleware in place

## Environment Variables

```
DATABASE_URL=postgresql://...    # Neon connection (auto-set)
ADMIN_USERNAME=admin             # Set in project settings
ADMIN_PASSWORD=admin123          # Set in project settings
```

## Deployment

### To Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push

### Environment Setup

```bash
# Install dependencies
pnpm install

# Run locally
pnpm dev

# Build for production
pnpm build
pnpm start
```

## Future Enhancements (Phase 2)

- SMS-based OTP via Twilio
- Email notifications for price changes
- Price history tracking and audit logs
- Multiple distributor accounts with unique pricing
- Regional pricing support
- Order placement functionality
- Analytics dashboard
- API for third-party integrations
- Bulk product management
- CSV export of pricing

## Demo Walkthrough

### For Retailers:
1. Open http://localhost:3000
2. Browse all Amul products
3. Click "Milk" to filter by category
4. Search for "paneer" to find Paneer products
5. View pricing in INR

### For Admins:
1. Go to http://localhost:3000/admin/login
2. Use credentials: admin / admin123
3. Navigate to Excel upload section
4. Download sample Excel from `/sample-prices.xlsx`
5. Upload to preview price changes

### For Distributors:
1. Go to http://localhost:3000/distributor/login
2. Enter any 10-digit phone number
3. Enter OTP: 1111
4. View distributor-specific pricing including Cost to WD

## Support & Maintenance

- **Database**: Managed via Neon dashboard
- **Monitoring**: Vercel analytics and logs
- **Backups**: Automatic via Neon
- **SSL**: Automatic via Vercel

## Notes

- MVP designed for quick demo to Amul management
- All 3 user personas functional with core features
- Sample data included for immediate testing
- Production-ready authentication structure
- Database prepared for scale (can add more SKUs without code changes)
