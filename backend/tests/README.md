# Container Management Backend Tests

## Overview

Comprehensive test suite for the Container Management System backend, covering all layers of the application architecture using Jest testing framework.

## Test Structure

### 1. **Model Tests** (`container.test.js`)
Tests the Mongoose Container model directly.

**Coverage:**
- ✅ Container creation with default values
- ✅ Container creation with location data
- ✅ Validation for container type enum
- ✅ Validation for province enum
- ✅ Unique containerId constraint
- ✅ Container level and status updates
- ✅ Error detection functionality
- ✅ Date and schedule handling
- ✅ Location features and coordinate validation
- ✅ Container capacity validation
- ✅ Query operations (by status, type, city, province)
- ✅ Aggregation operations

### 2. **Repository Tests** (`containerRepository.test.js`)
Tests the data access layer with MongoDB operations.

**Coverage:**
- ✅ CRUD operations (Create, Read, Update, Delete)
- ✅ Find operations by various criteria
- ✅ Update operations with business logic
- ✅ Bulk operations
- ✅ Statistical aggregations
- ✅ Pagination support
- ✅ Count operations
- ✅ Error handling for invalid data

### 3. **Service Tests** (`containerService.test.js`)
Tests the business logic layer.

**Coverage:**
- ✅ Container creation with business rules
- ✅ Container retrieval operations
- ✅ Container updates with auto-status logic
- ✅ Level validation and status transitions
- ✅ Deactivation/reactivation functionality
- ✅ Location assignment checking
- ✅ Collection operations
- ✅ Maintenance operations
- ✅ Container deletion with checks
- ✅ Statistical operations

### 4. **Controller Tests** (`containerController.test.js`)
Tests the HTTP API endpoints using supertest.

**Coverage:**
- ✅ POST /api/containers (create)
- ✅ GET /api/containers (get all)
- ✅ GET /api/containers/:id (get by ID)
- ✅ GET /api/containers/status/:status (get by status)
- ✅ GET /api/containers/errors (get with errors)
- ✅ GET /api/containers/province/:province (get by province)
- ✅ PUT /api/containers/:id (update)
- ✅ PUT /api/containers/:id/location (update location)
- ✅ GET /api/containers/:id/location-assigned (check location)
- ✅ PUT /api/containers/:id/deactivate (deactivate)
- ✅ PUT /api/containers/:id/reactivate (reactivate)
- ✅ PUT /api/containers/:id/schedule-collection (schedule)
- ✅ DELETE /api/containers/:id (delete)
- ✅ Error handling and validation
- ✅ Response format validation

## Running Tests

### All Tests
```bash
npm test
```

### Specific Test Files
```bash
# Model tests
npm test container.test.js

# Repository tests  
npm test containerRepository.test.js

# Service tests
npm test containerService.test.js

# Controller tests
npm test containerController.test.js
```

### Watch Mode
```bash
npm test -- --watch
```

### Coverage Report
```bash
npm test -- --coverage
```

## Test Environment Setup

### Prerequisites
1. **MongoDB Test Database**: Uses `MONGO_URI_TEST` or falls back to `MONGO_URI`
2. **Environment Variables**: Configured in `.env` file
3. **Jest Configuration**: Already configured in `package.json`

### Test Database
- Tests use a separate test database to avoid affecting development data
- Database is cleaned after each test (`afterEach` cleanup)
- Connection is managed in `tests/setup.js`

## Key Test Patterns

### 1. **Data Setup and Cleanup**
```javascript
afterEach(async () => {
  await Container.deleteMany({});
});
```

### 2. **Test Data Creation**
```javascript
beforeEach(async () => {
  await Container.create([
    { containerId: 'TEST001', containerType: 'plastic', containerCapacity: 100 },
    { containerId: 'TEST002', containerType: 'organic', containerCapacity: 150 }
  ]);
});
```

### 3. **API Testing with Supertest**
```javascript
const response = await request(app)
  .post('/api/containers')
  .send(containerData)
  .expect(201);

expect(response.body.containerId).toBe('TEST001');
```

### 4. **Error Handling Tests**
```javascript
await expect(
  containerService.updateContainerLevel('TEST001', 150)
).rejects.toThrow('Container level must be between 0 and 100');
```

## Test Scenarios Covered

### 🟢 **Happy Path Scenarios**
- Container creation with valid data
- Successful updates and retrievals
- Location assignment and checking
- Deactivation/reactivation cycles
- Collection scheduling and recording

### 🔴 **Error Scenarios**
- Invalid data validation
- Non-existent resource handling
- Duplicate ID prevention
- Business rule violations
- Database connection errors

### 🟡 **Edge Cases**
- Boundary value testing (levels 0, 80, 95, 100)
- Empty result sets
- Partial data scenarios
- MongoDB ObjectId vs business ID handling

## Business Logic Testing

### Status Transitions
- ✅ Available → Near Full (level ≥ 80%)
- ✅ Near Full → Full (level ≥ 95%)
- ✅ Any → Needs Maintenance (error detected)
- ✅ Any → Out of Service (deactivation)
- ✅ Out of Service → Available (reactivation)

### Location Logic
- ✅ Location assigned = address + city present
- ✅ Sensor simulation only for assigned locations
- ✅ Deactivated containers skipped in simulation

### Collection Logic
- ✅ Collection resets level to 0
- ✅ Status changes to Available after collection
- ✅ Collection scheduling sets appropriate status
- ✅ Cannot collect from Out of Service containers

## Mock and Stub Usage

### Database Mocking
- Real MongoDB connection for integration testing
- Test database isolation
- Automatic cleanup between tests

### External API Mocking
- Location update API calls mocked in controller tests
- Upstream API failures handled gracefully

## Performance Testing

### Database Operations
- ✅ Bulk operations efficiency
- ✅ Pagination functionality
- ✅ Aggregation performance
- ✅ Index usage validation

### API Response Times
- ✅ Request/response cycle testing
- ✅ Concurrent request handling
- ✅ Large dataset operations

## Validation Testing

### Input Validation
- ✅ Required field validation
- ✅ Enum value validation
- ✅ Data type validation
- ✅ Range validation (coordinates, levels)

### Output Validation
- ✅ Response structure consistency
- ✅ Data normalization
- ✅ Null/undefined handling
- ✅ Date format consistency

## Security Testing

### Data Sanitization
- ✅ SQL injection prevention (NoSQL context)
- ✅ Input sanitization
- ✅ XSS prevention in responses

### Access Control
- ✅ Parameter validation
- ✅ Resource existence checks
- ✅ Error message sanitization

## Continuous Integration

### Test Pipeline
1. **Setup**: Database connection and environment
2. **Unit Tests**: Model and repository layer
3. **Integration Tests**: Service layer
4. **API Tests**: Controller layer
5. **Cleanup**: Database and connections

### Quality Gates
- ✅ All tests must pass
- ✅ Code coverage > 80%
- ✅ No critical security vulnerabilities
- ✅ Performance benchmarks met

## Test Maintenance

### Adding New Tests
1. Follow existing patterns
2. Include both positive and negative cases
3. Add appropriate cleanup
4. Update documentation

### Test Data Management
- Use descriptive test IDs
- Clean data between tests
- Avoid test interdependencies
- Use factories for complex objects

## Coverage Goals

### Target Coverage
- **Statements**: > 90%
- **Branches**: > 85%
- **Functions**: > 95%
- **Lines**: > 90%

### Current Coverage Areas
- ✅ All CRUD operations
- ✅ Business logic rules
- ✅ Error handling
- ✅ API endpoints
- ✅ Data validation
- ✅ Status transitions

## Examples

### Running Specific Tests
```bash
# Test container creation
npm test -- --testNamePattern="should create a new container"

# Test deactivation functionality
npm test -- --testNamePattern="deactivate"

# Test API endpoints only
npm test containerController.test.js
```

### Debugging Tests
```bash
# Run with debug output
npm test -- --verbose

# Run single test file with logs
npm test container.test.js -- --verbose
```

This comprehensive test suite ensures the Container Management System is robust, reliable, and maintainable!