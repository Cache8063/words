# Migration Plan: Dev/Test/Prod Setup

## Current State
- **wordsv3** stack running on port 8086 (production users actively playing)
- Using `ghcr.io/cache8063/words:latest` image
- Pulling from git repository

## New Setup
Three separate stacks with automatic updates:
- **words-dev** (port 8089) - Development environment
- **words-staging** (port 8087) - Testing environment  
- **words-production** (port 8086) - Production environment (same port as current)

## Migration Steps

### Phase 1: Deploy New Environments (No User Impact)
```bash
./deploy-all-environments.sh
```
This creates three new stacks without touching wordsv3.

### Phase 2: Deploy Dev and Staging
1. Run `./deploy-all-environments.sh`
2. This will create words-dev (8089) and words-staging (8087)
3. words-production will fail initially (port 8086 in use)

### Phase 3: Production Migration
Since words-production uses the same port (8086) as wordsv3:

1. **Quick Switch** (Recommended - ~10 seconds downtime):
   ```bash
   # In Portainer:
   # 1. Stop wordsv3 stack
   # 2. Run: ./deploy-all-environments.sh
   # 3. words-production will deploy on port 8086
   ```
   
2. **Manual Migration**:
   - Stop wordsv3 in Portainer
   - Deploy words-production stack
   - Verify it's working
   - Remove wordsv3 stack

3. **Option C - Load Balancer**:
   - Configure load balancer to split traffic
   - Gradually shift from wordsv3 to words-production
   - Monitor for issues

### Phase 4: Cleanup (After Verification)
1. Monitor new production for 24-48 hours
2. Once stable, remove wordsv3 stack
3. Update any documentation/bookmarks

## Rollback Plan
If issues occur:
1. Switch proxy back to wordsv3 (Option A)
2. Or stop words-production and start wordsv3 (Option B)

## Port Summary
- **8086**: Production (currently wordsv3, will become words-production)
- **8087**: Staging (words-staging)
- **8089**: Development (words-dev)

## Benefits After Migration
- ✅ Separate dev/test environments
- ✅ Automatic updates from branches
- ✅ No accidental production deployments
- ✅ Testing environment for QA
- ✅ High availability (2 replicas in production)