# Diamond Body — API Reference

Base URL: `http://localhost:5000/api/v1`
All responses use the envelope:
```json
{ "success": true, "message": "OK", "data": <payload>, "meta": <optional> }
```

Errors:
```json
{ "success": false, "message": "Human error message", "details": [ ... ] }
```

Authenticated endpoints require the header:
```
Authorization: Bearer <accessToken>
```

---

## Authentication — `/auth`

| Method | Path | Auth | Body | Description |
|---|---|---|---|---|
| POST | `/auth/register` | — | `{ email, password, fullName, phone?, nationId? }` | Member self-registration. If `nationId` given → status `PENDING` until nation leader approves. |
| POST | `/auth/login` | — | `{ email, password }` | Returns `{ user, accessToken, refreshToken }` |
| POST | `/auth/refresh` | — | `{ refreshToken }` | Rotates and returns new pair |
| POST | `/auth/logout` | — | `{ refreshToken }` | Revokes that session |
| GET | `/auth/me` | ✅ | — | Current user |
| POST | `/auth/change-password` | ✅ | `{ currentPassword, newPassword }` | Revokes all other sessions |
| POST | `/auth/forgot-password` | — | `{ email }` | Sends reset link (silent success) |
| POST | `/auth/reset-password` | — | `{ userId, token, newPassword }` | Consumes token, resets password |

---

## Nations — `/nations`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/nations` | — | Public list of the 8 nations |
| GET | `/nations/slug/:slug` | — | Get a single nation by slug (e.g. `vision-nation`) |

---

## Products — `/products`

| Method | Path | Auth | Query | Description |
|---|---|---|---|---|
| GET | `/products` | — | `q, category, featured, bestSeller, minPrice, maxPrice, sort, page, limit` | Paginated list |
| GET | `/products/featured` | — | — | Featured products |
| GET | `/products/best-sellers` | — | — | Best sellers |
| GET | `/products/categories` | — | — | All categories |
| GET | `/products/:slug` | — | — | Product detail |

---

## Pickup Stations — `/pickup-stations`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/pickup-stations` | — | Active stations (for checkout dropdown) |

---

## Orders — `/orders`

| Method | Path | Auth | Body | Description |
|---|---|---|---|---|
| POST | `/orders` | optional | see below | Place order (guest or member). |
| POST | `/orders/:orderId/payment-proof` | ✅ | `multipart/form-data` field `proof` | Upload bank transfer proof (image or PDF). Sets order.paymentStatus → AWAITING_VERIFICATION. |

**Order body:**
```json
{
  "customerName": "Amara Okafor",
  "email": "amara@example.com",
  "phone": "+2348012345001",
  "nationSlug": "vision-nation",
  "referralCode": "REF-1234",
  "deliveryMethod": "HOME_DELIVERY",
  "shippingStreet": "12 Admiralty Way",
  "shippingCity": "Lekki",
  "shippingState": "Lagos",
  "shippingCountry": "Nigeria",
  "pickupStationId": null,
  "shippingFee": 2500,
  "discount": 0,
  "promoCode": null,
  "paymentMethod": "BANK_TRANSFER",
  "paystackReference": null,
  "items": [
    { "productId": "<uuid>", "quantity": 2 }
  ]
}
```

Prices are recalculated on the server — client-sent totals are ignored.

---

## Members — `/members` (auth required)

| Method | Path | Description |
|---|---|---|
| GET | `/members/me` | Profile + nation + addresses |
| PATCH | `/members/me` | Update name / phone |
| GET | `/members/me/orders` | Paginated own orders |
| GET | `/members/me/orders/:id` | Own order detail |
| GET | `/members/me/addresses` | List addresses |
| POST | `/members/me/addresses` | Add address |
| DELETE | `/members/me/addresses/:id` | Delete address |
| GET | `/members` | ADMIN — list all members. Filters: `nationId, status, q, page, limit` |

---

## Nation Leader — `/leader` (role: NATION_LEADER, scoped)

| Method | Path | Description |
|---|---|---|
| GET | `/leader/dashboard` | Stats + recent orders |
| GET | `/leader/members` | Members in *your* nation (filter `?status=PENDING`) |
| PATCH | `/leader/members/:id/approve` | Approve a pending member |
| PATCH | `/leader/members/:id/status` | Set member status (ACTIVE/SUSPENDED/DISABLED) |
| GET | `/leader/orders` | Orders in *your* nation |
| GET | `/leader/orders/:id` | Order detail (must belong to nation) |

Leaders **cannot** see other nations. Enforced via `scopeToNation` middleware.

---

## Admin / Super Admin — `/admin` (role: ADMIN or SUPER_ADMIN)

### Dashboard
| Method | Path | Description |
|---|---|---|
| GET | `/admin/dashboard` | Global stats, ordersByNation, revenue, pending proofs, recent orders |

### Nations (admin view)
| Method | Path | Description |
|---|---|---|
| GET | `/admin/nations` | All nations with leader + counts |
| PATCH | `/admin/nations/:id` | Update name/description/status |

### Nation Leaders
| Method | Path | Body | Description |
|---|---|---|---|
| GET | `/admin/leaders` | — | List all leaders |
| POST | `/admin/leaders` | `{ email, fullName, phone?, nationId, password? }` | Create leader (also assigns nation) |
| PATCH | `/admin/leaders/:id` | `{ fullName?, phone?, nationId? }` | Edit leader / reassign nation |
| PATCH | `/admin/leaders/:id/status` | `{ status: "ACTIVE"\|"SUSPENDED"\|"DISABLED" }` | Change status (revokes sessions if not ACTIVE) |
| POST | `/admin/leaders/:id/reset-password` | `{ newPassword? }` | Admin resets leader password |
| DELETE | `/admin/leaders/:id` | — | Delete leader (nation detached) |

### Products
| Method | Path | Description |
|---|---|---|
| POST | `/admin/products` | Create product |
| PATCH | `/admin/products/:id` | Update product |
| DELETE | `/admin/products/:id` | Soft-delete (isActive = false) |
| DELETE | `/admin/products/:id/permanent` | SUPER_ADMIN only — hard delete |
| POST | `/admin/categories` | Create category |
| PATCH | `/admin/categories/:id` | Update category |
| DELETE | `/admin/categories/:id` | Delete category |

### Orders
| Method | Path | Description |
|---|---|---|
| GET | `/admin/orders` | Filters: `status, paymentStatus, nationId, q, from, to, page, limit` |
| GET | `/admin/orders/:id` | Full order detail |
| PATCH | `/admin/orders/:id/status` | `{ status?, trackingNumber?, adminNotes? }` |

### Payment Proofs
| Method | Path | Body | Description |
|---|---|---|---|
| PATCH | `/admin/payment-proofs/:id` | `{ action: "APPROVE"\|"REJECT", rejectionReason? }` | Approving sets order.paymentStatus=PAID, status=PROCESSING |

### Pickup Stations
| Method | Path | Description |
|---|---|---|
| GET | `/admin/pickup-stations` | All stations |
| POST | `/admin/pickup-stations` | Create (`{ name, address, city, state, phone?, hours? }`) |
| PATCH | `/admin/pickup-stations/:id` | Update fields including status |
| DELETE | `/admin/pickup-stations/:id` | Delete |

### Reports
| Method | Path | Query | Description |
|---|---|---|---|
| GET | `/admin/reports/orders` | `from, to, nationId, paymentStatus, status` | Returns `{ orders, summary }`. The frontend can pipe this into its ExcelJS export. |

---

## File Uploads

Payment proof files are stored on disk under `/uploads/payment-proofs/<random>.<ext>` and served publicly under the URL path `/uploads/payment-proofs/<file>`.

- Max size: `MAX_UPLOAD_SIZE_MB` env (default 5 MB)
- Allowed mime: JPG, JPEG, PNG, WEBP, PDF
- Filenames are randomized (16 bytes hex + timestamp) to prevent guessing

For production, mount this directory on a persistent volume (Render, Railway, or S3-compatible bucket).

---

## Error Codes

| Status | Meaning |
|---|---|
| 400 | Bad request / invalid body |
| 401 | Missing or invalid access token |
| 403 | Authenticated but not permitted (wrong role / wrong nation / suspended) |
| 404 | Resource not found |
| 409 | Conflict (duplicate email, nation already has a leader, etc.) |
| 422 | Validation failed (`details` array explains which fields) |
| 429 | Rate limit exceeded |
| 500 | Server error |
