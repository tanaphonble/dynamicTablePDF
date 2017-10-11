let doc = new jsPDF('l', 'pt', 'a4');
const GREY = "#707070";
const BLACK = "#000";
const MAX_WIDTH_PDF = 842;
const MAX_HEIGHT_PDF = 595;
const SPACE_LEFT = 40;
const SPACE_TOP = 40;
const SPACE_RIGHT = 40;
const SPACE_BOTTOM = 40;
const MAX_WIDTH_ALLOW = MAX_WIDTH_PDF - SPACE_RIGHT - SPACE_LEFT;
const MAX_HEIGHT_ALLOW = MAX_HEIGHT_PDF - SPACE_BOTTOM - SPACE_TOP;

const COLUMN_GAP = 10;
const CANVAS_RATIO = 2;
const COLUMN_TEXT_SPACE_RATIO = 0.75;

function getTextWidth(ctx, txt) {
    return (ctx.measureText(txt).width + COLUMN_GAP) * COLUMN_TEXT_SPACE_RATIO;
}

function convertSize(unit) {
    return unit * CANVAS_RATIO;
}

function drawColumn(ctx, cols, drawHelper) {
    ctx.font = 'bold ' + convertSize(8) + 'px Arial';
    let colWidths = cols.map(txt => { return getTextWidth(ctx, txt) + convertSize(drawHelper.offsetX) });
    drawHelper.totalWidth = colWidths.reduce((a, b) => a + b);
    ctx.strokeStyle = GREY;
    ctx.strokeRect(
        convertSize(drawHelper.xPointers[0]),
        convertSize(drawHelper.yPointers[0]),
        convertSize(MAX_WIDTH_ALLOW),
        convertSize(drawHelper.rowHeight)
    );
    ctx.fillStyle = BLACK;
    cols.map((colText, idx) => {
        if (idx === 0) {
            ctx.fillText(
                colText,
                convertSize(drawHelper.xPointers[0] + drawHelper.offsetX),
                convertSize(drawHelper.yPointers[0] + drawHelper.textDY)
            );
        } else {
            let previousX = drawHelper.xPointers[idx - 1];
            let nextXPointer = previousX += colWidths[idx - 1];
            drawHelper.xPointers.push(nextXPointer);
            ctx.fillText(
                colText,
                convertSize(nextXPointer + drawHelper.offsetX),
                convertSize(drawHelper.yPointers[0] + drawHelper.textDY)
            );
        }
    });
}

function drawRow(ctx, verticalLeftColumns, rows, drawHelper) {
    ctx.font = convertSize(8) + 'px Arial';
    rows.map((row, idx) => {
        let nextYPointer = drawHelper.yPointers[idx] += drawHelper.rowHeight;
        drawHelper.yPointers.push(nextYPointer);
        ctx.strokeRect(
            convertSize(drawHelper.xPointers[0]),
            convertSize(nextYPointer),
            convertSize(MAX_WIDTH_ALLOW),
            convertSize(drawHelper.rowHeight)
        );
        ctx.fillText(
            verticalLeftColumns[idx],
            convertSize(drawHelper.xPointers[0] + drawHelper.offsetX),
            convertSize(nextYPointer + drawHelper.textDY)
        );
        row.map((rowText, i) => {
            ctx.fillText(
                rowText,
                convertSize(drawHelper.xPointers[i + 1] + drawHelper.offsetX),
                convertSize(nextYPointer + drawHelper.textDY)
            );
        });
    })
}

function drawTable(cols, verticalLeftColumns, rows, drawHelper, ctx, canvas) {
    let imageData = '';
    drawColumn(ctx, cols, drawHelper);
    drawRow(ctx, verticalLeftColumns, rows, drawHelper);

    imageData = canvas.toDataURL('image/png');

    return imageData;
}

const printPDF = (tData) => {
    const imgs = drawDynamicTable(tData);
    printTables(imgs, doc);
    doc.save('table.pdf');
}

function DrawHelper() {
    _ = this;
    _.tableWidth = 0;
    _.xPointers = [40];
    _.yPointers = [40];
    _.rowHeight = 30;
    _.textDY = 20;
    _.offsetX = 8;
    _.maxRows = Math.floor(MAX_HEIGHT_ALLOW / _.rowHeight - 1);
    _.currentColumnIndexPointer = 0;
}

DrawHelper.prototype.resetPointer = function () {
    _.yPointers = [40];
    _.xPointers = [40];
}

DrawHelper.prototype.calculateMaxColumnContain = function (columns, ctx) {
    let totalWidth = 0;
    for (let i = 0; i < columns.length; i++) {
        totalWidth += getTextWidth(ctx, columns[i]) + convertSize(_.offsetX);
        if (totalWidth > MAX_WIDTH_ALLOW) {
            return i;
        }
    }
    return columns.length;
}

function drawDynamicTable(tableData) {
    let drawHelper = new DrawHelper();
    const imageDataList = [];
    let columns = tableData.shift();
    let firstColumnName = columns.shift();
    let verticalLeftColumns = tableData.map(row => row.shift());
    let rows = tableData.slice();
    let numberTable = Math.ceil(rows.length / drawHelper.maxRows);
    let canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');
    canvas.width = convertSize(MAX_WIDTH_PDF);
    canvas.height = convertSize(MAX_HEIGHT_PDF);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = convertSize(8) + 'px Arial';
    let mirrorColumns = columns.slice();
    let _columnsList = [];
    while (mirrorColumns.length > 0) {
        mirrorColumns.unshift(firstColumnName);
        let _cols = mirrorColumns.splice(0, drawHelper.calculateMaxColumnContain(mirrorColumns, ctx));
        _columnsList.push(_cols);
    }
    for (let i = 0; i < numberTable; i++) {
        let _verticalLeftColumns = verticalLeftColumns.splice(0, drawHelper.maxRows);
        let _rowsAll = rows.splice(0, drawHelper.maxRows);
        let colPointer = 0;
        _columnsList.map(cols => {
            let _rows = _rowsAll.map((r, idx) => {
                return r.slice(colPointer, colPointer + (cols.length - 1));
            });
            colPointer += cols.length - 1;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawHelper.resetPointer();
            imageDataList.push(drawTable(cols, _verticalLeftColumns, _rows, drawHelper, ctx, canvas));
        });
    }
    return imageDataList;
}

function printTables(imgs, doc) {
    for (let i = 0; i < imgs.length; i++) {
        doc.addImage(imgs[i], 'PNG', 0, 0, MAX_WIDTH_PDF, MAX_HEIGHT_PDF, undefined, 'FAST');
        doc.addPage();
    }
}