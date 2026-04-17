# Firestore Security Specification - Quickar Partner

## Data Invariants
1. **Vendors**: Every vendor must have a profile. They can only modify their own profile (plan upgrades, order counts).
2. **Orders**: 
    - Can only be created by authenticated vendors.
    - Vendor must exist and have enough daily quota (if on Free plan).
    - Riders can only update orders they are assigned to (status changes).
    - Orders are immutable in certain fields (createdAt, vendorId) after creation.
3. **Products**: Only the owner (vendor) can create/update/delete their products.

## The "Dirty Dozen" Payloads (Anti-Patterns)
1. **Identity Spoofing**: Attempting to create an order with another vendor's `vendorId`.
2. **Role Escalation**: Attempting to upgrade own vendor plan to 'pro' without calling `upgradeVendorPlan` helper logic (direct write).
3. **Quota Bypass**: Attempting to create an order when `dailyOrderCount` >= 5 on Free plan (enforced via rules).
4. **State Skip**: Rider marking an order as `delivered` when it's still `placed` or `accepted` (not `picked`).
5. **Orphaned Write**: Creating an order for a non-existent vendor profile.
6. **Ghost Updates**: Updating a product owned by another vendor.
7. **Immutable Violation**: Changing the `createdAt` timestamp of an order.
8. **ID Poisoning**: Using a 2KB string as a document ID for an order.
9. **PII Leak**: A non-assigned rider reading customer phone numbers of unrelated orders (Need to restrict read access).
10. **Shadow Field Injection**: Adding an `isAdmin: true` field to a user profile.
11. **Batch Atomicity Violation**: Incrementing `dailyOrderCount` without creating an order (though the app does it, rules should ideally check atomicity if possible via `existsAfter`).
12. **Status Hijacking**: A rider assigning themselves to an order already taken by another rider.

## Hardened Rule Blueprint (DRAFT)
- **Vendors**: strict schema check, only owner can update `plan` (if logic allows) and `orderCount`.
- **Orders**: `isValidOrder` helper, `exists(/databases/$(database)/documents/vendors/$(incoming().vendorId))`, status transition logic.
- **Users**: basic profile mapping.
