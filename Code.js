//import {main} from "./dataOperations.js";

function onOpen() {
    var ui = SpreadsheetApp.getUi();
    // Or DocumentApp or FormApp.

    ui.createMenu('T&T')
        .addItem('Bestellung generieren', 'menuItem1')
        .addItem("HTML-Form", 'menuItem2')
        .addToUi();
}

function menuItem1() {
    const ui = SpreadsheetApp.getUi();

    function prompt(title, content) {
        var response = ui.prompt(title, content, ui.ButtonSet.OK);

        if (response.getSelectedButton() === ui.Button.CANCEL) {
            return null
        }

        return response.getResponseText();
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // BESTAND
    const bestand = ss.getActiveSheet();
    if (ui.alert(bestand.getName() + " als Bestandsliste?", ui.ButtonSet.OK_CANCEL) === ui.Button.CANCEL) return;

    const all_sheets = ss.getSheets().map(s => s.getName());

    // BESTELL
    let res = prompt("Bestellliste", all_sheets.join(", "))
    if (!res) return;
    const bestell = ss.getSheetByName(res);

    // ...
    const columns = []
    const add = s => {
        const headers = s.getRange('1:1').getValues()[0]
        headers.filter(h => h !== "").forEach(h => columns.push(h))
    }
    add(bestand)
    add(bestell)

    // Identifier to join on
    res = prompt("Eindeutiger Name in...", columns.join(', '))
    if (!res) return;
    const joinCol = res


    // IST-MENGE
    res = prompt("Ist-Menge in...", columns.join(', '))
    if (!res) return;
    const istCol = res

    // SOLL-MENGE
    res = prompt("Soll-Menge in...", columns.join(', '))
    if (!res) return;
    const sollCol = res

    // VERPACKUNGSEINHEIT
    res = prompt("Verpackungseinheit in...", columns.join(', '))
    if (!res) return;
    const sizeCol = res

    if (ui.alert("Bestätigung", `Id=${joinCol}\n`
        + `Bestell=${bestell.getName()}:${sollCol}\n`
        + `Bestand=${bestand.getName()}:${istCol}\n`
        + `Einheit=${bestell.getName()}:${sizeCol}\n`,
        ui.ButtonSet.OK_CANCEL) === ui.Button.CANCEL) return;

    ui.alert("Gute Arbeit! Warte kurz...")

    const data = _getShoppingList(bestell, bestand, joinCol, istCol, sollCol, sizeCol)
    createSheet("Neue Bestellung", data)

    ui.alert("Fertig!")
}

function menuItem2() {
    const ui = HtmlService.createTemplateFromFile('prompt.html')

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const all_sheets = ss.getSheets()
    const active = ss.getActiveSheet();

    const colSet = new Set();
    const colDict = {}
    all_sheets.forEach(s => {
        const headers = s.getDataRange().getValues()[0].filter(x => x !== "");
        colDict[s.getName()] = headers;
        headers.forEach(h => colSet.add(h));
    })

    ui.data = {
        active: ss.getActiveSheet().getName(),
        colDict
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

function processForm(bestellSheetName, bestandSheetName, joinSpalte, istSpalte, sollSpalte, sizeSpalte) {
    const data = getShoppingList(bestellSheetName, bestandSheetName, joinSpalte, istSpalte, sollSpalte, sizeSpalte)
    createSheet("NeueBestellung", data)
    SpreadsheetApp.getUi().alert("Fertig!")
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

function hello() {
    const ss = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getName()
    return ss
}