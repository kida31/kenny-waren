//import 'google-apps-script';

function onOpen() {
    var ui = SpreadsheetApp.getUi();
    // Or DocumentApp or FormApp.
    ui.createMenu('Custom Menu')
    .addItem('First item', 'menuItem1')
    .addSeparator()
    .addSubMenu(ui.createMenu('Sub-menu')
    .addItem('Second item', 'menuItem2'))
    .addToUi();
}

function menuItem1() {
    var sheet = SpreadsheetApp.getActiveSheet();
    var data = sheet.getDataRange().getValues();
    SpreadsheetApp.getUi().alert(`Header: ${data[0]}`)
}

function menuItem2() {
    sheet.appendRow(['Cotton Sweatshirt XL', 'css004']);
}
