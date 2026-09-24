# Retention and deletion schedule — approval required

No vague “as long as necessary” rule is operationally sufficient. Approve exact periods and encode them in scheduled jobs.

| Data set | Proposed trigger | Period | End action | Backup handling | Approval |
|---|---|---:|---|---|---|
| Unconfirmed signup | Creation | 7 days | Delete account/metadata | Expire with backup cycle | Open |
| Active account/profile | Contract/account closure | TBD | Delete or legally justified restriction | Tombstone until backup expiry | Open |
| Diary and functional data | End of documented purpose/relationship | TBD | Delete/anonymise | Prevent ordinary restoration; expire copies | Open |
| Documents | End of purpose or verified request | TBD | Delete object and metadata | Track backup expiry | Open |
| Messages/case notes | End of relationship/purpose | TBD | Delete/restrict | Track backup expiry | Open |
| AI inputs/outputs | Generation/withdrawal/end of purpose | Minimal/TBD | Delete derived outputs; supplier retention per contract | Track backup expiry | Open |
| Audit events | Event date | Risk-based/TBD | Delete or aggregate | Track backup expiry | Open |
| Rejected representative application | Decision date | TBD | Delete/minimise | Track backup expiry | Open |
| Accounting records | End of financial year | Statutory period | Delete after obligation ends | Track backup expiry | Legal review |

Deletion jobs must be idempotent, logged without copying deleted content, monitored and tested. A legal hold must be scoped, approved, time-limited and reviewable.
