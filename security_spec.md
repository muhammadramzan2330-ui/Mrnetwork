# Security Specification - ISP Management System

## Data Invariants
1. **User Identity**: Every user document must have a `uid` that matches their Firebase Auth UID.
2. **Role Integrity**: A customer cannot elevate their own role to 'admin'.
3. **Relational Sync**: Bills and Payments must link back to a valid `user` document ID via the `userId` field.
4. **Immutable Funds**: Customers cannot directly modify their `balance` or `walletBalance`. These are modified by system transactions or Admin approvals.
5. **Admin Authority**: Only Admins can approve/reject payments and manage packages/subdealers.

## Access Control Matrix
| Collection | Create | Read | Update | Delete |
|------------|--------|------|--------|--------|
| `user` | Admin | Admin / Self | Admin | Admin |
| `bills` | Admin | Admin / Owner | Admin | Admin |
| `payments` | Authenticated | Admin / Owner | Admin | Admin |
| `packages` | Admin | Authenticated | Admin | Admin |
| `logs` | Authenticated | Admin | Admin | Admin |
| `requests` | Authenticated | Admin / Owner | Admin / Owner (limited) | Admin |
| `subdealers` | Admin | Admin | Admin | Admin |
| `settings` | Admin | Admin | Admin | Admin |
| `treasury` | System (Admin) | Admin | Admin | Admin |

## The "Dirty Dozen" Payloads (Deny Cases)
1. **Identity Theft**: Customer tries to update their profile `uid` to match another user.
2. **Privilege Escalation**: Customer tries to update their `role` to 'admin'.
3. **Bank Hack**: Customer tries to increment their own `walletBalance` via a direct Firestore update.
4. **Billing Bypass**: Customer tries to mark their own `bill` as 'paid' without a payment.
5. **Unauthorized Snooping**: Customer tries to `list` payments belonging to another `userId`.
6. **Shadow Fields**: Admin (or attacker) tries to add a `isVerified: true` field to a package document that isn't in the schema.
7. **Orphaned Bill**: Attacker tries to create a `bill` for a non-existent `userId`.
8. **Malicious ID**: Attacker tries to create a document with a 1MB string as the ID.
9. **Role Spoofing**: User with same email but `email_verified: false` tries to access Admin data.
10. **State Skipping**: Customer tries to move a payment from 'pending' directly to 'approved'.
11. **Resource Exhaustion**: Attacker tries to flood the `logs` collection with 10MB strings in the `details` field.
12. **System Tampering**: Customer tries to update the `easypaisaNumber` in the global `settings`.
