# Quick Filter Configuration Reference

## How to Discover Your Report's Filters

### Method 1: Use the Filter Discovery Tool (Recommended)
1. Start your server: `npm start`
2. Open in browser: `http://localhost:8080/discover-filters.html`
3. Click "Load Report"
4. Click "Get Report Filters" or "Get Page Filters"
5. Copy the filter structure from the results

### Method 2: Power BI Desktop
1. Open your report in Power BI Desktop
2. Go to **Model** view (left sidebar icon)
3. You'll see all tables and columns
4. Note the exact names (case-sensitive)

### Method 3: Power BI Service
1. Open your report in Power BI Service
2. Click **Edit** to enter edit mode
3. Look at the **Fields** pane on the right
4. Expand tables to see columns

## Configuring Filters in app.js

Open [`public/app.js`](public/app.js:195) and find the `filters` array in the `fetchEmbedInfo()` function.

### Basic Filter Examples

#### Filter by Single Value
```javascript
const filters = [
    {
        $schema: "http://powerbi.com/product/schema#basic",
        target: {
            table: "Sales",        // Your table name
            column: "Country"      // Your column name
        },
        operator: "In",
        values: ["USA"],           // Your filter value(s)
        filterType: 1
    }
];
```

#### Filter by Multiple Values
```javascript
const filters = [
    {
        $schema: "http://powerbi.com/product/schema#basic",
        target: {
            table: "Products",
            column: "Category"
        },
        operator: "In",
        values: ["Electronics", "Computers", "Phones"],
        filterType: 1
    }
];
```

#### Multiple Filters (AND logic)
```javascript
const filters = [
    {
        $schema: "http://powerbi.com/product/schema#basic",
        target: {
            table: "Sales",
            column: "Country"
        },
        operator: "In",
        values: ["USA", "Canada"],
        filterType: 1
    },
    {
        $schema: "http://powerbi.com/product/schema#basic",
        target: {
            table: "Sales",
            column: "Year"
        },
        operator: "In",
        values: [2024],
        filterType: 1
    }
];
```

### Advanced Filter Examples

#### Date Range Filter
```javascript
const filters = [
    {
        $schema: "http://powerbi.com/product/schema#advanced",
        target: {
            table: "Sales",
            column: "OrderDate"
        },
        logicalOperator: "And",
        conditions: [
            {
                operator: "GreaterThanOrEqual",
                value: "2024-01-01T00:00:00.000Z"
            },
            {
                operator: "LessThan",
                value: "2024-12-31T23:59:59.999Z"
            }
        ],
        filterType: 0
    }
];
```

#### Text Contains Filter
```javascript
const filters = [
    {
        $schema: "http://powerbi.com/product/schema#advanced",
        target: {
            table: "Products",
            column: "ProductName"
        },
        logicalOperator: "And",
        conditions: [
            {
                operator: "Contains",
                value: "Pro"
            }
        ],
        filterType: 0
    }
];
```

#### Numeric Range Filter
```javascript
const filters = [
    {
        $schema: "http://powerbi.com/product/schema#advanced",
        target: {
            table: "Sales",
            column: "Amount"
        },
        logicalOperator: "And",
        conditions: [
            {
                operator: "GreaterThan",
                value: 1000
            },
            {
                operator: "LessThanOrEqual",
                value: 5000
            }
        ],
        filterType: 0
    }
];
```

## Where to Configure

### Location in Code
File: [`public/app.js`](public/app.js:186)
Function: `fetchEmbedInfo()`
Line: ~195

```javascript
async function fetchEmbedInfo() {
    try {
        updateStatus('loading', 'Fetching embed token...');
        
        // ⬇️ CONFIGURE YOUR FILTERS HERE ⬇️
        const filters = [
            {
                $schema: "http://powerbi.com/product/schema#basic",
                target: {
                    table: "YourTableName",  // ← Change this
                    column: "YourColumnName" // ← Change this
                },
                operator: "In",
                values: ["Value1", "Value2"], // ← Change this
                filterType: 1
            }
        ];
        // ⬆️ CONFIGURE YOUR FILTERS HERE ⬆️
        
        const response = await fetch('/api/getEmbedInfo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ filters: filters })
        });
        
        // ... rest of the code
    }
}
```

## Testing Your Filters

1. Update the filter configuration in [`public/app.js`](public/app.js:195)
2. Save the file
3. Refresh your browser at `http://localhost:8080`
4. Open browser console (F12) to see filter logs
5. Verify the report shows only filtered data

## Common Filter Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `"In"` | Matches any of the values | `values: ["USA", "Canada"]` |
| `"NotIn"` | Excludes the values | `values: ["Inactive"]` |
| `"GreaterThan"` | Greater than | `value: 100` |
| `"LessThan"` | Less than | `value: 1000` |
| `"GreaterThanOrEqual"` | Greater than or equal | `value: 0` |
| `"LessThanOrEqual"` | Less than or equal | `value: 100` |
| `"Contains"` | Text contains | `value: "Pro"` |
| `"StartsWith"` | Text starts with | `value: "A"` |
| `"Is"` | Equals | `value: "Active"` |
| `"IsNot"` | Not equals | `value: "Deleted"` |
| `"IsBlank"` | Is null/empty | No value needed |
| `"IsNotBlank"` | Is not null/empty | No value needed |

## Need Help?

1. Use the Filter Discovery Tool: `http://localhost:8080/discover-filters.html`
2. Check the browser console for detailed logs
3. Verify table and column names are exact matches (case-sensitive)
4. Ensure values exist in your dataset
