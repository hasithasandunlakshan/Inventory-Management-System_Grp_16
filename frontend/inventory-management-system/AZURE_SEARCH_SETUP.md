# Azure AI Search Setup Guide

## Overview

This guide explains how to set up and configure Azure AI Search for the Inventory Management System's intelligent search capabilities.

## Prerequisites

- Azure subscription
- Azure AI Search service deployed
- Admin access to the search service

## Configuration Steps

### 1. Get Azure Search Credentials

1. Navigate to your Azure AI Search service in the Azure portal
2. Go to "Keys" section
3. Copy the **Admin Key** (not the Query Key)
4. Note your service endpoint URL

### 2. Environment Variables

Add the following to your `.env.local` file:

```bash
# Azure AI Search Configuration
AZURE_SEARCH_ENDPOINT=https://your-search-service.search.windows.net
AZURE_SEARCH_API_KEY=your-admin-key-here
AZURE_SEARCH_INDEX_NAME=inventory-index
```

### 3. Index Schema

Create an index with the following schema:

```json
{
  "name": "inventory-index",
  "fields": [
    {
      "name": "id",
      "type": "Edm.String",
      "key": true,
      "searchable": false
    },
    {
      "name": "entityType",
      "type": "Edm.String",
      "filterable": true,
      "facetable": true
    },
    {
      "name": "name",
      "type": "Edm.String",
      "searchable": true,
      "filterable": true
    },
    {
      "name": "description",
      "type": "Edm.String",
      "searchable": true
    },
    {
      "name": "category",
      "type": "Edm.String",
      "filterable": true,
      "facetable": true
    },
    {
      "name": "price",
      "type": "Edm.Double",
      "filterable": true,
      "sortable": true
    },
    {
      "name": "stockLevel",
      "type": "Edm.Int32",
      "filterable": true,
      "sortable": true
    },
    {
      "name": "stockStatus",
      "type": "Edm.String",
      "filterable": true,
      "facetable": true
    },
    {
      "name": "supplier",
      "type": "Edm.String",
      "filterable": true,
      "searchable": true
    },
    {
      "name": "createdDate",
      "type": "Edm.DateTimeOffset",
      "filterable": true,
      "sortable": true
    }
  ]
}
```

### 4. Data Indexing

To populate the search index with your inventory data:

1. **Products**: Index product information including name, description, category, price, stock levels
2. **Suppliers**: Index supplier details, contact information, and performance metrics
3. **Documents**: Index analyzed documents from Document Intelligence
4. **Purchase Orders**: Index order details, items, status, and dates

### 5. Search Configuration

Configure the following search features:

- **Semantic Search**: Enable semantic search for better understanding
- **Suggesters**: Set up autocomplete for product names and categories
- **Scoring Profiles**: Configure relevance scoring for better results
- **CORS**: Enable CORS for frontend access

## Security Considerations

### API Key Management

- Store API keys in environment variables only
- Use Admin Key for indexing, Query Key for search (if available)
- Rotate keys regularly
- Never expose keys in client-side code

### Access Control

- Implement role-based access control for search results
- Filter results based on user permissions
- Log search queries for audit purposes

### Rate Limiting

- Implement rate limiting on search API
- Monitor usage and set appropriate limits
- Consider caching for frequently searched terms

## Testing the Implementation

### 1. Health Check

Test the search service health:

```bash
curl -X GET "http://localhost:3000/api/ml/search"
```

### 2. Search Test

Test a basic search:

```bash
curl -X POST "http://localhost:3000/api/ml/search" \
  -H "Content-Type: application/json" \
  -d '{"query": "electronics", "top": 10}'
```

### 3. Frontend Testing

1. Navigate to ML Services → AI Search
2. Try natural language queries:
   - "low stock electronics"
   - "suppliers in California"
   - "products under $100"
3. Test filters and facets
4. Verify search suggestions work

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure CORS is enabled in Azure Search
2. **Authentication Errors**: Verify API key and endpoint URL
3. **Empty Results**: Check if index is populated with data
4. **Slow Performance**: Optimize index schema and queries

### Performance Optimization

1. **Index Optimization**:
   - Use appropriate field types
   - Set proper analyzers
   - Configure scoring profiles

2. **Query Optimization**:
   - Use filters instead of search when possible
   - Limit result count appropriately
   - Use faceted search for better UX

3. **Caching**:
   - Implement result caching
   - Cache popular searches
   - Use CDN for static content

## Monitoring and Analytics

### Search Analytics

- Track popular search terms
- Monitor search performance
- Analyze user behavior
- Identify search failures

### Performance Metrics

- Search response time
- Result relevance scores
- User engagement metrics
- Error rates and types

## Production Deployment

### Environment Setup

1. **Production Environment Variables**:

   ```bash
   AZURE_SEARCH_ENDPOINT=https://prod-search.search.windows.net
   AZURE_SEARCH_API_KEY=prod-admin-key
   AZURE_SEARCH_INDEX_NAME=inventory-prod
   ```

2. **Index Management**:
   - Set up automated indexing
   - Configure index updates
   - Monitor index health

3. **Security**:
   - Use Managed Identity when possible
   - Implement proper access controls
   - Set up monitoring and alerting

### Scaling Considerations

- **Index Size**: Monitor index size and performance
- **Query Volume**: Scale based on search volume
- **Geographic Distribution**: Consider multi-region deployment
- **Backup and Recovery**: Implement proper backup strategies

## Support and Resources

- [Azure AI Search Documentation](https://docs.microsoft.com/en-us/azure/search/)
- [Search Service REST API](https://docs.microsoft.com/en-us/rest/api/searchservice/)
- [Index Schema Reference](https://docs.microsoft.com/en-us/azure/search/search-what-is-an-index)
- [Query Syntax](https://docs.microsoft.com/en-us/azure/search/query-lucene-syntax)
