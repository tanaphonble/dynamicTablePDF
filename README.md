# DynamicTablePDF
Generating dynamic table from arrays to pdf in client side.

## Usage
1. run ```npm install```
2. import jspdf and dynamicTablePdf
3. call function printPDF(data)

```javascript
data = [
    [vhcol00 , hcol01, hcol02, ... , hcol0n ],
    [vcol10, row00, row01, ... , row02],
    [vcol20, row10, row11, ... , row12],
    [vcol30, row20, row21, ... , row22],
        .
        .
        .
    [vcolm0, rowm0, rowm1, ... , rowmn]    
]
```

## Example

```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <link rel="icon" type="image/png" href="img/icon.png">
    <title>Example</title>
</head>

<body>
    <h3>Dynamic Table PDF</h3>
    <div style="display: block;">
        <button onclick="printPDF(tableData);">Get PDF file</button>
    </div>
    <script src="tableData.js"></script>
    <script src="node_modules/jspdf/dist/jspdf.min.js"></script>
    <script src="dynamicTablePdf.js"></script>
</body>

</html>
```

___
## Thanks & Credit
#### [jsPDF](https://github.com/MrRio/jsPDF)

## Acknowledgments
- Modify codes as you want.

## Version 
1.0.0 

## Author
##### Tanaphon Auanhinkong
##### a.tanaphon@gmail.com