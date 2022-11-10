function onOpen() {
    // ... 
    addMenuTNT();
}

function addMenuTNT() {
    var ui = SpreadsheetApp.getUi();

    ui.createMenu('T&T')
        //.addItem('Bestellung (manual)', 'menuItem1')
        .addItem("Bestellung generieren...", 'menuBestellungGenerieren')
        .addToUi();
}

function menuBestellungGenerieren() {
    const ui = HtmlService.createTemplateFromFile('prompt.html')

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const all_sheets = ss.getSheets();

    const colSet = new Set();
    const colDict = {}
    all_sheets.forEach(s => {
        const headers = s.getDataRange().getValues()[0].filter(x => x !== "");
        colDict[s.getName()] = headers;
        headers.forEach(h => colSet.add(h));
    })

    ui.data = {
        colDict,
        inventoryDefault: ss.getActiveSheet().getName(),
        productsDefault: "Produktkatalog",
    }

    SpreadsheetApp.getUi().showModalDialog(ui.evaluate(), "Bestellung generieren")
}


/**
 * Erstell Bestellung aus Bestand und Bestellliste
 * @param bestellSheetName Name des Sheets Bestellliste
 * @param bestandSheetName Name des Sheets Bestand
 * @param joinSpalte Eindeutiger Spaltenname zur Bestimmung des Artikels
 * @param istSpalte Spaltenname zur Grösse des Bestandes
 * @param sollSpalte Spaltenname zur Grösse der Kapazität
 * @param sizeSpalte Spaltenname zur Grösse der Verpackungseinheit
 * @returns {[]|string[][]} Die Values zur Bestellung
 * @customfunction
 */
function getShoppingList(bestellSheetName, bestandSheetName, joinSpalte, istSpalte, sollSpalte, sizeSpalte) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    return _getShoppingList(
        ss.getSheetByName(bestellSheetName),
        ss.getSheetByName(bestandSheetName),
        joinSpalte, istSpalte, sollSpalte, sizeSpalte);
}

function _getShoppingList(bestellSheet, bestandSheet, joinSpalte, istSpalte, sollSpalte, sizeSpalte) {
    const bestell = parse(bestellSheet.getDataRange().getValues());
    const bestand = parse(bestandSheet.getDataRange().getValues());

    const shoppingList = _createDiffList(bestell, bestand,
        joinSpalte,
        istSpalte,
        sollSpalte,
        sizeSpalte)

    return inverseParse(shoppingList)
}

function createSheet(sheetName, data) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const newSheet = ss.insertSheet(sheetName)

    for (const row of data) {
        newSheet.appendRow(row)
    }
}

function processForm(parameters) {
    const {bestellSheetName, bestandSheetName, idSpalte, istSpalte, sollSpalte, sizeSpalte} = parameters
    const data = getShoppingList(bestellSheetName, bestandSheetName, idSpalte, istSpalte, sollSpalte, sizeSpalte)
    createSheet("NeueBestellung", data)
    SpreadsheetApp.getUi().alert("Fertig!")
}