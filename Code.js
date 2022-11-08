//import {main} from "./dataOperations.js";

function onOpen() {
    var ui = SpreadsheetApp.getUi();
    // Or DocumentApp or FormApp.

    ui.createMenu('Custom Menu')
        .addItem('Toast', 'menuItem1')
        .addSeparator()
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

    if (ui.alert("Bestätigung",`Id=${joinCol}\n`
        + `Bestell=${bestell.getName()}:${sollCol}\n`
        + `Bestand=${bestand.getName()}:${istCol}\n`
        + `Einheit=${bestell.getName()}:${sizeCol}\n`,
        ui.ButtonSet.OK_CANCEL) === ui.Button.CANCEL) return;

    ui.alert("Gute Arbeit! Warte kurz...")

    const data = getShoppingList(bestell.getName(), bestand.getName(), joinCol, istCol, sollCol, sizeCol)
    createSheet("Neue Bestellung", data)

    ui.alert("Fertig!")
}


function menuItem2() {
    // var widget = HtmlService.createHtmlOutputFromFile("prompt2.html");
    // SpreadsheetApp.getUi().showModalDialog(widget, "Send feedback");

    //var widget = HtmlService.createHtmlOutputFromFile("prompt.html");
    const tmp = HtmlService.createTemplateFromFile("prompt2.html");
    tmp.spreadSheetId = SpreadsheetApp.getActiveSpreadsheet().getId();

    SpreadsheetApp.getUi().showModalDialog(tmp.evaluate(), "Send feedback");
}

/**
 * Erstell Bestellung aus Bestand und Bestellliste
 * @param bestellSheet Name des Sheets Bestellliste
 * @param bestandSheet Name des Sheets Bestand
 * @param joinSpalte Eindeutiger Spaltenname zur Bestimmung des Artikels
 * @param istSpalte Spaltenname zur Grösse des Bestandes
 * @param sollSpalte Spaltenname zur Grösse der Kapazität
 * @param sizeSpalte Spaltenname zur Grösse der Verpackungseinheit
 * @returns {[]|string[][]} Die Values zur Bestellung
 * @customfunction
 */
function getShoppingList(bestellSheet, bestandSheet, joinSpalte, istSpalte, sollSpalte, sizeSpalte) {
    const parseSheet = (sheetName) => {
        const ss = SpreadsheetApp.getActiveSpreadsheet();
        const sheet = ss.getSheetByName(sheetName);
        if (sheet != null) {
            return parse(sheet.getDataRange().getValues());
        }
        throw new Error("Sheet " + sheetName + " not found");
    }

    const DATA = [['Artikel-Nr', 'Artikel Name', 'Verpackungseinheit', 'Kapazität (Einzel)'],
        ['BJ000', 'Trash', '1', '0'],
        ['BJ015', 'Green Apple Syrup', '6', '18'],
        ['BJ028', 'Pineapple Syrup', '6', '20']
    ]

    const BESTAND = [['Artikel Name', 'Ist'],
        ['Green Apple Syrup', '12'],
        ['Pineapple Syrup', '8']
    ]

    let bestell = parse(DATA);
    let bestand = parse(BESTAND);

    bestell = parseSheet(bestellSheet);
    bestand = parseSheet(bestandSheet);


    const shoppingList = _getShoppingList(bestell, bestand,
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

function processForm(form) {
    const {bestellSheet, bestandSheet, joinSpalte, istSpalte, sollSpalte, setSpalte} = form
    if (bestellSheet === undefined || bestandSheet === undefined || joinSpalte === undefined
        || istSpalte === undefined || sollSpalte === undefined || setSpalte === undefined) {
        throw new Error("missing parameters")
    }
    const data = getShoppingList(bestellSheet, bestandSheet, joinSpalte, istSpalte, sollSpalte, setSpalte)
    createSheet("Neue Bestellung", data)

    SpreadsheetApp.getUi().alert("Neues Sheet erstellt. (" + newSheet.getName() + ")");
}