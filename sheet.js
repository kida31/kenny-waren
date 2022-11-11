function getMenu() {
    getMenu_()
}

function processForm_k01(args) {
    processForm_(args)
}

function getMenu_() {
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
    return getShoppingList_(
        ss.getSheetByName(bestellSheetName),
        ss.getSheetByName(bestandSheetName),
        joinSpalte, istSpalte, sollSpalte, sizeSpalte);
}

function getShoppingList_(bestellSheet, bestandSheet, joinSpalte, istSpalte, sollSpalte, sizeSpalte) {
    const bestell = parse_(bestellSheet.getDataRange().getValues());
    const bestand = parse_(bestandSheet.getDataRange().getValues());

    const shoppingList = createDiffList_(bestell, bestand,
        joinSpalte,
        istSpalte,
        sollSpalte,
        sizeSpalte,
        CONFIG.verbose)

    return inverseParse_(shoppingList)
}

function createSheet_(data) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const newSheet = ss.insertSheet()

    for (const row of data) {
        newSheet.appendRow(row)
    }
}


function processForm_(args) {
    const {bestellSheetName, bestandSheetName, idSpalte, istSpalte, sollSpalte, sizeSpalte} = args
    const data = getShoppingList(bestellSheetName, bestandSheetName, idSpalte, istSpalte, sollSpalte, sizeSpalte)
    createSheet_(data)
    SpreadsheetApp.getUi().alert("Fertig!")
}