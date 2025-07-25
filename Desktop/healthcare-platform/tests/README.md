# Healthcare Platform Test Suite

## Overview

This test suite ensures the automatic protocol assignment system works correctly across all patient onboarding scenarios. The tests validate that standard protocols are automatically assigned to patients without requiring manual intervention from healthcare staff.

## Test Structure

```
tests/
├── unit/
│   └── services/
│       ├── protocol-service.test.ts      # Core protocol operations
│       └── protocol-seeder.test.ts       # Protocol seeding logic
├── integration/
│   ├── patient-onboarding.test.ts        # Patient creation flows
│   └── tenant-provisioning.test.ts       # Tenant setup & protocols
├── e2e/
│   └── (Playwright tests - to be implemented)
├── fixtures/
│   └── protocol-fixtures.ts              # Test data
└── setup.ts                              # Test configuration
```

## Running Tests

### Prerequisites

```bash
# Install dependencies
npm install

# Create test environment file
cp .env.example .env.test

# Set up test database (if using real DB)
npm run db:test:setup
```

### Run All Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test tests/unit/services/protocol-service.test.ts
```

### Test Categories

#### Unit Tests
Test individual service methods in isolation:
```bash
npm test tests/unit
```

#### Integration Tests
Test service interactions and workflows:
```bash
npm test tests/integration
```

#### E2E Tests (Coming Soon)
Full user journey testing with Playwright:
```bash
npm run test:e2e
```

## Key Test Scenarios

### 1. Automatic Protocol Assignment

**Patient Invitation Flow**
- Patient receives invitation with surgery details
- Accepts invitation and creates account
- Protocol automatically assigned based on surgery type
- All protocol tasks scheduled relative to surgery date

**Direct Patient Signup**
- Patient signs up directly
- Provides surgery information
- System assigns appropriate protocol
- Tasks created immediately

**Batch Import**
- Multiple patients imported via CSV/API
- Each patient receives protocol automatically
- No manual assignment needed

### 2. Tenant Protocol Management

**New Tenant Creation**
- Tenant account created
- Standard protocols automatically seeded
- Protocols ready for patient assignment

**Protocol Customization**
- Tenants can customize standard protocols
- Original templates remain unchanged
- Custom protocols available for assignment

### 3. Edge Cases

**Missing Protocol Handling**
- System falls back to generic protocol
- Admin notified of missing surgery type
- Patient still receives care pathway

**Duplicate Prevention**
- Patients cannot have multiple active protocols
- System checks before assignment
- Existing protocols respected

## Test Data

### Fixtures
Located in `tests/fixtures/protocol-fixtures.ts`:
- Standard protocol templates
- Sample patients
- Test tenants
- Invitation data

### Mock Data Generators
```typescript
// Create test patient
const patient = createMockPatient({
  surgery_type: 'TKA',
  surgery_date: '2025-03-01'
});

// Create test protocol
const protocol = createMockProtocol({
  is_template: true,
  surgery_types: ['TKA', 'THA']
});
```

## Debugging Tests

### View Test Output
```bash
# Verbose output
npm test -- --verbose

# Debug specific test
node --inspect-brk node_modules/.bin/jest tests/unit/services/protocol-service.test.ts
```

### Common Issues

1. **Mock Setup Issues**
   - Ensure mocks are cleared between tests
   - Check mock return values match expected types

2. **Async Timing**
   - Use proper async/await
   - Mock timers for delay testing

3. **Database State**
   - Tests should be isolated
   - Clean up after each test

## Writing New Tests

### Test Template
```typescript
describe('Feature Name', () => {
  beforeEach(() => {
    // Setup mocks and test data
  });

  afterEach(() => {
    // Cleanup
  });

  it('should perform expected behavior', async () => {
    // Arrange
    const testData = createTestData();
    
    // Act
    const result = await performAction(testData);
    
    // Assert
    expect(result).toMatchExpectedOutcome();
  });
});
```

### Best Practices

1. **Test One Thing**
   - Each test should verify a single behavior
   - Use descriptive test names

2. **Use Fixtures**
   - Reuse test data from fixtures
   - Keep tests DRY

3. **Mock External Dependencies**
   - Mock Supabase calls
   - Mock API requests
   - Control test environment

4. **Test Edge Cases**
   - Null/undefined values
   - Empty arrays
   - Error conditions

## Continuous Integration

### GitHub Actions
Tests run automatically on:
- Pull requests
- Pushes to main branch
- Scheduled daily runs

### Local Pre-commit
```bash
# Install pre-commit hooks
npm run prepare

# Run tests before commit
npm run pre-commit
```

## Performance Testing

### Load Testing Protocols
```bash
# Run performance tests
npm run test:performance

# Generate performance report
npm run test:performance:report
```

### Metrics Tracked
- Protocol assignment time
- Bulk import throughput
- Database query performance
- Memory usage

## Test Coverage Goals

- **Unit Tests**: 90%+ coverage
- **Integration Tests**: Critical paths covered
- **E2E Tests**: User journeys validated

### View Coverage Report
```bash
# Generate coverage report
npm test -- --coverage

# Open HTML report
open coverage/lcov-report/index.html
```

## Contributing

When adding new features:
1. Write tests first (TDD)
2. Ensure all tests pass
3. Maintain coverage levels
4. Update test documentation

## Support

For test-related issues:
- Check test output for errors
- Review mock setup
- Ensure test database is clean
- Ask in #testing Slack channel