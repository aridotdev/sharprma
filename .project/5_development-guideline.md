# DEVELOPMENT GUIDELINES

## 1 Git Workflow

```
Main branch: main
Feature branch: feature/feature-name
Bugfix branch: bugfix/bug-name

Commit message format:
- feat: Add feature X
- fix: Fix bug Y
- docs: Update documentation
- refactor: Refactor module Z
- test: Add test for X
```

## 2 Development Phases

**Phase 1: Database & Auth (Week 1)**

```
- Setup Drizzle schema
- Generate migrations
- Setup Better-Auth
- User registration & login
- Role-based middleware
```

**Phase 2: Master Data (Week 1-2)**

```
- Vendor CRUD
- Product Model CRUD
- Notification Ref CRUD
- Defect Master CRUD
- Vendor Rules setup
```

**Phase 3: Claim Flow - CS (Week 2-3)**

```
- Create claim form
- Photo upload
- Claim list & filter
- Claim detail view
- Revisi claim
```

**Phase 4: Claim Flow - QRCC (Week 3-4)**

```
- Review claim
- Photo review
- Approve/reject logic
- Status auto-calculation
```

**Phase 5: Vendor Claim (Week 4-5)**

```
- Generate vendor claim
- Excel export with photo links
- Input vendor decision
- Compensation tracking
```

**Phase 6: Reports (Week 5-6)**

```
- Dashboard widgets
- Claim list with filter
- Vendor performance report
- Excel export
```

**Phase 7: Testing & Polish (Week 6-7)**

```
- Unit tests (repositories, services)
- Integration tests (API endpoints)
- Bug fixes
- UI/UX polish
```

**Phase 8: Demo & Production (Week 7-8)**

```
- Final testing
- Demo preparation
- Documentation
- Deployment
```