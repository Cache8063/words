# Migration Plan: Dev/Test/Prod Setup

## Current State
- **wordsv3** stack running on port 8086 (production users actively playing)
- Using `ghcr.io/cache8063/words:latest` image
- Pulling from git repository

## New Setup
Three separate stacks with automatic updates:
- **words-dev** (port 8086) - Development environment
- **words-staging** (port 8087) - Testing environment  
- **words-production** (port 8088) - New production environment

## Migration Steps

### Phase 1: Deploy New Environments (No User Impact)
```bash
./deploy-all-environments.sh
```
This creates three new stacks without touching wordsv3.

### Phase 2: Test New Production
1. Access http://ollama.cloudforest-basilisk.ts.net:8088
2. Verify game works correctly
3. Test all features and themes

### Phase 3: Gradual Migration
1. **Option A - DNS/Proxy Switch** (Recommended):
   - Update your reverse proxy to point to port 8088 instead of 8086
   - No downtime, instant switch
   
2. **Option B - Port Swap**:
   - Stop wordsv3 stack
   - Update words-production to use port 8086
   - Start words-production
   - ~30 seconds downtime

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
- **8086**: Currently wordsv3 (will become words-dev after migration)
- **8087**: words-staging (testing)
- **8088**: words-production (new production)

## Benefits After Migration
- ✅ Separate dev/test environments
- ✅ Automatic updates from branches
- ✅ No accidental production deployments
- ✅ Testing environment for QA
- ✅ High availability (2 replicas in production)